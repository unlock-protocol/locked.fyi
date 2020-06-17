const { ethers } = require('@nomiclabs/buidler')
const { BigNumber, constants } = require('ethers')
// const chai = require('chai')
// chai.use(chaiAsPromised)
const { assert } = require('chai')
const UnlockJSON = require('@unlock-protocol/unlock-abi-7/Unlock.json')
const LockJSON = require('@unlock-protocol/unlock-abi-7/PublicLock.json')
const provider = ethers.provider
const UnlockABI = UnlockJSON.abi
const LockABI = LockJSON.abi
const UnlockBytecode = UnlockJSON.bytecode
const LockBytecode = LockJSON.bytecode
const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'

async function deployLock() {
  const [wallet, lockCreator] = await ethers.getSigners()

  // deploy a Lock and get the address:
  const Lock = await ethers.getContractFactory(LockABI, LockBytecode, wallet)
  const lockTemplate = await Lock.deploy()
  await lockTemplate.deployed()

  // deploy an Unlock and configure it:
  const Unlock = await ethers.getContractFactory(
    UnlockABI,
    UnlockBytecode,
    wallet
  )
  const unlock = await Unlock.deploy()
  await unlock.deployed()
  let ownerAddress = await wallet.getAddress()
  let tx = await unlock.initialize(ownerAddress)
  await tx.wait()
  let unlockOwner = await unlock.owner()
  await unlock.configUnlock(
    'KEY',
    'https://locksmith.unlock-protocol.com/api/key/'
  )

  await unlock.setLockTemplate(lockTemplate.address).then((tx) => {
    tx.wait()
  })
  await tx.wait()
  let publicLockAddress = await unlock.publicLockAddress()
  console.log(`Unlock address: ${unlock.address}`)
  console.log(`template address: ${publicLockAddress}`)
  // deploy a lock to mimic the real locked.fyi lock:

  /**
   * currently fails with "Error: Transaction reverted without a reason"
   * at <UnrecognizedContract>.<unknown> (0x3d3c14cf2551b549fdde1b755735428bd6c41cad)
   * at <UnrecognizedContract>.<unknown> (0x3d3c14cf2551b549fdde1b755735428bd6c41cad)
   * at <UnrecognizedContract>.<unknown> (0x8858eeb3dfffa017d4bce9801d340d36cf895ccf)
   * at process._tickCallback (internal/process/next_tick.js:68:7)
   */
  tx = await unlock.createLock(
    BigNumber.from(60 * 60 * 24 * 365), // 1 year
    DAI_ADDRESS, // DAI  Contract Address
    BigNumber.from('100000000000000000'), // 0.1 DAI  (0.1 / 10 ** 18)
    constants.MaxUint256, // Number of Keys
    'CloneOfLocked.fyi', // Name
    '0x007000000000000000000000' // bytes12 Salt
  )
  console.log(`We're here now...`)
  receipt = await tx.wait()
  console.log(receipt.events)
  return lock.address
}

module.exports = {
  deployLock,
}