const { ethers } = require('@nomiclabs/buidler')
// const { waffle } = require('ethereum-waffle')
const UnlockJSON = require('@unlock-protocol/unlock-abi-7/Unlock.json')
const LockJSON = require('@unlock-protocol/unlock-abi-7/PublicLock.json')
const { MockProvider } = require('ethereum-waffle')
const UnlockABI = UnlockJSON.abi
const LockABI = UnlockJSON.abi
const UnlockBytecode = UnlockJSON.bytecode
const LockBytecode = UnlockJSON.bytecode
const provider = new MockProvider()
// const [wallet, unlockOwner] = ethers.getSigners()

async function main() {
  const [wallet, unlockOwner] = await ethers.getSigners()

  // deploy a Lock and get the address:
  let LockTemplate = new ethers.ContractFactory(LockABI, LockBytecode, wallet)
  let template = await LockTemplate.deploy()
  await template.deployed()
  console.log(`Deployed Lock-Template Contract: ${template.address}`)

  // deploy an Unlock and configure it:
  let Unlock = new ethers.ContractFactory(UnlockABI, UnlockBytecode, wallet)
  let unlock = await Unlock.deploy()
  console.log(`Deployed Unlock Contract: ${unlock.address}`)
  await unlock.deployed()
  // let unlockOwnerAddress = await unlockOwner.getAddress()
  await unlock.initialize(await unlockOwner.getAddress())
  // call unlock.configUnlock !
  await unlock
    .connect(await unlockOwner.address)
    .configUnlock('KEY', 'https://locksmith.unlock-protocol.com/api/key/')
  // call unlock.setLockTemplate ! need deployed lock address...
  // mimic config for deployed locked.fyi-lock

  // create a new lock to use for testing, mimicing the actual deployed lock for Locked.fyi:
  // Params:
  //
  // await unlock.createLock()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
