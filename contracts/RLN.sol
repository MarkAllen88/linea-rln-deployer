// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/*
 * --------------------------------------------------------------
 *  Minimal RLN (Rate‑Limited Nullifier) contract – ERC‑20 version
 * --------------------------------------------------------------
 *
 * This contract is deliberately simple and meant for demo / testing.
 * It stores a Merkle‑like tree of members, collects a fee, and
 * provides a stub for zero‑knowledge proof verification.
 *
 * IMPORTANT:
 *   • Deposits are taken from an ERC‑20 token (the address is set in
 *     the constructor). No native ETH is accepted.
 *   • The `addMember` function is *not payable* – it pulls the
 *     token via `transferFrom`.
 *   • All other logic (tree updates, fee handling, events) stays the
 *     same as the original demo.
 */

/* ------------------------------------------------------------------
 *  Minimal ERC‑20 interface needed for token transfers
 * ------------------------------------------------------------------ */
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

/* ------------------------------------------------------------------
 *  RLN – ERC‑20‑compatible implementation
 * ------------------------------------------------------------------ */
contract RLN {

    /* --------------------------------------------------------------------
       State variables
    -------------------------------------------------------------------- */

    // *** NEW: manager of the contract (the address that deployed it) ***
    address public manager;                     // ← public getter `manager()`

    uint256 public membershipDepositAmount;    // in token smallest unit (e.g. wei for ERC‑20)
    uint256 public treeDepth;
    uint256 public feePercentage;              // basis points (100 = 1 %)
    address public feeReceiver;
    address public depositToken;                // ERC‑20 token address (cannot be address(0))

    // Tree storage
    mapping(uint256 => bytes32) public leaves;
    uint256 public currentTreeSize;
    bytes32 public root;
    uint256 public totalFeesCollected;

    // Linked Semaphore contract (optional)
    address public semaphore;

    /* --------------------------------------------------------------------
       Events
    -------------------------------------------------------------------- */
    event MemberAdded(uint256 indexed leafIndex, bytes32 indexed commitment);
    event DepositMade(address indexed member, uint256 amount);
    event FeeCollected(address indexed collector, uint256 amount);
    event ProofVerified(address indexed prover, bool valid);
    event SemaphoreLinked(address indexed semaphoreAddress);

    /* --------------------------------------------------------------------
       Constructor
    -------------------------------------------------------------------- */
    /**
     * @notice Initialise the RLN contract.
     * @param _membershipDepositAmount Amount each member must deposit (in token units).
     * @param _treeDepth               Depth of the Merkle‑like tree (> 0).
     * @param _feePercentage           Fee taken from each deposit (basis points).
     * @param _feeReceiver             Address that will receive the collected fees.
     * @param _depositToken            ERC‑20 token address used for deposits.
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
        require(_depositToken != address(0), "Deposit token cannot be zero address");

        // *** NEW: store the deployer as the manager ***
        manager = msg.sender;

        membershipDepositAmount = _membershipDepositAmount;
        treeDepth               = _treeDepth;
        feePercentage           = _feePercentage;
        feeReceiver             = _feeReceiver;
        depositToken            = _depositToken;

        // Initialise empty tree
        currentTreeSize = 0;
        root = bytes32(0);
    }

    /* --------------------------------------------------------------------
       Public / external functions
    -------------------------------------------------------------------- */

    /**
     * @notice Link a Semaphore contract (can be called only once).
     * @param _semaphore Deployed Semaphore contract address.
     */
    function setSemaphore(address _semaphore) external {
        require(semaphore == address(0), "Semaphore already set");
        require(_semaphore != address(0), "Invalid Semaphore address");
        semaphore = _semaphore;
        emit SemaphoreLinked(_semaphore);
    }

    /**
     * @notice Add a new member to the RLN tree.
     * @dev Caller must have approved `membershipDepositAmount` tokens for this contract.
     * @param _commitment The member's commitment (hash of identity secret).
     */
    function addMember(bytes32 _commitment) external {
        // -----------------------------------------------------------------
        // 1️⃣ Pull the ERC‑20 deposit from the caller
        // -----------------------------------------------------------------
        bool ok = IERC20(depositToken).transferFrom(
            msg.sender,
            address(this),
            membershipDepositAmount
        );
        require(ok, "ERC20 transfer failed");

        // -----------------------------------------------------------------
        // 2️⃣ Store the commitment and update the tree
        // -----------------------------------------------------------------
        uint256 leafIndex = currentTreeSize;
        leaves[leafIndex] = _commitment;
        // Simple placeholder root update (real RLN would recompute a Merkle root)
        root = keccak256(abi.encodePacked(root, _commitment));
        currentTreeSize++;

        // -----------------------------------------------------------------
        // 3️⃣ Calculate and forward the fee (still in token units)
        // -----------------------------------------------------------------
        uint256 fee = (membershipDepositAmount * feePercentage) / 10_000;
        totalFeesCollected += fee;
        // Send fee to the designated receiver
        bool feeOk = IERC20(depositToken).transfer(feeReceiver, fee);
        require(feeOk, "Fee transfer failed");

        // -----------------------------------------------------------------
        // 4️⃣ Emit events
        // -----------------------------------------------------------------
        emit MemberAdded(leafIndex, _commitment);
        emit DepositMade(msg.sender, membershipDepositAmount);
        emit FeeCollected(feeReceiver, fee);
    }

    /**
     * @notice Stub zero‑knowledge proof verifier (always returns true for demo).
     * @param _proof          Proof data.
     * @param _publicSignals  Public inputs.
     * @return true (valid) – placeholder.
     */
    function verifyProof(
        bytes calldata _proof,
        uint256[] calldata _publicSignals
    ) external returns (bool) {
        bool isValid = true;
        emit ProofVerified(msg.sender, isValid);
        return isValid;
    }

    /** @notice Return the current Merkle‑like root. */
    function getRoot() external view returns (bytes32) {
        return root;
    }

    /** @notice Return the number of members currently in the tree. */
    function getMemberCount() external view returns (uint256) {
        return currentTreeSize;
    }

    /** @notice Return a member's commitment by leaf index. */
    function getMemberCommitment(uint256 _index) external view returns (bytes32) {
        require(_index < currentTreeSize, "Index out of bounds");
        return leaves[_index];
    }

    /* --------------------------------------------------------------------
       Internal helpers (placeholders for a full RLN implementation)
    -------------------------------------------------------------------- */
    function _recomputeRoot() internal view returns (bytes32) {
        // In a real implementation you would walk the tree and hash pairs.
        // Here we simply return the stored root for demonstration.
        return root;
    }
}
