const { expect } = require('chai')
const DENOMINATOR = Math.pow(2, 64)
const CURVE_MODIFIER = 3.321
const { loadFixture, deployContract, provider } = require('ethereum-waffle')
// const BondingCurveHook = require('../artifacts/BondingCurveHook')

let hook

function jsPriceCalculator(s) {
  return Math.log2(s) / CURVE_MODIFIER
}

function fixedPointToDecimal(int128Numerator) {
  return int128Numerator / DENOMINATOR
}

// import { loadFixture, deployContract } from 'ethereum-waffle'

// async function deployHook(provider, [wallet, other]) {
//   const hook = await deployContract(BondingCurveHook)
//   return { hook, wallet, other }
// }

// const { hook } = await loadFixture(deployHook)

describe('BondingCurveHook', function () {
  before(async function () {
    const BondingCurveHook = await ethers.getContractFactory('BondingCurveHook')
    hook = await BondingCurveHook.deploy()
    await hook.deployed()
  })

  it('Should return the correct price', async () => {
    let supply = 10
    let tx = await hook.calculateKeyPrice(supply)
    let receipt = await tx.wait(1)
    console.log(receipt.events[0].args._newPrice.toString())
    let numerator = await hook.tokenPrice.call()
    let price = fixedPointToDecimal(numerator)
    let calculatedPrice = jsPriceCalculator(supply)
    console.log(`Num: ${numerator}`)
    console.log(`Denom: ${DENOMINATOR}`)
    console.log(`Price: ${price}`)
    expect(price).to.equal(calculatedPrice)
  })
})
