require('dotenv').config()
usePlugin('buidler-ethers-v5')
usePlugin('solidity-coverage')
// usePlugin('buidler-gas-reporter')
usePlugin('@nomiclabs/buidler-solhint')

// const UnlockJSON = require('@unlock-protocol/unlock-abi-7/Unlock.json')
// const LockJSON = require('@unlock-protocol/unlock-abi-7/PublicLock.json')
// const HookJSON = require('../artifacts/BondingCurveHook.json')
// const HookABI = HookJSON.abi
// const UnlockABI = UnlockJSON.abi
// const LockABI = LockJSON.abi
// const UnlockBytecode = UnlockJSON.bytecode
// const LockBytecode = LockJSON.bytecode
// const HookBytecode = HookJSON.bytecode

// async function artifactProcessor() {
//   return {
//     abi: [],
//     bytecode: '0xabc..',
//   }
// }

module.exports = {
  defaultNetwork: 'buidlerevm',
  networks: {
    localhost: {
      url: 'http://localhost:8545',
    },
  },
  solc: {
    version: '0.5.17',
  },
  gasReporter: {
    src: './contracts',
    enabled: true,
    currency: 'USD',
    excludeContracts: [],
    gasPrice: 5,
    // artifactType: artifactProcessor(),
  },
}
