// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface ISemaphore {
    function root() external view returns (uint256);
    function groupSize() external view returns (uint256);
    function members(uint256) external view returns (uint256);
    function addMember(uint256 identityCommitment) external;
    function verifyProof(
        uint256 root,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifier,
        uint256[8] calldata proof
    ) external view returns (bool);
}

contract Semaphore is ISemaphore {
    uint256 public override root;
    uint256 public override groupSize;
    uint256 public treeDepth;
    mapping(uint256 => uint256) public override members;
    mapping(uint256 => bool) public memberExists;
    address public rlnContract;

    constructor(uint256 _treeDepth) {
        treeDepth = _treeDepth;
        root = 1;                 // simple non‑zero start value
    }

    modifier onlyRLN() {
        require(msg.sender == rlnContract, "Semaphore: caller not RLN");
        _;
    }

    /** Set the RLN contract address – can be called only once */
    function setRLNContract(address _rlnContract) external {
        require(rlnContract == address(0), "RLN already set");
        rlnContract = _rlnContract;
    }

    /** Add a member – only the RLN contract may call this */
    function addMember(uint256 identityCommitment) external override onlyRLN {
        require(!memberExists[identityCommitment], "Member exists");
        members[groupSize] = identityCommitment;
        memberExists[identityCommitment] = true;
        groupSize++;

        // Very naive Merkle‑like update – enough for demo purposes
        root = uint256(keccak256(abi.encodePacked(root, identityCommitment)));
        if (root == 0) root = 1;
    }

    // Dummy implementation – always returns true for the demo
    function verifyProof(
        uint256,
        uint256,
        uint256,
        uint256,
        uint256[8] calldata
    ) external pure override returns (bool) {
        return true;
    }
}
