const { ethers } = require('@nomiclabs/buidler')
const { BigNumber, constants } = require('ethers')
const {
  deployLock,
  deployHook,
  hookAddress,
  deployToken,
} = require('./fixtures.js')
const hookJSON = require('../artifacts/BondingCurveHook.json')
const hookABI = hookJSON.abi
const { assert } = require('chai')
const provider = ethers.provider

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
      purchaseHook = await deployHook()
    } else {
      purchaseHook = await ethers.getContractAt(hookABI, hookAddress)
    }

    // Ensure we're using the correct signer:
    let walletAddress = await wallet.getAddress()
    assert.isOk(await lockedFyiLock.isLockManager(walletAddress))

    // Register the purchase hook:
    // const receipt = await lockedFyiLock.setEventHooks(
    //   constants.ZeroAddress,
    //   purchaseHook.address
    // )
    // await receipt.wait()

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
    // assert.equal(beneficiary, <DAO Address Here>)
  })
})
