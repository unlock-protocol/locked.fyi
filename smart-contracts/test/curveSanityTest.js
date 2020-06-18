const { ethers } = require('@nomiclabs/buidler')
const { assert } = require('chai')
const { constants, utils } = require('ethers')
const { deployHook, hookAddress } = require('./fixtures.js')
const hookJSON = require('../artifacts/BondingCurveHook.json')
const hookABI = hookJSON.abi

const DENOMINATOR = Math.pow(2, 64)
const CURVE_MODIFIER = 3.321

let hook
let deployedHookAddress

function jsPriceCalculator(s) {
  return Math.log2(s) / CURVE_MODIFIER
}

function fixedPointToDecimal(int128Numerator) {
  return int128Numerator / DENOMINATOR
}

describe('BondingCurveHook', () => {
  before(async () => {
    if (hookAddress === undefined) {
      hook = await deployHook()
      // deployedHookAddress = hook.address
    } else {
      hook = await ethers.getContractAt(hookABI, hookAddress)
    }
  })

  it('Should return the correct price', async () => {
    const [wallet, addr1, addr2, author] = await ethers.getSigners()
    const address1 = await addr1.getAddress()
    const address2 = await addr2.getAddress()
    const authorAddress = await author.getAddress()
    const data = utils.hexlify(authorAddress)
    const supply = await hook.tokenSupply()
    const priceNumerator = await hook.keyPurchasePrice(
      address1,
      address1,
      address1,
      data
    )
    console.log(`priceNumerator: ${priceNumerator.toString()}`)
    const price = fixedPointToDecimal(priceNumerator)
    const calculatedPrice = jsPriceCalculator(supply)
    console.log(`Denom: ${DENOMINATOR}`)
    console.log(`Price: ${price.toString()}`)
    assert.equal(price, calculatedPrice)
  })
})
