const { ethers } = require('@nomiclabs/buidler')
const { BigNumber, constants, utils } = require('ethers')
const {
  deployLock,
  deployHook,
  hookAddress,
  deployToken,
} = require('./setup.js')
const hookJSON = require('../artifacts/BondingCurveHook.json')
const hookABI = hookJSON.abi
const { assert } = require('chai')
const provider = ethers.provider
const DENOMINATOR = Math.pow(2, 64)
const CURVE_MODIFIER = 3.321
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
      console.log(`Denominator (2^64): ${DENOMINATOR}`)
      console.log(`returnedPrice: ${returnedPrice.toString()}`)

      assert.equal(returnedPrice, calculatedPrice)
    })
  })

  describe('Purchasing keys from the lock', () => {
    it.skip('Should buy a key', async () => {
      const [wallet, addr1, addr2, author] = await ethers.getSigners()
      const address1 = await addr1.getAddress()
      const address2 = await addr2.getAddress()
      const authorAddress = await author.getAddress()
      const data = utils.hexlify(authorAddress)
      await lockedFyiLock.purchase(0, address1, ZERO_ADDRESS, data)

      console.log(`priceNumerator: ${priceNumerator.toString()}`)
      const price = fixedPointToDecimal(priceNumerator)
      const calculatedPrice = jsPriceCalculator(supply)
      console.log(`Denom: ${DENOMINATOR}`)
      console.log(`Price: ${price.toString()}`)
      assert.equal(price, calculatedPrice)
    })
  })
})
