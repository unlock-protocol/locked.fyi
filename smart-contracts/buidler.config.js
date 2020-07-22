require('dotenv').config()
usePlugin('buidler-ethers-v5')
usePlugin('solidity-coverage')
// usePlugin('buidler-gas-reporter')
usePlugin('@nomiclabs/buidler-solhint')
usePlugin('@nomiclabs/buidler-etherscan')

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
  },
  etherscan: {
    url: 'https://api-RINKEBY.etherscan.io/api',
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
}
