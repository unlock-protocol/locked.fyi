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
// import '@nomiclabs/buidler/console.sol';

contract BondingCurveHook is ILockKeyPurchaseHookV7 {

  //  ██████╗██████╗ ███████╗██████╗ ██╗████████╗     █████╗ ██████╗ ██████╗ ██╗  ██╗    ██╗
  // ██╔════╝██╔══██╗██╔════╝██╔══██╗██║╚══██╔══╝    ██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝    ██║
  // ██║     ██████╔╝█████╗  ██║  ██║██║   ██║       ███████║██████╔╝██║  ██║█████╔╝     ██║
  // ██║     ██╔══██╗██╔══╝  ██║  ██║██║   ██║       ██╔══██║██╔══██╗██║  ██║██╔═██╗     ╚═╝
  // ╚██████╗██║  ██║███████╗██████╔╝██║   ██║       ██║  ██║██████╔╝██████╔╝██║  ██╗    ██╗
  //  ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝   ╚═╝       ╚═╝  ╚═╝╚═════╝ ╚═════╝ ╚═╝  ╚═╝    ╚═╝
  //

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
  int128 private constant CURVE_MODIFER = 61261637068789420000;

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
    // @audit testing only, move to mock and remove arg from constructor!
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
    // Not needed for this use-case.
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
    // Ensure caller is the locked.fyi lock
    require(msg.sender == LOCK_ADDRESS);
    IPublicLockV7 lock = IPublicLockV7(msg.sender);
    // @audit sort out units
    int128 supply = tokenSupply.fromUInt();
    int128 logTokenPrice = supply.log_2();
    int128 modifiedTokenPrice = logTokenPrice.div(CURVE_MODIFER).div(DENOMINATOR);
    uint256 keyPrice = modifiedTokenPrice.toUInt();
    // update current supply using internal counter
    tokenSupply++;

    // Read token address from lock and pass as 2nd arg:
    address tokenAddress = lock.tokenAddress();
    lock.updateKeyPricing(keyPrice, tokenAddress);

    // get author's address from calldata:
    // address author = address(data[0]);

    // inform DAO to mint new share for author
    // DAO.mint(Author, 1);
  }
}