pragma solidity ^0.5.17;

/**
 * @title BondingCurveHook
 * @author Nick Furfaro
 */

import '@unlock-protocol/unlock-abi-7/ILockKeyPurchaseHookV7.sol';
import 'abdk-libraries-solidity/ABDKMath64x64.sol';
// import '@openzeppelin/contracts/math/SafeMath.sol';
import '@nomiclabs/buidler/console.sol';

contract BondingCurveHook is ILockKeyPurchaseHookV7 {

  using ABDKMath64x64 for int128;
  using ABDKMath64x64 for uint256;
  int128 public tokenSupply;
  int128 public tokenPrice;

  /**
  * ABDKMath64x64.sol:
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
  // which aproximates a base-10 logarithm closely. For example:
  // log10(100) = 1
  // log10(1,000,000,000) = 9
  // log2(100)/3.321 = 1.00027
  // log2(1,000,000,000)/3.321 = 9.00251
  int128 private constant CURVE_MODIFER = 61261637068789420000;



  function calculateKeyPrice(uint256 _supply)
    public
  {
    int128 supplyAsInt;
    supplyAsInt = _supply.fromUInt();
    tokenPrice = supplyAsInt.log_2().div(CURVE_MODIFER);
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
  {}

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
    // get current key price from
    // update current supply using internal counter
    // pull author address from calldata
    // inform DAO to mint new share for author
  }
}