const { ethers } = require('@nomiclabs/buidler')
const { BigNumber, constants } = require('ethers')
const { assert } = require('chai')
const UnlockJSON = require('@unlock-protocol/unlock-abi-7/Unlock.json')
const LockJSON = require('@unlock-protocol/unlock-abi-7/PublicLock.json')
const HookJSON = require('../artifacts/BondingCurveHook.json')

const HookABI = HookJSON.abi
const UnlockABI = UnlockJSON.abi
const LockABI = LockJSON.abi
const UnlockBytecode = UnlockJSON.bytecode
const LockBytecode = LockJSON.bytecode
const HookBytecode = HookJSON.bytecode
const provider = ethers.provider

let hook_Address

exports.deployToken = async () => {
  const [wallet, addr1, addr2] = await ethers.getSigners()
  const Token = await ethers.getContractFactory('TestToken', wallet)
  const token = await Token.deploy()
  await token.deployed()
  const walletAddress = await wallet.getAddress()
  const address1 = await addr1.getAddress()
  const address2 = await addr2.getAddress()
  await token.initialize(walletAddress)
  await token.mint(
    walletAddress,
    BigNumber.from(1000).mul('1000000000000000000')
  )
  await token.mint(address1, BigNumber.from(1000).mul('1000000000000000000'))
  await token.mint(address2, BigNumber.from(1000).mul('1000000000000000000'))
  console.log(`Test ERC20-token deployed at: ${token.address}`)
  return token
}

exports.deployHook = async (_supply, _lockAddress) => {
  const [wallet] = await ethers.getSigners()
  const BondingCurveHook = await ethers.getContractFactory(
    HookABI,
    HookBytecode,
    wallet
  )
  // set initial supply > 0 !
  hook = await BondingCurveHook.deploy(_supply, _lockAddress)
  await hook.deployed()
  hook_Address = hook.address
  return hook
}
exports.hookAddress = hook_Address

exports.deployLock = async () => {
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
  console.log(`Lock Template deployed at: ${publicLockAddress}`)
  console.log(`Unlock deployed at: ${unlock.address}`)

  // get the deployed address for the test token
  const token = await this.deployToken()

  // deploy a lock to mimic the real locked.fyi lock:
  tx = await unlock.createLock(
    BigNumber.from(60 * 60 * 24 * 365), // 1 year
    token.address, // TestToken address
    BigNumber.from('100000000000000000'), // 0.1 DAI  (0.1 / 10 ** 18)
    constants.MaxUint256, // Number of Keys
    'Locked-fyi', // Name
    '0x007000000000000000000000' // bytes12 Salt
  )
  receipt = await tx.wait()
  const newLockAddress = receipt.events[0].args.newLockAddress
  console.log(`New Lock deployed at: ${newLockAddress}`)
  const lockedFyiLock = await ethers.getContractAt(LockABI, newLockAddress)
  return [lockedFyiLock, token]
}
