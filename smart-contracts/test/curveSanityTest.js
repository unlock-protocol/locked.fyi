const { expect } = require('chai')
const DENOMINATOR = Math.pow(2, 64)
const CURVE_MODIFIER = 3.321

let hook

function jsPriceCalculator(s) {
  return Math.log2(s) / CURVE_MODIFIER
}

function fixedPointToDecimal(int128Numerator) {
  return int128Numerator / DENOMINATOR
}

describe('BondingCurveHook', function () {
  it('Should deploy the contract', async function () {
    // look at ethers.getContractFactory ?
    const BondingCurveHook = await ethers.getContractFactory('BondingCurveHook')
    hook = await BondingCurveHook.deploy()

    await hook.deployed()
    expect(await hook.tokenSupply()).to.equal(0)
  })

  it('Should return the correct price', async () => {
    let supply = 10
    await hook.calculateKeyPrice(supply)
    let numerator = await hook.tokenPrice.call()
    let price = fixedPointToDecimal(numerator)
    let calculatedPrice = jsPriceCalculator(supply)
    console.log(`Num: ${numerator}`)
    console.log(`Denom: ${DENOMINATOR}`)
    console.log(`Price: ${price}`)
    expect(price).to.equal(calculatedPrice)
  })
})
