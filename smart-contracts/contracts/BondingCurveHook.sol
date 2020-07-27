pragma solidity ^0.5.17;

/**
 * @title BondingCurveHook
 * @author Nick Furfaro
 * This contract is meant to be registered as a hook,
 * to be called on each key purchase from a Lock contract.
 * It tracks the token(key) supply for the lock, and adjusts
 * the price as the supply grows according to a modified binary log function.
 */

import '@unlock-protocol/unlock-abi-7/ILockKeyPurchaseHookV7.sol';
import '@unlock-protocol/unlock-abi-7/IPublicLockV7.sol';
import 'abdk-libraries-solidity/ABDKMath64x64.sol';
import './ITokenManager.sol';

contract BondingCurveHook is ILockKeyPurchaseHookV7 {

  // ////////////////////  Libs  ///////////////////////////

  using ABDKMath64x64 for int128;
  using ABDKMath64x64 for uint256;


  // ////////////////////  Data  ///////////////////////////

  // Number of keys sold using this hook.
  uint256 public tokenSupply;

  // Address of paired lock
  address public lockAddress;
  address private tokenManagerAddress;

  /// @dev Used internally to determine if a price-update on the lock is required.
  uint256 private currentPrice;

  // For details: https://github.com/unlock-protocol/locked.fyi/blob/master/smart-contracts/Readme.md
  int128 private constant CURVE_MODIFER = 61278757397652720000;
  int128 private constant DENOMINATOR = 18446744073709552000;

  // ////////////////////  Functions  ///////////////////////////

  /// @param _initialSupply The initial value for tokenSupply
  /// @param _lock The address of the lock configured to use this hook.
  /// @dev _initialSupply must be > 0 to avoid a revert
  constructor(uint _initialSupply, address _lock, address _tokenManagerAddress) public {
    tokenSupply = _initialSupply;
    lockAddress = _lock;
    tokenManagerAddress = _tokenManagerAddress;
  }

  function keyPurchasePrice(
    address from,
    address recipient,
    address referrer,
    bytes calldata data
  ) external view
    returns (uint minKeyPrice)
  {
    return IPublicLockV7(msg.sender).keyPrice();
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
    require(msg.sender == lockAddress, 'UNAUTHORIZED_ACCESS');
    address author = bytesToAddress(data);


    IPublicLockV7 lock = IPublicLockV7(msg.sender);
    tokenSupply++;

    // calculate the price for the new supply:
    int128 supply = tokenSupply.fromUInt();
    uint keyPrice = supply.log_2().div(CURVE_MODIFER).div(DENOMINATOR).mulu(1 * 10 ** 18);
    uint rounded = round(keyPrice);

    if(rounded > currentPrice) {
      currentPrice = rounded;
      address tokenAddress = lock.tokenAddress();
      lock.updateKeyPricing(rounded, tokenAddress);
    }
      if(author != address(0)) {
        // ITokenManager(tokenManagerAddress).mint(author, 1 * 10 ** 18);
      }
  }

  // ////////////////////  Private  ///////////////////////////

  // Source: https://ethereum.stackexchange.com/questions/15350/how-to-convert-an-bytes-to-address-in-solidity
  function bytesToAddress(bytes memory b) private pure returns (address addr) {
    require(b.length == 20, 'INVALID_BYTES_LENGTH');
  // solium-disable-next-line
    assembly {
      addr := mload(add(b,20))
    }
  }

   function round(uint n) public pure returns (uint) {
        uint lower = ((n - 1) / 100000000000000000) * 100000000000000000;
        uint upper = ((n + 100000000000000000 - 1) / 100000000000000000) * 100000000000000000;
        uint half = (lower + upper) / 2;
        if(n < half) {
            return lower;
        } else {
            return upper;
        }
    }
}