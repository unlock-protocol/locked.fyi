pragma solidity ^0.5.0;

import '@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/ERC20Mintable.sol';

contract TestToken is ERC20Mintable {

    function mint(address account, uint256 amount) public returns (bool) {
        return super.mint(account, amount);
    }
}