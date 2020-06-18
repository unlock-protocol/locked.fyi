const { ethers } = require('@nomiclabs/buidler')
const provider = ethers.provider

async function deployToken() {
  const [wallet] = await ethers.getSigners()
  const Token = await ethers.getContractFactory('TestToken')
  const token = await Token.deploy()
  console.log(`TestToken address: ${token.address}`)
  await token.deployed()
  await token.mint(wallet, 1)
  console.log(`Test ERC20-token deployed at: ${token.address}`)
  return token.address
}

module.exports = {
  deployToken,
}
