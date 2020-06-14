// const { ethers } = require('@nomiclabs/buidler')
// // const { waffle } = require('ethereum-waffle')
// const UnlockJSON = require('@unlock-protocol/unlock-abi-7/Unlock.json')
// const { MockProvider, loadFixture, deployContract } = require('ethereum-waffle')
// const UnlockABI = UnlockJSON.abi
// const UnlockBytecode = UnlockJSON.bytecode
// const [wallet, unlockOwner] = new MockProvider().getWallets()

// describe('Fixtures', () => {
//   async function Lock(provider, [wallet, other]) {
//     let factory = new ethers.ContractFactory(UnlockABI, UnlockBytecode, wallet)
//     let Unlock = await factory.deploy()
//     await Unlock.deployed()
//     console.log(`Deployed Unlock Contract: ${Unlock.address}`)
//     // let UnlockAddress = '0xA193E42526F1FEA8C99AF609dcEabf30C1c29fAA'
//     let unlock = new ethers.Contract(Unlock.address, UnlockABI, provider)
//     await unlock.initialize(unlockOwner)
//     // const lock =
//     // return { lock }
//   }
// })

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error)
//     process.exit(1)
//   })
