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
  uint256 private constant DENOMINATOR = 18446744073709552000;

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

  function getPrice()
    public
    view
    returns (uint256)
  {
    // fromInt() int256 => int128
    // toInt() int128 => int64
    // fromUInt() uint256 => int128
    // toUInt() int128 => uint64

    // mul() int128,int128 => int128
    // div() int128,int128 => int128

    // muli () int128,int256 => int256
    // divi() int256,int256 => int128

    // mulu() int128,uint256 => uint256
    // divu() uint256,uint256 => int128

    // divuu() uint256,uint256 => uint128

    // log_2() int128 => int128

    // int128 keyPrice
    // int128 CURVE_MODIFER

    int128 supply = tokenSupply.fromUInt();

    int128 keyPriceNumerator = supply.log_2().div(CURVE_MODIFER);

    uint256 keyPriceAsUint = uint256(keyPriceNumerator);

    // console.log('keypriceAsUint', (keyPriceAsUint / (DENOMINATOR / 10**18)));

    // int128 supply = tokenSupply.fromUInt();
    // int128 keyPrice = supply.log_2();

    // uint256 keyPriceAsUint = uint256(keyPrice);
    // int128 modifiedKeyPrice = keyPriceAsUint.divu(CURVE_MODIFER).divu(DENOMINATOR);
    // uint256 modifiedKeyPriceAsUint = uint256(modifiedKeyPrice);
    // console.log('modifiedKeyPriceAsUint', modifiedKeyPriceAsUint);

    return (keyPriceAsUint);
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
    // Ensure caller is the locked.fyi lock
    // @audit re-enable check before deployment !!!
    // require(msg.sender == LOCK_ADDRESS); // 200 gas
    require(msg.sender == _testLockAddress);
    IPublicLockV7 lock = IPublicLockV7(msg.sender); // 200 gas ?
    // @audit sort out units
    // @audit toUInt() rounds down and is underflow-protected. uint() is not!
    tokenSupply++; // 5000 gas
    uint keyPrice = getPrice();


    // Read token address from lock and pass as 2nd arg:
    address tokenAddress = lock.tokenAddress(); // read-only, no gas
    lock.updateKeyPricing(keyPrice, tokenAddress);
    // lock.updateKeyPricing(keyPrice * 10**18, tokenAddress);


    // get author's address from calldata:
    // console.logBytes(msg.data);
    (address _from, address _recipient, address _referrer, uint _start, uint _minPrice, uint _pricePaid, uint _size, bytes20 _author) = abi.decode(msg.data, (address, address, address, uint, uint, uint, uint, bytes20));
    console.logBytes20(_author);

    // inform DAO to mint new share for author
    // DAO.mint(Author, 1);
  }
}