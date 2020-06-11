usePlugin('@nomiclabs/buidler-waffle')
usePlugin('solidity-coverage')

module.exports = {
  defaultNetwork: 'buidlerevm',
  solc: {
    version: '0.5.17',
  },
  networks: {},
  gasReporter: {
    enabled: true,
    currency: 'USD',
  },
}
