const { ethers } = require('@nomiclabs/buidler')
const { assert } = require('chai')
const { constants, utils } = require('ethers')
const { deployHook } = require('./fixtures.js')

const DENOMINATOR = Math.pow(2, 64)
const CURVE_MODIFIER = 3.321

let hook

function jsPriceCalculator(s) {
  return Math.log2(s) / CURVE_MODIFIER
}

function fixedPointToDecimal(int128Numerator) {
  return int128Numerator / DENOMINATOR
}

describe('BondingCurveHook', () => {
  before(async () => {
    hook = await deployHook()
    console.log(`Hook address after deploy: ${hook.address}`)
  })

  it('Should return the correct price', async () => {
    const [wallet, address1, address2] = await ethers.getSigners()
    const data = ['0x00']
    const tx = await hook.keyPurchasePrice(
      address1,
      address1,
      constants.ZeroAddress,
      data
    )
    const receipt = await tx.wait()
    console.log(`Supply: ${receipt.events[0].args._supply.toString()}`)
    console.log(`Price: ${receipt.events[1].args._price.toString()}`)
    const numerator = await hook.tokenPrice.call()
    const price = fixedPointToDecimal(numerator)
    const calculatedPrice = jsPriceCalculator(supply)
    console.log(`Num: ${numerator}`)
    console.log(`Denom: ${DENOMINATOR}`)
    console.log(`Price: ${price}`)
    assert.equal(price, calculatedPrice)
  })
})
