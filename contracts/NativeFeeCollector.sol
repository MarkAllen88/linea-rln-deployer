// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

/**
 * @title NativeFeeCollector
 * @dev Minimal contract that satisfies the RLN fee‑collector ERC‑165 check.
 *      It can receive native Linea‑ETH and lets the deployer withdraw it.
 */
contract NativeFeeCollector is IERC165 {
    // --------------------------------------------------------------------
    // ERC‑165 interface ID for the fee‑collector (hard‑coded for nwaku v0.36.0)
    // --------------------------------------------------------------------
    // The RLN binary defines:
    //   bytes4 constant FEE_COLLECTOR_IFACE = 0x7c0c9e6e;
    // (If you rebuild the binary, run `grep -R "FEE_COLLECTOR_IFACE"` to confirm.)
    bytes4 public constant FEE_COLLECTOR_IFACE = 0x7c0c9e6e;

    // --------------------------------------------------------------------
    // Owner – the address that can withdraw accumulated ETH
    // --------------------------------------------------------------------
    address public immutable owner = msg.sender;

    // --------------------------------------------------------------------
    // Receive native currency (Linea‑ETH)
    // --------------------------------------------------------------------
    receive() external payable {}

    // --------------------------------------------------------------------
    // ERC‑165 support
    // --------------------------------------------------------------------
    function supportsInterface(bytes4 iface) external pure override returns (bool) {
        return iface == FEE_COLLECTOR_IFACE || iface == 0x01ffc9a7; // ERC165 itself
    }

    // --------------------------------------------------------------------
    // Owner‑only withdraw helper (optional)
    // --------------------------------------------------------------------
    function withdraw(address payable to, uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        require(to != address(0), "Zero address");
        require(amount <= address(this).balance, "Insufficient balance");
        to.transfer(amount);
    }
}
