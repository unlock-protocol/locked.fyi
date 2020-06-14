pragma solidity ^0.5.17;

/**
 * @title BondingCurveHook
 * @author Nick Furfaro
 * This contract is meant to be registered as a hook,
 * to be called on each key purchase from a Lock contract.
 * It tracks the token(key) supply for the lock, and adjusts
 * the price as the supply grows according to a binary log function,
 * P = log2(S) / 3.321, which aproximates a base-10 logarithm closely.
 */

import '@unlock-protocol/unlock-abi-7/ILockKeyPurchaseHookV7.sol';
import 'abdk-libraries-solidity/ABDKMath64x64.sol';
// import '@openzeppelin/contracts/math/SafeMath.sol';
// import '@nomiclabs/buidler/console.sol';

contract BondingCurveHook is ILockKeyPurchaseHookV7 {

  using ABDKMath64x64 for int128;
  using ABDKMath64x64 for uint256;

  // The number of keys sold using this hook.
  int128 public tokenSupply;

  // temporary. no need to store this, calculate as needed.
  int128 public tokenPrice;

  // what do I want to log here? price, supply or both? Price can always be calculated offchain... Supply can be looked up as needed onchain as well.
  event PriceIncrease(int128 indexed _newPrice);

/**
 * https://github.com/abdk-consulting/abdk-libraries-solidity/blob/master/ABDKMath64x64.sol#L366
 * Smart contract library of mathematical functions operating with signed
 * 64.64-bit fixed point numbers.  Signed 64.64-bit fixed point number is
 * basically a simple fraction whose numerator is signed 128-bit integer and
 * denominator is 2^64.  As long as denominator is always the same, there is no
 * need to store it, thus in Solidity signed 64.64-bit fixed point numbers are
 * represented by int128 type holding only the numerator.
 */

  // The 64.64-bit representation of 3.321
  // (61261637068789420000 / 2^64 = 3.321)
  // The bonding curve we use here is P=log2(S)/3.321,
  // which aproximates a base-10 logarithm closely.
  int128 private constant CURVE_MODIFER = 61261637068789420000;

  // 2^64, as used by ABDKMath64x64.sol
  int128 private constant DENOMINATOR = 18446744073709552000;



  function calculateKeyPrice(uint256 _supply)
    public
  {
    int128 supplyAsInt;
    supplyAsInt = _supply.fromUInt();
    tokenPrice = supplyAsInt.log_2().div(CURVE_MODIFER);
    emit PriceIncrease(tokenPrice);
  }


/**
   * @notice Used to determine the purchase price before issueing a transaction.
   * This allows the hook to offer a discount on purchases.
   * This may revert to prevent a purchase.
   * @param from the msg.sender making the purchase
   * @param recipient the account which will be granted a key
   * @param referrer the account which referred this key sale
   * @param data arbitrary data populated by the front-end which initiated the sale
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
    // get the price for the lock before purchase ic completed.
    // tokenPrice = tokenSupply.log_2().div(CURVE_MODIFER);
    // return tokenPrice.toUInt();
  }

  /**
   * @notice If the lock owner has registered an implementer then this hook
   * is called with every key sold.
   * @param from the msg.sender making the purchase
   * @param recipient the account which will be granted a key
   * @param referrer the account which referred this key sale
   * @param data arbitrary data populated by the front-end which initiated the sale
   * @param minKeyPrice the price including any discount granted from calling this
   * hook's `keyPurchasePrice` function
   * @param pricePaid the value/pricePaid included with the purchase transaction
   * @dev the lock's address is the `msg.sender` when this function is called
   */
  function onKeyPurchase(
    address from,
    address recipient,
    address referrer,
    bytes calldata data,
    uint minKeyPrice,
    uint pricePaid
  ) external
  {
    // update current supply using internal counter
    // pull author address from calldata
    // inform DAO to mint new share for author
  }
}