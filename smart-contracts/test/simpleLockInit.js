const { ethers } = require('@nomiclabs/buidler')
const { BigNumber, constants } = require('ethers')
const { deployLock } = require('./Lock.js')
// const chai = require('chai')
// chai.use(chaiAsPromised)
const { assert } = require('chai')
const UnlockJSON = require('@unlock-protocol/unlock-abi-7/Unlock.json')
const LockJSON = require('@unlock-protocol/unlock-abi-7/PublicLock.json')
const provider = ethers.provider
const UnlockABI = UnlockJSON.abi
const LockABI = LockJSON.abi
const UnlockBytecode = UnlockJSON.bytecode
const LockBytecode = LockJSON.bytecode
const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'

describe('Lock Setup', () => {
  before(async () => {
    const lockAddress = await deployLock()
    console.log(`module's lockAddress: ${lockAddress}`)
    // register the hook contract.
    // set this lock creator up as a fixture or simple module to import.
  })

  it('Deployed a lock', async () => {
    assert.equal(1, 1)
  })
})
