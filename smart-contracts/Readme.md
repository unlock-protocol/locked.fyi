## Locked.fyi smart-contracts

Locked.fyi has a deployed lock-contract on the ethereum mainnet, which is used by default when authors don't deploy their own lock. This lock has a hook registered, which is called each time a key is purchased. The source for the hook is found in `./contracts/BondingCurveHook.sol`.

### Running Tests

Run `npm install` in the smart-contracts directory to install dependencies.
The project is using Buidler & ethers.js (instead of the more common Trufle & web3.js). For their respective documentations, see:

- Buidler: https://buidler.dev/getting-started/
- ethers.js: https://docs.ethers.io/v5/getting-started/

To run the tests in the '/test`directory, just run`npm test`(alias for`npx buidler test`). The project uses a local installation of Buidler so you don't need to install it globally. Run`npx buidler help` for more options.
