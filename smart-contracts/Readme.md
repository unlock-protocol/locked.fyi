## Locked.fyi smart-contracts

Locked.fyi has a deployed lock-contract on the ethereum mainnet, which is used by default when authors don't deploy their own lock. This lock has a hook registered, which is called each time a key is purchased. The source for the hook is found in `./contracts/BondingCurveHook.sol`.

### Running Tests

Run `npm install` in the smart-contracts directory to install dependencies.
The project is using Buidler & ethers.js (instead of the more common Trufle & web3.js). For their respective documentations, see:

- Buidler: https://buidler.dev/getting-started/
- ethers.js: https://docs.ethers.io/v5/getting-started/

To run the tests in the '/test`directory, just run`npm test`(alias for`npx buidler test`). The project uses a local installation of Buidler so you don't need to install it globally. Run`npx buidler help` for more options.

### Bonding Curve

The curve function used is P=log2(S) / 3.321928094887362, which aproximates a base-10 logarithm very closely.
As solidity has no native support for fixed-point numbers, a library from ABDK Consulting is utilized to enable the required math functionality:
https://github.com/abdk-consulting/abdk-libraries-solidity/blob/939f0a264f2d07a9e2c7a3a020f0db2c0885dc01/ABDKMath64x64.sol#L8

An excerpt from the linked library:

> Smart contract library of mathematical functions operating with signed 64.64-bit fixed point numbers. Signed 64.64-bit fixed point number is basically a simple fraction whose numerator is signed 128-bit integer and denominator is 2^64. As long as denominator is always the same, there is no need to store it, thus in Solidity signed 64.64-bit fixed point numbers are represented by int128 type holding only the numerator.

The constant value `DENOMINATOR` is simply 2^64, and the constant `CURVE_MODIFER` is the fixed-point representation of the value 3.321928094887362 from our curve function. (3.321928094887362 \* 2^64)
