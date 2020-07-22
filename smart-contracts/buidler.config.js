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
  },
  gasReporter: {
    src: './contracts',
    enabled: true,
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
      default: 4,
      1: '0x4011d09a86D0acA8377a4A8baD691F1ACeeCd672',
      4: '0x4011d09a86D0acA8377a4A8baD691F1ACeeCd672',
    },
    lock: {
      default: 4,
      1: '',
      4: '0x616a27F4447E563501630C728F36997A51D59b61',
    },
    tokenManager: {
      default: 4,
      1: '',
      4: '0xd718388e922e5d23e3349dacb5d8a283f63f95e4',
    },
  },
}
