const { ethers } = require('@nomiclabs/buidler')
const { BigNumber, constants, utils } = require('ethers')
const { assert } = require('chai')
const hookJSON = require('../artifacts/BondingCurveHook.json')
const { expectRevert } = require('@openzeppelin/test-helpers')
const {
  deployLock,
  deployHook,
  hookAddress,
  deployToken,
} = require('./setup.js')

const hookABI = hookJSON.abi
const provider = ethers.provider
const DENOMINATOR = Math.pow(2, 64)
const CURVE_MODIFIER = 3.321928094887362
const ZERO_ADDRESS = utils.getAddress(
  '0x0000000000000000000000000000000000000000'
)
// temp rinkeby address
const DAO_ADDRESS = utils.getAddress(
  '0xb76897aac03a9769f94982e3ca5bd72874aa5ca7'
)

function jsPriceCalculator(s) {
  return Math.log2(s) / CURVE_MODIFIER / 10 ** 18
}

function fixedPointToDecimal(int128Numerator) {
  return int128Numerator / DENOMINATOR
}

const waitFor = (p) => p.then((tx) => tx.wait())

let hook
let lockedFyiLock
let purchaseHook
let tokenAddress
let deployedHookAddress
let signers
let data
let walletAddress
let token

describe('Lock Setup', () => {
  before(async () => {
    const [wallet, addr1, addr2, author] = await ethers.getSigners()
    const authorAddress = await author.getAddress()
    data = utils.hexlify(authorAddress)
    const results = await deployLock()
    lockedFyiLock = results[0]
    token = results[1]

    if (hookAddress === undefined) {
      purchaseHook = await deployHook(10, lockedFyiLock.address)
    } else {
      purchaseHook = await ethers.getContractAt(hookABI, hookAddress)
    }

    walletAddress = await wallet.getAddress()
    await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
    await lockedFyiLock.addLockManager(purchaseHook.address)
    await lockedFyiLock.updateBeneficiary(DAO_ADDRESS)
  })

  it('Deploys a correctly configured lock', async () => {
    const version = await lockedFyiLock.publicLockVersion()
    const expirationDuration = await lockedFyiLock.expirationDuration()
    const returnedTokenAddress = await lockedFyiLock.tokenAddress()
    const keyPrice = await lockedFyiLock.keyPrice()
    const numberOfKeys = await lockedFyiLock.maxNumberOfKeys()
    const name = await lockedFyiLock.name()
    const beneficiary = await lockedFyiLock.beneficiary()
    const returnedHookAddress = await lockedFyiLock.onKeyPurchaseHook()

    assert.equal(version, 7)
    assert(expirationDuration.eq(BigNumber.from(60 * 60 * 24 * 365)))
    assert.equal(returnedTokenAddress, token.address)
    assert(keyPrice.eq(BigNumber.from('100000000000000000')))
    assert(numberOfKeys.eq(constants.MaxUint256))
    assert.equal(name, 'Locked-fyi')
    assert.isOk(await lockedFyiLock.isLockManager(walletAddress))
    assert.equal(returnedHookAddress, purchaseHook.address)
    assert.isOk(await lockedFyiLock.isLockManager(purchaseHook.address))
    assert.equal(beneficiary, DAO_ADDRESS)
  })

  it('Can still buy a key', async function () {
    const [wallet, addr1, addr2, author] = await ethers.getSigners()
    const walletAddress = await wallet.getAddress()
    const address1 = await addr1.getAddress()
    const address2 = await addr2.getAddress()
    const balanceBefore = await token.balanceOf(address1)
    const lockBalanceBefore = await token.balanceOf(lockedFyiLock.address)
    await token
      .connect(addr1)
      .approve(
        lockedFyiLock.address,
        BigNumber.from(1000).mul('1000000000000000000')
      )
    const data = await author.getAddress()
    const priceBefore = await lockedFyiLock.keyPrice()
    const initialSupply = await purchaseHook.tokenSupply()
    const keyPrice = await lockedFyiLock.keyPrice()
    const tx = await lockedFyiLock
      .connect(addr1)
      .purchase(keyPrice, address1, ZERO_ADDRESS, data)
    const receipt = await tx.wait()
    const balanceAfter = await token.balanceOf(address1)
    const lockBalanceAfter = await token.balanceOf(lockedFyiLock.address)
    console.log(`Gas -first purchase w/price update: ${receipt.gasUsed}`)
    const hasKey = await lockedFyiLock.getHasValidKey(address1)
    assert.isOk(hasKey)
    assert(balanceAfter.lte(balanceBefore))
    assert(lockBalanceAfter.gte(lockBalanceBefore))
  })

  it('deploys a correctly configured hook', async function () {
    const lockAddress = await purchaseHook.lockAddress()
    assert.equal(lockAddress, lockedFyiLock.address)
  })

  it('should increment the supply counter after a purchase', async function () {
    const [wallet, addr1, author] = await ethers.getSigners()
    const address1 = await addr1.getAddress()
    const authorAddress = await author.getAddress()
    const data = authorAddress
    const supplyBefore = await purchaseHook.tokenSupply()
    const keyPrice = await lockedFyiLock.keyPrice()
    await lockedFyiLock
      .connect(addr1)
      .purchase(keyPrice, address1, ZERO_ADDRESS, data)
    const supplyAfter = await purchaseHook.tokenSupply()
    assert(supplyAfter.eq(supplyBefore.add(1)))
  })
})

describe('Benchmark prices', () => {
  it('The price for s=10 should be 1.000...', async function () {
    const [wallet, keyPurchaser] = await ethers.getSigners()
    const s = 9
    purchaseHook = await deployHook(s, lockedFyiLock.address)
    await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
    await lockedFyiLock.addLockManager(purchaseHook.address)
    const keyPurchaserAddress = await keyPurchaser.getAddress()
    const keyPrice = await lockedFyiLock.keyPrice()
    await lockedFyiLock
      .connect(keyPurchaser)
      .purchase(keyPrice, keyPurchaserAddress, ZERO_ADDRESS, data)
    const supply = await purchaseHook.tokenSupply()
    const lockPrice = await lockedFyiLock.keyPrice()
    const convertedPrice = lockPrice / 10 ** 18
    const expectedPrice = 1.0

    assert.equal(supply, s + 1)
    assert.equal(convertedPrice, expectedPrice)
  })

  it('The price for s=1000 should be 3.000...', async function () {
    const [wallet, keyPurchaser] = await ethers.getSigners()
    const s = 999
    purchaseHook = await deployHook(s, lockedFyiLock.address)
    await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
    await lockedFyiLock.addLockManager(purchaseHook.address)
    const keyPurchaserAddress = await keyPurchaser.getAddress()
    const keyPriceBefore = await lockedFyiLock.keyPrice()
    await lockedFyiLock
      .connect(keyPurchaser)
      .purchase(keyPriceBefore, keyPurchaserAddress, ZERO_ADDRESS, data)
    const supply = await purchaseHook.tokenSupply()
    const keyPriceAfter = await lockedFyiLock.keyPrice()
    const convertedPrice = keyPriceAfter / 10 ** 18
    const expectedPrice = 3.0

    assert.equal(supply, s + 1)
    assert.equal(convertedPrice, expectedPrice)
  })

  it('The price for s=1000000 should be 6.000...', async function () {
    const [wallet, keyPurchaser] = await ethers.getSigners()
    const s = 999999
    purchaseHook = await deployHook(s, lockedFyiLock.address)
    await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
    await lockedFyiLock.addLockManager(purchaseHook.address)
    const keyPurchaserAddress = await keyPurchaser.getAddress()
    const keyPriceBefore = await lockedFyiLock.keyPrice()
    await lockedFyiLock
      .connect(keyPurchaser)
      .purchase(keyPriceBefore, keyPurchaserAddress, ZERO_ADDRESS, data)
    const supply = await purchaseHook.tokenSupply()
    const keyPriceAfter = await lockedFyiLock.keyPrice()
    const convertedPrice = keyPriceAfter / 10 ** 18
    const expectedPrice = 6.0

    assert.equal(supply, s + 1)
    assert.equal(convertedPrice, expectedPrice)
  })

  it('The price for s=1000000000 should be 9.000...', async function () {
    const [wallet, keyPurchaser] = await ethers.getSigners()
    const s = 999999999
    purchaseHook = await deployHook(s, lockedFyiLock.address)
    await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
    await lockedFyiLock.addLockManager(purchaseHook.address)
    const keyPurchaserAddress = await keyPurchaser.getAddress()
    const keyPriceBefore = await lockedFyiLock.keyPrice()
    await lockedFyiLock
      .connect(keyPurchaser)
      .purchase(keyPriceBefore, keyPurchaserAddress, ZERO_ADDRESS, data)
    const supply = await purchaseHook.tokenSupply()
    const keyPriceAfter = await lockedFyiLock.keyPrice()
    const convertedPrice = keyPriceAfter / 10 ** 18
    const expectedPrice = 9.0

    assert.equal(supply, s + 1)
    assert.equal(convertedPrice, expectedPrice)
  })
})

describe('Price Rounding', () => {
  it('The price for s=11 should be rounded to 1.1', async function () {
    const [wallet, keyPurchaser] = await ethers.getSigners()
    const s = 11
    purchaseHook = await deployHook(s, lockedFyiLock.address)
    await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
    await lockedFyiLock.addLockManager(purchaseHook.address)
    const keyPurchaserAddress = await keyPurchaser.getAddress()
    const keyPriceBefore = await lockedFyiLock.keyPrice()
    await lockedFyiLock
      .connect(keyPurchaser)
      .purchase(keyPriceBefore, keyPurchaserAddress, ZERO_ADDRESS, data)
    const supply = await purchaseHook.tokenSupply()
    const keyPriceAfter = await lockedFyiLock.keyPrice()
    const convertedPrice = keyPriceAfter / 10 ** 18
    const expectedPrice = 1.1

    assert.equal(supply, s + 1)
    assert.equal(convertedPrice, expectedPrice)
  })

  it('The price for s=3 should be rounded to 0.5', async function () {
    const [wallet, keyPurchaser] = await ethers.getSigners()
    const s = 2
    purchaseHook = await deployHook(s, lockedFyiLock.address)
    await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
    await lockedFyiLock.addLockManager(purchaseHook.address)
    const keyPurchaserAddress = await keyPurchaser.getAddress()
    const keyPriceBefore = await lockedFyiLock.keyPrice()
    const tx = await lockedFyiLock
      .connect(keyPurchaser)
      .purchase(keyPriceBefore, keyPurchaserAddress, ZERO_ADDRESS, data)
    const receipt = await tx.wait()
    const events = receipt.events
    const supply = await purchaseHook.tokenSupply()
    const keyPriceAfter = await lockedFyiLock.keyPrice()
    const convertedPrice = keyPriceAfter / 10 ** 18
    const expectedPrice = 0.5

    assert.equal(supply, s + 1)
    assert.equal(convertedPrice, expectedPrice)
  })

  it('The price for s=35 should be rounded to 1.5', async function () {
    const [wallet, keyPurchaser] = await ethers.getSigners()
    const s = 34
    purchaseHook = await deployHook(s, lockedFyiLock.address)
    await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
    await lockedFyiLock.addLockManager(purchaseHook.address)
    const keyPurchaserAddress = await keyPurchaser.getAddress()
    const keyPriceBefore = await lockedFyiLock.keyPrice()
    const tx = await lockedFyiLock
      .connect(keyPurchaser)
      .purchase(keyPriceBefore, keyPurchaserAddress, ZERO_ADDRESS, data)
    const receipt = await tx.wait()
    const supply = await purchaseHook.tokenSupply()
    const keyPriceAfter = await lockedFyiLock.keyPrice()
    const convertedPrice = keyPriceAfter / 10 ** 18
    const expectedPrice = 1.5

    assert.equal(supply, s + 1)
    assert.equal(convertedPrice, expectedPrice)
  })

  it('The price for s=36 should be rounded to 1.6', async function () {
    const [wallet, keyPurchaser] = await ethers.getSigners()
    const s = 35
    purchaseHook = await deployHook(s, lockedFyiLock.address)
    await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
    await lockedFyiLock.addLockManager(purchaseHook.address)
    const keyPurchaserAddress = await keyPurchaser.getAddress()
    const keyPriceBefore = await lockedFyiLock.keyPrice()
    const tx = await lockedFyiLock
      .connect(keyPurchaser)
      .purchase(keyPriceBefore, keyPurchaserAddress, ZERO_ADDRESS, data)
    const txResponse = await tx.wait()
    const receipt = await ethers.provider.getTransactionReceipt(
      txResponse.transactionHash
    )
    const supply = await purchaseHook.tokenSupply()
    const keyPriceAfter = await lockedFyiLock.keyPrice()
    const convertedPrice = keyPriceAfter / 10 ** 18
    const expectedPrice = 1.6

    assert.equal(supply, s + 1)
    assert.equal(convertedPrice, expectedPrice)
  })

  it('should update the price when rounded price steps up', async function () {
    const [wallet, keyPurchaser, keyPurchaser2] = await ethers.getSigners()
    const s = 34
    purchaseHook = await deployHook(s, lockedFyiLock.address)
    await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
    await lockedFyiLock.addLockManager(purchaseHook.address)
    const keyPurchaserAddress = await keyPurchaser.getAddress()
    const balanceBefore = await keyPurchaser.getBalance()
    console.log(`balance1: ${balanceBefore / 10 ** 18}`)
    const keyPurchaser2Address = await keyPurchaser2.getAddress()
    const keyPrice1 = await lockedFyiLock.keyPrice()

    await lockedFyiLock
      .connect(keyPurchaser)
      .purchase(keyPrice1, keyPurchaserAddress, ZERO_ADDRESS, data)

    const balanceAfter = await keyPurchaser.getBalance()
    console.log(`balance2: ${balanceAfter / 10 ** 18}`)
    const hasKey = await lockedFyiLock.getHasValidKey(keyPurchaserAddress)
    assert.isOk(hasKey)
    const keyPrice2 = await lockedFyiLock.keyPrice()

    const tx = await lockedFyiLock
      .connect(keyPurchaser)
      .purchase(keyPrice2, keyPurchaserAddress, ZERO_ADDRESS, data)

    const keyPrice3 = await lockedFyiLock.keyPrice()

    const tx2 = await lockedFyiLock
      .connect(keyPurchaser2)
      .purchase(keyPrice3, keyPurchaser2Address, ZERO_ADDRESS, data)

    const receipt = await tx.wait()
    const receipt2 = await tx2.wait()
    console.log(`Gas:Key ext w/price update,: ${receipt.gasUsed}`)
    console.log(`Gas:First key w/price update : ${receipt2.gasUsed}`)
    const foundEvents = receipt.events.filter(
      (l) => l.event === 'PricingChanged'
    )
    assert.equal(foundEvents.length, 1)
  })

  it('should NOT update the price when rounded price is unchanged', async function () {
    const [
      wallet,
      keyPurchaser,
      keyPurchaser2,
      keyPurchaser3,
    ] = await ethers.getSigners()
    const s = 30
    purchaseHook = await deployHook(s, lockedFyiLock.address)
    await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
    await lockedFyiLock.addLockManager(purchaseHook.address)
    const keyPurchaserAddress = await keyPurchaser.getAddress()
    const keyPurchaser3Address = await keyPurchaser3.getAddress()
    await lockedFyiLock.purchase(0, keyPurchaserAddress, ZERO_ADDRESS, data)
    const tx = await lockedFyiLock.purchase(
      0,
      keyPurchaserAddress,
      ZERO_ADDRESS,
      data
    )
    const hasKey = await lockedFyiLock.getHasValidKey(keyPurchaser3Address)
    assert.isNotOk(hasKey)
    const tx2 = await lockedFyiLock.purchase(
      0,
      keyPurchaser3Address,
      ZERO_ADDRESS,
      data
    )
    const receipt = await tx.wait()
    const receipt2 = await tx2.wait()
    console.log(`Gas- No price update, key extension: ${receipt.gasUsed}`)
    console.log(`Gas- No price update, first key: ${receipt2.gasUsed}`)
    const foundEvents = receipt.events.filter(
      (l) => l.event === 'PricingChanged'
    )

    assert.equal(foundEvents.length, 0)
  })
})

describe('Security', () => {
  // it('Should fail if anyone but the lock calls onKeyPurchase', async function () {
  //   await expectRevert(purchaseHook.onKeyPurchase(), 'UNAUTHORIZED_ACCESS')
  // })

  it.skip('Should fail if anyone but the lock calls onKeyPurchase', async function () {
    const [wallet, addr1, author] = await ethers.getSigners()
    const address1 = await addr1.getAddress()
    const authorAddress = await author.getAddress()
    const data = authorAddress
    await purchaseHook.onKeyPurchase(
      address1,
      address1,
      ZERO_ADDRESS,
      data,
      0,
      0
    ) // Error: VM Exception while processing transaction: revert UNAUTHORIZED_ACCESS

    // Not working (no support for buidlerevm). Find alternate implementation.
    // await expectRevert(
    //   purchaseHook.onKeyPurchase(address1, address1, ZERO_ADDRESS, data, 0, 0),
    //   'UNAUTHORIZED_ACCESS'
    // )
  })
})
