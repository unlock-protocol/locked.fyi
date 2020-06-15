const { ethers } = require('@nomiclabs/buidler')
const { BigNumber, constants } = require('ethers')
// const { assert } = require('chai-local')
const assert = require('assert')
const UnlockJSON = require('@unlock-protocol/unlock-abi-7/Unlock.json')
const LockJSON = require('@unlock-protocol/unlock-abi-7/PublicLock.json')
const provider = ethers.provider
const UnlockABI = UnlockJSON.abi
const LockABI = LockJSON.abi
const UnlockBytecode = UnlockJSON.bytecode
const LockBytecode = LockJSON.bytecode

describe('Lock Setup', () => {
  before(async () => {
    const [wallet] = await ethers.getSigners()

    // deploy a Lock and get the address:
    const Lock = await ethers.getContractFactory(LockABI, LockBytecode, wallet)
    const lockTemplate = await Lock.deploy()
    await lockTemplate.deployed()
    console.log(`Deployed Lock-Template Contract: ${lockTemplate.address}`)

    // deploy an Unlock and configure it:
    const Unlock = await ethers.getContractFactory(
      UnlockABI,
      UnlockBytecode,
      wallet
    )
    const unlock = await Unlock.deploy()
    await unlock.deployed()
    console.log(`Deployed Unlock Contract: ${unlock.address}`)
    let ownerAddress = await wallet.getAddress()
    console.log(`wallet: ${ownerAddress}`)
    let tx = await unlock.initialize(ownerAddress)
    await tx.wait()
    let unlockOwner = await unlock.owner()
    console.log(`Owner: ${unlockOwner}`)
    await unlock.configUnlock(
      'KEY',
      'https://locksmith.unlock-protocol.com/api/key/'
    )

    console.log(`Here 4`)

    await unlock.setLockTemplate(lockTemplate.address).then((tx) => {
      tx.wait()
    })
    await tx.wait()
    console.log(`Here 5`)
    let publicLockAddress = await unlock.publicLockAddress()
    console.log(`publicLockAddress: ${publicLockAddress}`)

    // deploy a lock to mimic the real locked.fyi lock:
    tx = await unlock.createLock(
      BigNumber.from(60 * 60 * 24 * 365), // 1 year
      '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI  Contract Address
      BigNumber.from('100000000000000000'), // 0.1 DAI  (0.1 / 10 ** 18)
      constants.MaxUint256, // Number of Keys
      'CloneOfLocked.fyi', // Name
      '0x777777777777777777777777' // bytes12 Salt
    )
    receipt = await tx.wait()
    console.log(receipt.events)
  })

  it('Deployed a lock', async () => {
    assert.equal(1, 1)
  })
})
