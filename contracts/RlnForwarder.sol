pragma solidity ^0.8.28;

interface ISemaphore {
    function addMember(uint256 identityCommitment) external;
}

// Simple forwarder – the only purpose is to be the authorized caller.
contract RlnForwarder {
    ISemaphore public immutable semaphore;

    constructor(address _semaphore) {
        semaphore = ISemaphore(_semaphore);
    }

    // Forward the call – this function can be called by anyone.
    function registerMember(uint256 identityCommitment) external {
        semaphore.addMember(identityCommitment);
    }
}
