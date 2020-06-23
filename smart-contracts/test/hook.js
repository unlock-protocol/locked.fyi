const { ethers } = require('@nomiclabs/buidler')
const { BigNumber, constants, utils } = require('ethers')
const { assert } = require('chai')
const hookJSON = require('../artifacts/BondingCurveHook.json')
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
  return Math.log2(s) / CURVE_MODIFIER
}

function fixedPointToDecimal(int128Numerator) {
  return int128Numerator / DENOMINATOR
}

// async function findEvents(contract, event, blockHash) {
//   const filter = contract.filters[event]()
//   const events = await contract.queryFilter(filter, blockHash)
//   return events
// }

// async function waitFor(p) {
//   p.then((tx) => tx.wait())
// }

let hook
let lockedFyiLock
let purchaseHook
let tokenAddress
let deployedHookAddress

describe('Lock Setup', () => {
  before(async () => {
    const [wallet] = await ethers.getSigners()
    // Get the deployed lock:
    const results = await deployLock()
    lockedFyiLock = results[0]
    tokenAddress = results[1]

    // Get the deployed hook:
    if (hookAddress === undefined) {
      purchaseHook = await deployHook(lockedFyiLock.address)
    } else {
      purchaseHook = await ethers.getContractAt(hookABI, hookAddress)
    }

    // Ensure we're using the correct signer:
    walletAddress = await wallet.getAddress()
    assert.isOk(await lockedFyiLock.isLockManager(walletAddress))

    //Register the purchase hook:
    const receipt = await lockedFyiLock.setEventHooks(
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
    it('returns the correct price from mock function', async () => {
      const supply = await purchaseHook.tokenSupply()
      const priceNumerator = await purchaseHook.getPrice()
      const returnedPrice = fixedPointToDecimal(priceNumerator)
      const calculatedPrice = jsPriceCalculator(supply)

      console.log(`supply: ${supply}`)
      console.log(`priceNumerator: ${priceNumerator.toString()}`)
      console.log(`returnedPrice: ${returnedPrice.toString()}`)

      assert.closeTo(
        returnedPrice,
        calculatedPrice,
        0.0000000000000006,
        'numbers are not close enough'
      )
    })
  })

  describe('Purchasing keys from the lock', () => {
    it('Should buy a key', async () => {
      const [wallet, addr1, addr2, author] = await ethers.getSigners()
      const address1 = await addr1.getAddress()
      const address2 = await addr2.getAddress()
      const authorAddress = await author.getAddress()
      const data = utils.hexlify(authorAddress)

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
      console.log(`Price After 1 Purchase: ${priceAfter1Purchase}`) // should be 1.04139...
      // actual: p=19210304343346962330 (p / 2**64 = 1.041392685158225)

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
      console.log(`Price After 1 Purchase: ${priceAfter2Purchases}`) // should be 1.07918...
      // actual: p=19907380254987510307 (p / 2**64 = 1.079181246047625)
    })

    it('should increase the price after a purchase', async () => {
      const [wallet, addr1, author] = await ethers.getSigners()
      const address1 = await addr1.getAddress()
      const authorAddress = await author.getAddress()
      const data = utils.hexlify(authorAddress)
      const priceBefore = await lockedFyiLock.keyPrice()
      await lockedFyiLock.purchase(0, address1, ZERO_ADDRESS, data)
      // await receipt.wait(1)
      const priceAfter = await lockedFyiLock.keyPrice()
      assert(priceAfter.gt(priceBefore))
    })

    it('should increment the supply counter after a purchase', async () => {
      const [wallet, addr1, author] = await ethers.getSigners()
      const address1 = await addr1.getAddress()
      const authorAddress = await author.getAddress()
      const data = utils.hexlify(authorAddress)
      const supplyBefore = await purchaseHook.tokenSupply()
      const tx = await lockedFyiLock.purchase(0, address1, ZERO_ADDRESS, data)
      await tx.wait()
      const supplyAfter = await purchaseHook.tokenSupply()
      assert(supplyAfter.eq(supplyBefore.add(1)))
    })

    it.skip('The price should increase predictably', async () => {})

    it.skip('Should fail if anyone but the hook trys to change the price', async () => {})
    it.skip('Should fail if...', async () => {})
  })
})
