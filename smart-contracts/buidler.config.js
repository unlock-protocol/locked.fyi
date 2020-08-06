require('dotenv').config()
usePlugin('buidler-ethers-v5')
usePlugin('solidity-coverage')
// usePlugin('buidler-gas-reporter')
usePlugin('@nomiclabs/buidler-solhint')
usePlugin('@nomiclabs/buidler-etherscan')
usePlugin('buidler-deploy')

const mnemonic = process.env.MNEMONIC

if (!mnemonic || mnemonic === '') {
  throw new Error(`environment variable "MNEMONIC" not configured `)
}

const accounts = mnemonic
  ? {
      mnemonic,
    }
  : undefined

module.exports = {
  defaultNetwork: 'buidlerevm',
  networks: {
    localhost: {
      url: 'http://localhost:8545',
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/459caf4344dc4bd8a235559b3c4ee972',
      accounts,
    },
  },
  solc: {
    version: '0.5.17',
    optimizer: {
      enabled: false,
      runs: 200,
    },
    evmVersion: 'istanbul',
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  gasReporter: {
    src: './contracts',
    enabled: false,
    currency: 'USD',
    excludeContracts: [],
    gasPrice: 5,
  },
  etherscan: {
    url: 'https://api-RINKEBY.etherscan.io/api',
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: '',
      4: process.env.DEPLOYER,
    },
    lock: {
      default: 1,
      1: '0xaad5Bff48e1534EF1f2f0A4184F5C2E61aC47EC3',
      4: '0x4eacB8C1C3925B4C7276a7f517ad3B7A8Aa5c831',
    },
    hook: {
      default: 2,
      1: '', // undeployed
      4: '0x556a52cEAbFB97BEf93a7f1CcE7f1f49d058D80E',
    },
    tokenManager: {
      default: 3,
      1: '', // undeployed
      4: '0xea123bda945ff925ff8db19b7e108dfe8f632df5',
    },
  },
}
