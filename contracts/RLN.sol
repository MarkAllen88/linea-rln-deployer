// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*
 * RLN (Rate‑Limited Nullifier) contract
 *
 * This contract implements a simplified version of the RLN protocol.
 * It stores a Merkle‑like tree of members, handles deposits, fees,
 * and provides a stub for zero‑knowledge proof verification.
 *
 * NOTE: This is a demo / educational implementation and is NOT
 * production‑ready. It lacks many security checks, gas optimisations,
 * and a real ZK proof verifier.
 */

import "./Semaphore.sol";

/**
 * @title RLN
 * @author Andy Yen (original concept) – adapted for demo purposes
 * @notice Minimal RLN implementation for learning and testing.
 */
contract RLN {
    /* ------------------------------------------------------------------------
     *  State variables
     * --------------------------------------------------------------------- */

    // Membership deposit amount (in wei)
    uint256 public membershipDepositAmount;

    // Depth of the Merkle‑like tree (number of levels)
    uint256 public treeDepth;

    // Fee percentage (basis points, i.e. 100 = 1%)
    uint256 public feePercentage;

    // Address that receives the collected fees
    address public feeReceiver;

    // Token used for deposits (address(0) = native ETH)
    address public depositToken;

    // Mapping of leaf index => commitment (member identifier)
    mapping(uint256 => bytes32) public leaves;

    // Current number of members (size of the tree)
    uint256 public currentTreeSize;

    // Root hash of the tree (updated on each insertion)
    bytes32 public root;

    // Total amount of fees collected (for bookkeeping)
    uint256 public totalFeesCollected;

    // -------------------------------------------------------------------------
    //  NEW: address of the linked Semaphore contract
    // -------------------------------------------------------------------------
    /// @notice The Semaphore contract that this RLN instance will interact with.
    address public semaphore;

    /* ------------------------------------------------------------------------
     *  Events
     * --------------------------------------------------------------------- */

    event MemberAdded(uint256 indexed leafIndex, bytes32 indexed commitment);
    event DepositMade(address indexed member, uint256 amount);
    event FeeCollected(address indexed collector, uint256 amount);
    event ProofVerified(address indexed prover, bool valid);
    event SemaphoreLinked(address indexed semaphoreAddress);

    /* ------------------------------------------------------------------------
     *  Constructor
     * --------------------------------------------------------------------- */

    /**
     * @notice Initialise the RLN contract with the required parameters.
     * @param _membershipDepositAmount Amount each member must deposit (wei).
     * @param _treeDepth Depth of the Merkle‑like tree (must be > 0).
     * @param _feePercentage Fee taken from each deposit (basis points).
     * @param _feeReceiver Address that will receive the collected fees.
     * @param _depositToken Token address used for deposits (address(0) = ETH).
     */
    constructor(
        uint256 _membershipDepositAmount,
        uint256 _treeDepth,
        uint256 _feePercentage,
        address _feeReceiver,
        address _depositToken
    ) {
        require(_treeDepth > 0, "Tree depth must be > 0");
        require(_feePercentage <= 10_000, "Fee cannot exceed 100%");
        require(_feeReceiver != address(0), "Fee receiver cannot be zero address");

        membershipDepositAmount = _membershipDepositAmount;
        treeDepth = _treeDepth;
        feePercentage = _feePercentage;
        feeReceiver = _feeReceiver;
        depositToken = _depositToken;

        // Initialise empty tree
        currentTreeSize = 0;
        root = bytes32(0);
    }

    /* ------------------------------------------------------------------------
     *  Public / external functions
     * --------------------------------------------------------------------- */

    /**
     * @notice Set the address of the Semaphore contract that this RLN instance will use.
     * @dev Can only be called once to prevent accidental overwriting.
     * @param _semaphore The deployed Semaphore contract address.
     */
    function setSemaphore(address _semaphore) external {
        require(semaphore == address(0), "Semaphore already set");
        require(_semaphore != address(0), "Invalid Semaphore address");
        semaphore = _semaphore;
        emit SemaphoreLinked(_semaphore);
    }

    /**
     * @notice Add a new member to the RLN tree.
     * @dev Caller must send the exact membership deposit amount.
     * @param _commitment The member's commitment (hash of identity secret).
     */
    function addMember(bytes32 _commitment) external payable {
        // Ensure the correct deposit amount is sent
        require(msg.value == membershipDepositAmount, "Incorrect deposit amount");

        // Compute leaf index and store commitment
        uint256 leafIndex = currentTreeSize;
        leaves[leafIndex] = _commitment;

        // Update tree root (placeholder – real implementation would recompute Merkle root)
        root = keccak256(abi.encodePacked(root, _commitment));

        // Increment tree size
        currentTreeSize++;

        // Calculate and collect fee
        uint256 fee = (msg.value * feePercentage) / 10_000;
        totalFeesCollected += fee;
        payable(feeReceiver).transfer(fee);

        // Emit events
        emit MemberAdded(leafIndex, _commitment);
        emit DepositMade(msg.sender, msg.value);
        emit FeeCollected(feeReceiver, fee);
    }

    /**
     * @notice Verify a zero‑knowledge proof (stub implementation).
     * @dev In a real RLN contract this would call a zk‑SNARK verifier.
     * @param _proof The proof data (bytes array).
     * @param _publicSignals Public inputs to the proof.
     * @return bool indicating whether the proof is valid.
     */
    function verifyProof(
        bytes calldata _proof,
        uint256[] calldata _publicSignals
    ) external returns (bool) {
        // Placeholder logic – always returns true for demo purposes
        bool isValid = true;

        // Emit verification result
        emit ProofVerified(msg.sender, isValid);
        return isValid;
    }

    /**
     * @notice Retrieve the current Merkle‑like root of the RLN tree.
     * @return bytes32 representing the root hash.
     */
    function getRoot() external view returns (bytes32) {
        return root;
    }

    /**
     * @notice Get the total number of members currently in the tree.
     * @return uint256 count of members.
     */
    function getMemberCount() external view returns (uint256) {
        return currentTreeSize;
    }

    /**
     * @notice Retrieve a member's commitment by leaf index.
     * @param _index Index of the leaf in the tree.
     * @return bytes32 commitment stored at that leaf.
     */
    function getMemberCommitment(uint256 _index) external view returns (bytes32) {
        require(_index < currentTreeSize, "Index out of bounds");
        return leaves[_index];
    }

    /* ------------------------------------------------------------------------
     *  Internal helper functions (could be expanded for a full RLN)
     * --------------------------------------------------------------------- */

    // Placeholder for a real Merkle root recomputation algorithm
    function _recomputeRoot() internal view returns (bytes32) {
        // In a full implementation you would walk the tree and hash pairs.
        // Here we simply return the stored root for demonstration.
        return root;
    }
}