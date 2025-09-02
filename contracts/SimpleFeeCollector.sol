// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @title SimpleFeeCollector
 * @dev Very small contract whose only purpose is to be a contract‑type fee receiver.
 *      It can receive native Linea‑ETH (or any L2 native token) via the receive()
 *      fallback and lets the deployer withdraw any accumulated balance.
 *      The RLN contract only checks that the fee‑receiver is a contract,
 *      so this implementation is sufficient.
 *
 *      An optional `withdraw` function lets the deployer pull any leftover ETH.
 */
contract SimpleFeeCollector {
    // --------------------------------------------------------------------
    // Receive native currency (Linea ETH) – nothing else is required.
    // --------------------------------------------------------------------
    receive() external payable {}

    // --------------------------------------------------------------------
    // Owner‑only withdraw helper (optional, handy for cleaning up later).
    // --------------------------------------------------------------------
    address public immutable owner = msg.sender;

    function withdraw(address payable to, uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        require(to != address(0), "Zero address");
        require(amount <= address(this).balance, "Insufficient balance");
        to.transfer(amount);
    }
}
