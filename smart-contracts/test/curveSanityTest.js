const { ethers } = require('@nomiclabs/buidler')
const { assert } = require('chai')

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
    const BondingCurveHook = await ethers.getContractFactory('BondingCurveHook')
    hook = await BondingCurveHook.deploy()
    await hook.deployed()
  })

  it('Should return the correct price', async () => {
    const supply = 10
    const tx = await hook.calculateKeyPrice(supply)
    const receipt = await tx.wait(1)
    console.log(`New Price: ${receipt.events[0].args._newPrice.toString()}`)
    const numerator = await hook.tokenPrice.call()
    const price = fixedPointToDecimal(numerator)
    const calculatedPrice = jsPriceCalculator(supply)
    console.log(`Num: ${numerator}`)
    console.log(`Denom: ${DENOMINATOR}`)
    console.log(`Price: ${price}`)
    assert.equal(price, calculatedPrice)
  })
})
