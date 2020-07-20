module.exports = async ({getNamedAccounts, deployments}) => {
  const {deployIfDifferent, log} = deployments

  const {lock, deployer, tokenManager} = await getNamedAccounts()

  const deployResult = await deployIfDifferent(
    ['data'],
    'BondingCurveHook',
    {from: deployer, gas: 3000000},
    'BondingCurveHook',
    42,
    lock,
    tokenManager
  )

  if (deployResult.newlyDeployed) {
    log(
      ' - Hook deployed at : ' +
        deployResult.address +
        ' for gas : ' +
        deployResult.receipt.gasUsed
    )
  } else {
    log('reusing Hook at ' + deployResult.address)
  }
}
