pragma solidity ^0.5.17;

/**
 * @title BondingCurveHook
 * @author Nick Furfaro
 * This contract is meant to be registered as a hook,
 * to be called on each key purchase from a Lock contract.
 * It tracks the token(key) supply for the lock, and adjusts
 * the price as the supply grows according to a binary log function.
 */

import '@unlock-protocol/unlock-abi-7/ILockKeyPurchaseHookV7.sol';
import '@unlock-protocol/unlock-abi-7/IPublicLockV7.sol';
import 'abdk-libraries-solidity/ABDKMath64x64.sol';
// import '@openzeppelin/contracts/math/SafeMath.sol';
import '@nomiclabs/buidler/console.sol';

contract BondingCurveHook is ILockKeyPurchaseHookV7 {
  // @audit add credit for ABDK LIB !!!
  // ////////////////////  Libs  ///////////////////////////

  using ABDKMath64x64 for int128;
  using ABDKMath64x64 for uint256;


  // ////////////////////  Data  ///////////////////////////

  // The number of keys sold using this hook.
  uint256 public tokenSupply;

  // mainnet address for deploy locked.fyi lock
  address private constant LOCK_ADDRESS = 0xaad5Bff48e1534EF1f2f0A4184F5C2E61aC47EC3;

  //@audit for testing only. deploy a mock hook for this
  address private _testLockAddress;

  /**
  * 64.64-bit representation of 3.321:
  * The curve function used is P=log2(S) / 3.321,
  * which aproximates a base-10 logarithm.
  * 3.321 * 2^64 = 61261637068789420000
  * Details on how the fixed-point numbers work here:
  * https://github.com/abdk-consulting/abdk-libraries-solidity/blob/939f0a264f2d07a9e2c7a3a020f0db2c0885dc01/ABDKMath64x64.sol#L8
   */
  int128 private constant CURVE_MODIFER = 61278757397652720000;

  //@audit Still needed ???
  // 2^64, as used by ABDKMath64x64.sol
  int128 private constant DENOMINATOR = 18446744073709552000;

  // ////////////////////  Events  ///////////////////////////

  // what do we want to log here?
  event KeyPrice(int128 _supply, int128 _price);

  // ////////////////////  Functions  ///////////////////////////

  constructor(uint _initialSupply, address _testLock) public {
    // needed to set supply > 0 (ABDK lib fails otherwise)
    tokenSupply = _initialSupply;
    // @audit testing only, move to mock and remove arg from constructor
    _testLockAddress = _testLock;
  }

/**
   * @notice Used to determine the purchase price before issueing a transaction.
   * This allows the hook to offer a discount on purchases.
   * This may revert to prevent a purchase.
   * param from the msg.sender making the purchase
   * param recipient the account which will be granted a key
   * param referrer the account which referred this key sale
   * param data arbitrary data populated by the front-end which initiated the sale
   * @return minKeyPrice the minimum value/price required to purchase a key with these settings
   * @dev the lock's address is the `msg.sender` when this function is called via
   * the lock's `purchasePriceFor` function
   */
  function keyPurchasePrice(
    address from,
    address recipient,
    address referrer,
    bytes calldata data
  ) external view
    returns (uint minKeyPrice)
  {
    // no-op.
  }

  /**
   * @notice If the lock owner has registered an implementer then this hook
   * is called with every key sold.
   *  from the msg.sender making the purchase
   *  recipient the account which will be granted a key
   *  referrer the account which referred this key sale
   * @param data arbitrary data populated by the front-end which initiated the sale
   *  minKeyPrice the price including any discount granted from calling this
   * hook's `keyPurchasePrice` function
   *  pricePaid the value/pricePaid included with the purchase transaction
   * @dev the lock's address is the `msg.sender` when this function is called
   */
  function onKeyPurchase(
    address /*from**/,
    address /*recipient**/,
    address /*referrer**/,
    bytes calldata data,
    uint /*minKeyPrice**/,
    uint /*pricePaid**/
  ) external
  {
    // Ensure caller is the locked.fyi lock:
    // @audit re-enable check before deployment !!!
    // require(msg.sender == LOCK_ADDRESS);
    require(msg.sender == _testLockAddress);
    IPublicLockV7 lock = IPublicLockV7(msg.sender);
    tokenSupply++;

    // calculate the price for the new supply:
    int128 supplyInt = tokenSupply.fromUInt();
    uint price = 1 * 10 ** 18;
    int128 keyPriceNumerator = supplyInt.log_2();
    int128 modifiedNumerator = keyPriceNumerator.div(CURVE_MODIFER);
    uint256 keyPrice = modifiedNumerator.div(DENOMINATOR).mulu(price);

    // get current token address from lock:
    address tokenAddress = lock.tokenAddress();
    lock.updateKeyPricing(keyPrice, tokenAddress);
    // DAO.mint(data, 1);
  }
}