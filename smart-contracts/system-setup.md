# TEMPLATE

### Project Data:

Fill in values as you progress for quick reference.

```

 - DAO:  <ETHEREUM_ADDRESS>
 - ENS:  "<NAME>.aragonid.eth"
 - URL:  https://rinkeby.client.aragon.org/#/<NAME>/

 - Agent:         <AGENT_ADDRESS>
 - Token Manager: <TOKEN_MANAGER_ADDRESS>
 - MiniMe erc20:  <MINIME_ADDRESS>
 - Voting:        <VOTING_APP_ADDRESS>
 - Rewards:       <REWARDS_APP_ADDRESS>
 - Lock:          <LOCK_ADDRESS>
 - Hook:          <HOOK_ADDRESS>
 - Weenus:        0xaff4481d10270f50f203e0763e2597776068cbc5
 - DAI:           0x6B175474E89094C44Da98b954EedeAC495271d0F
 - Zero:          0x0000000000000000000000000000000000000000

```

## System Init Steps:

- [ ] deploy dao (select company template, add agent, launch)
      (https://rinkeby.client.aragon.org/#/ or https://client.aragon.org/#/)

  - [ ] select "Company" template, under "Optional Apps", toggle "Agent", and click "Use this template".
  - [ ] make sure to use correct params for apps (voting, etc)
  - [ ] initial distribution - mint 1 token for yourself so you can vote to set up permissions !
  - [ ] configure and Launch !
  - Note: All of the terminal commands (ie: `$dao install...`) require the Aragon-CLI
  - [ ] add rewards app
        `dao install $dao rewards.aragonpm.eth --app-init-args $vault --environment aragon:rinkeby --use-frame`
  - [ ] remember to vote !
  - [ ] get address for Rewards app: `$ dao apps $dao --all --environment aragon:rinkeby --use-frame`
  - [ ] grant Voting app permission to Add new rewards on Rewards app: `dao acl create $dao $rewards ADD_REWARD_ROLE $voting $voting --environment aragon:rinkeby --use-frame`
  - [ ] remember to vote !

- [ ] deploy a lock
- [ ] update named accounts in `buidler.config.js` !
- [ ] set initial supply in `deploy/01_deploy_hook.js` based on actual supply of lock. use 2 !!
- [ ] call `approve` on weenus/Dai token contract with lock address.

- [ ] check that `newReward()` & `mint()` function calls are not commented out for local testing !
- [ ] deploy hook: `npm run deploy-rinkeby` (or `npm run deploy-mainnet`)
- [ ] verify hook: `$ npx buidler verify-contract --contract-name BondingCurveHook --address $HOOK_ADDRESS $INITIAL_SUPPLY $LOCK_ADDRESS $TOKEN_ADDRESS $REWARDS_ADDRESS $MINIME_TOKEN_ADDRESS`

### config dao:

- [ ] in Finance app, perform a deposit of 1 WEE/DAI to enable the token in UI.
- [ ] set permissions:

  - [ ] grant Hook permission to Add new rewards on Rewards app via Aragon UI.
  - [ ] grant Hook permission to mint on Tokens app via Aragon UI.
  - [ ] grant Rewards app permission to transfer tokens on Agent app.
        **!! Without this permission, rewards are unclaimable.**

  - [ ] revoke Voting app's permission for voting app to burn tokens on Tokens app.
        **!! Incentive: by burning tokens, you now hold a larger share and get bigger rewards moving forward.**
  - [ ] revoke Finance app's permission for to transfer tokens on Agent app.
        **!! With this permission, some of the dao members could vote to drain the Dao, removing all unclaimed rewards in the process.** - Note: As a recovery mechanism, this permission can always be re-granted via a vote. Funds could then be transferred to any other wallet/contract address. This could be a simple distribution contract, or a new dao which recognizes the old Dao's reference token (shares), and a single new larger reward created automaticlly using the date of withdrawal from the old Dao as the reference date. After draining the dao, each member's unclaimed reward amounts are still visible.

- [ ] config lock:
  - [ ] register hook as purchase hook
  - [ ] add hook as a `lockManager`
  - [ ] set beneficiary to agent address

# End.

## Links

#### Rinkeby:

- DAO: 0x79bD813c48D2E35b3f904Df1C6349C725bD9ff2c
- ENS: "rinkebylockedfyi.aragonid.eth"
- URL: https://rinkeby.client.aragon.org/#/rinkebylockedfyi/

#### Mainnet:

- DAO: TODO
- ENS: TODO
- URL: TODO

#### other stuff:

- Frame: https://frame.sh/
- Frame: https://hack.aragon.org/docs/guides-use-frame
- Agent: - https://hack.aragon.org/docs/guides-use-agent
- Aragon ACL: https://hack.aragon.org/docs/acl-intro
- Aragon ACL: https://hack.aragon.org/docs/cli-dao-commands#dao-acl
- Rewards: https://autark.gitbook.io/open-enterprise/apps/rewards
- Rewards: https://github.com/AutarkLabs/open-enterprise/blob/dev/docs/GETTING_STARTED.md#install-the-rewards-app
