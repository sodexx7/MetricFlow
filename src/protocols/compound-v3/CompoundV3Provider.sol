// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface ICometInterface {
    function supply(address asset, uint amount) external;
}

contract CompoundV3Provider {
    // Arbitrum Compound V3 (Comet) USDC market address
    address constant COMET_USDC = 0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA;

    // USDC token address on Arbitrum
    address constant USDC = 0xaf88d065e77c8cC2239327C5EDb3A432268e5831;

    ICometInterface public immutable cometUSDC;
    IERC20 public immutable usdc;

    event SupplyToCompound(address indexed user, uint256 amount);

    constructor() {
        cometUSDC = ICometInterface(COMET_USDC);
        usdc = IERC20(USDC);
    }

    /**
     * @notice Supply USDC to Compound V3
     * @param amount Amount of USDC to supply (in USDC decimals, i.e., 6 decimals)
     */
    function supplyUSDC(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");

        // Transfer USDC from user to this contract
        require(usdc.transferFrom(msg.sender, address(this), amount), "USDC transfer failed");

        // Approve Comet to spend USDC
        require(usdc.approve(COMET_USDC, amount), "USDC approval failed");

        // Supply USDC to Compound V3
        cometUSDC.supply(USDC, amount);

        emit SupplyToCompound(msg.sender, amount);
    }
}
