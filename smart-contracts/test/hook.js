const { ethers } = require('@nomiclabs/buidler')
const { BigNumber, constants, utils } = require('ethers')
const { assert } = require('chai')
const hookJSON = require('../artifacts/BondingCurveHook.json')
// const hookJSON = require('../artifacts/MockHook.json')
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers')
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
// const CURVE_MODIFIER = 3.321
const ZERO_ADDRESS = utils.getAddress(
  '0x0000000000000000000000000000000000000000'
)
let walletAddress

function jsPriceCalculator(s) {
  return Math.log2(s) / CURVE_MODIFIER / 10 ** 18
}

function fixedPointToDecimal(int128Numerator) {
  return int128Numerator / DENOMINATOR
}

let hook
let lockedFyiLock
let purchaseHook
let tokenAddress
let deployedHookAddress
let signers
let data

describe('Lock Setup', () => {
  before(async () => {
    const [wallet, addr1, addr2, author] = await ethers.getSigners()
    const authorAddress = await author.getAddress()
    data = utils.hexlify(authorAddress)
    // Get the deployed lock:
    const results = await deployLock()
    lockedFyiLock = results[0]
    tokenAddress = results[1]

    // Get the deployed hook:
    if (hookAddress === undefined) {
      purchaseHook = await deployHook(10, lockedFyiLock.address)
    } else {
      purchaseHook = await ethers.getContractAt(hookABI, hookAddress)
    }

    // Ensure we're using the correct signer:
    walletAddress = await wallet.getAddress()
    assert.isOk(await lockedFyiLock.isLockManager(walletAddress))

    //Register the purchase hook:
    await lockedFyiLock.setEventHooks(
      purchaseHook.address,
      ZERO_ADDRESS //constants.ZeroAddress,
    )
    const returnedHookAddress = await lockedFyiLock.onKeyPurchaseHook()
    assert.equal(returnedHookAddress, purchaseHook.address)
    // Make hook a Lock Manager
    await lockedFyiLock.addLockManager(purchaseHook.address)
    assert.isOk(await lockedFyiLock.isLockManager(purchaseHook.address))

    // Set the beneficiary to the Locked-FYI-DAO address:
    // await lockedFyiLock.updateBeneficiary()
  })

  it('Deploys a correctly configured lock', async () => {
    const version = await lockedFyiLock.publicLockVersion()
    const expirationDuration = await lockedFyiLock.expirationDuration()
    const returnedTokenAddress = await lockedFyiLock.tokenAddress()
    const keyPrice = await lockedFyiLock.keyPrice()
    const numberOfKeys = await lockedFyiLock.maxNumberOfKeys()
    const name = await lockedFyiLock.name()
    const beneficiary = await lockedFyiLock.beneficiary()

    assert.equal(version, 7)
    assert(expirationDuration.eq(BigNumber.from(60 * 60 * 24 * 365)))
    assert.equal(returnedTokenAddress, tokenAddress)
    assert(keyPrice.eq(BigNumber.from('100000000000000000')))
    assert(numberOfKeys.eq(constants.MaxUint256))
    assert.equal(name, 'Locked-fyi')
    // Beneficiary will eventually be the DAO address
    // assert.equal(beneficiary, DAO_ADDRESS)
    assert.equal(beneficiary, walletAddress)
  })

  describe('Calling the hook directly', () => {
    it.skip('returns the correct price from mock function', async () => {
      const supply = await purchaseHook.tokenSupply()
      const price = await purchaseHook.getPrice()
      // const returnedPrice = fixedPointToDecimal(priceNumerator)
      const calculatedPrice = jsPriceCalculator(supply)

      console.log(`supply: ${supply}`)
      console.log(`price: ${(price / 10 ** 18).toString()}`)
      console.log(`calculatedPrice: ${calculatedPrice}`)

      assert.closeTo(
        price,
        calculatedPrice,
        0.0000000000000006,
        'numbers are not close enough'
      )
    })
  })

  describe('Purchasing keys from the lock', () => {
    it('Should buy a key', async function () {
      const [wallet, addr1, addr2, author] = await ethers.getSigners()
      const address1 = await addr1.getAddress()
      const address2 = await addr2.getAddress()
      const authorAddress = await author.getAddress()
      const data = authorAddress
      const priceBefore = await lockedFyiLock.keyPrice()
      console.log(`Original Lock Price from Lock: ${priceBefore / 10 ** 18}`)
      const initialSupply = await purchaseHook.tokenSupply()
      console.log(`Initial Hook supply: ${initialSupply}`)
      const receipt = await lockedFyiLock.purchase(
        0,
        address1,
        ZERO_ADDRESS,
        data
      )
      await receipt.wait(1)
      const supply1 = await purchaseHook.tokenSupply()
      const priceAfter1Purchase = await lockedFyiLock.keyPrice()
      console.log(`supply After 1 Purchase: ${supply1}`)
      console.log(`Price After 1 Purchase: ${priceAfter1Purchase / 10 ** 18}`)
      const hasKey = await lockedFyiLock.getHasValidKey(address1)
      assert.isOk(hasKey)
      const receipt2 = await lockedFyiLock.purchase(
        0,
        address2,
        ZERO_ADDRESS,
        data
      )
      await receipt2.wait()
      const supply2 = await purchaseHook.tokenSupply()
      const priceAfter2Purchases = await lockedFyiLock.keyPrice()
      console.log(`supply After 2 Purchases: ${supply2}`)
      console.log(`Price After 1 Purchase: ${priceAfter2Purchases / 10 ** 18}`)
    })

    it('should increase the price after a purchase', async function () {
      const [wallet, addr1, author] = await ethers.getSigners()
      const address1 = await addr1.getAddress()
      const walletAddress = await wallet.getAddress()
      const authorAddress = await author.getAddress()
      const data = authorAddress
      console.log(`Wallet: ${walletAddress}`)
      console.log(`address1: ${address1}`)
      const priceBefore = await lockedFyiLock.keyPrice()
      await lockedFyiLock.purchase(0, address1, ZERO_ADDRESS, data)
      // await receipt.wait(1)
      const priceAfter = await lockedFyiLock.keyPrice()
      assert(priceAfter.gt(priceBefore))
    })

    it('should increment the supply counter after a purchase', async function () {
      const [wallet, addr1, author] = await ethers.getSigners()
      const address1 = await addr1.getAddress()
      const authorAddress = await author.getAddress()
      const data = authorAddress
      const supplyBefore = await purchaseHook.tokenSupply()
      const tx = await lockedFyiLock.purchase(0, address1, ZERO_ADDRESS, data)
      await tx.wait()
      const supplyAfter = await purchaseHook.tokenSupply()
      assert(supplyAfter.eq(supplyBefore.add(1)))
    })

    it.skip('The price should increase predictably', async function () {})

    it('The price for s=10 should be 1.000...', async function () {
      const [wallet, keyPurchaser] = await ethers.getSigners()
      const s = 9
      purchaseHook = await deployHook(s, lockedFyiLock.address)
      await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
      await lockedFyiLock.addLockManager(purchaseHook.address)
      const keyPurchaserAddress = await keyPurchaser.getAddress()
      await lockedFyiLock.purchase(0, keyPurchaserAddress, ZERO_ADDRESS, data)
      const supply = await purchaseHook.tokenSupply()
      assert.equal(supply, s + 1)
      const lockPrice = await lockedFyiLock.keyPrice()
      const convertedPrice = lockPrice / 10 ** 18
      const expectedPrice = 1.0
      assert.closeTo(
        convertedPrice,
        expectedPrice,
        0.000000000000001,
        'numbers are not close enough'
      )
    })

    it('The price for s=1000 should be 3.00043...', async function () {
      const [wallet, keyPurchaser] = await ethers.getSigners()
      const s = 1000
      purchaseHook = await deployHook(s, lockedFyiLock.address)
      await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
      await lockedFyiLock.addLockManager(purchaseHook.address)
      const keyPurchaserAddress = await keyPurchaser.getAddress()
      await lockedFyiLock.purchase(0, keyPurchaserAddress, ZERO_ADDRESS, data)
      const supply = await purchaseHook.tokenSupply()
      assert.equal(supply, s + 1)
      const lockPrice = await lockedFyiLock.keyPrice()
      const convertedPrice = lockPrice / 10 ** 18
      const expectedPrice = 3.000434077479318
      assert.closeTo(
        convertedPrice,
        expectedPrice,
        0.000000000000001,
        'numbers are not close enough'
      )
    })

    it('The price for s=1000000 should be 6.000...', async function () {
      const [wallet, keyPurchaser] = await ethers.getSigners()
      const s = 1000000
      purchaseHook = await deployHook(s, lockedFyiLock.address)
      await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
      await lockedFyiLock.addLockManager(purchaseHook.address)
      const keyPurchaserAddress = await keyPurchaser.getAddress()
      await lockedFyiLock.purchase(0, keyPurchaserAddress, ZERO_ADDRESS, data)
      const supply = await purchaseHook.tokenSupply()
      assert.equal(supply, s + 1)
      const lockPrice = await lockedFyiLock.keyPrice()
      const convertedPrice = lockPrice / 10 ** 18
      const expectedPrice = 6.000000434294264
      assert.closeTo(
        convertedPrice,
        expectedPrice,
        0.000000000000001,
        'numbers are not close enough'
      )
    })

    it('The price for s=1000000000 should be 9.000...', async function () {
      const [wallet, keyPurchaser] = await ethers.getSigners()
      const s = 1000000000
      purchaseHook = await deployHook(s, lockedFyiLock.address)
      await lockedFyiLock.setEventHooks(purchaseHook.address, ZERO_ADDRESS)
      await lockedFyiLock.addLockManager(purchaseHook.address)
      const keyPurchaserAddress = await keyPurchaser.getAddress()
      await lockedFyiLock.purchase(0, keyPurchaserAddress, ZERO_ADDRESS, data)
      const supply = await purchaseHook.tokenSupply()
      assert.equal(supply, s + 1)
      const lockPrice = await lockedFyiLock.keyPrice()
      const convertedPrice = lockPrice / 10 ** 18
      const expectedPrice = 9.000000000434293
      assert.closeTo(
        convertedPrice,
        expectedPrice,
        0.000000000000001,
        'numbers are not close enough'
      )
    })

    it.skip('Should fail if...', async function () {})
  })
})
