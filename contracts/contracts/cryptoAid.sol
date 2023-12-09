// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../interfaces/IAnonAadhaarVerifier.sol";

contract CryptoAid {
    address public owner;  // Contract owner's address
    address public anonAadhaarVerifierAddr;
    mapping(uint256 => mapping(address => uint256)) public fundRequests; // Mapping to store requested amounts
    uint256 public totalEtherReceived; // Variables to track total Ether received


    string public data;
    uint256 public f;
    uint256 public a;

    constructor(address _verifierAddr) {
        owner = msg.sender;  // Set the contract deployer as the owner
        anonAadhaarVerifierAddr = _verifierAddr;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    // Fund structure
    struct Fund {
        uint256 id;
        address creator;
        uint creationDate;
        uint256 amount;
        uint256 targetAmount;
        address targetAddress;
        string title;
        string description;
        bool completed;
    }
    // Donation structure
    struct Donation {
        uint256 amount;
        address author;
    }
    // List of funds
    Fund[] public listFunds;
    // Counter to keep track of funds
    uint public fundCounter;
    // List of donations for each fund
    mapping(uint256 => Donation[]) public contributionFunds;
    // List of contributions for each author
    mapping(address => uint256) public contributionAuthors;

    // Events
    event FundCreated(uint256 id);
    event DonationCreated(uint256 amount, address author);
    event FundCompleted(uint256 id);
    event EtherReceived(address sender, uint256 amount); // Event to log Ether receipt

    // Custom errors
    error FundDoesNotExist();
    error AmountLessThanZero();
    error AddressNotValid();
    error FundAlreadyCompleted();
    error SendAmountFailed();

    // Function to create a new Fund
    function createFund(
        uint256 targetAmount,
        string calldata title,
        string calldata description
    ) public {
        if (targetAmount <= 0) revert AmountLessThanZero();
        address targetAddress = address(this);
        if (targetAddress == address(0)) revert AddressNotValid();

        // Create new fund
        Fund memory newFund = Fund(
            fundCounter,
            msg.sender,
            block.timestamp,
            0,
            targetAmount,
            targetAddress,
            title,
            description,
            false
        );
        listFunds.push(newFund);

        emit FundCreated(fundCounter);
        fundCounter++;
    }

    // Function to create a donation to a fund
    function donate(uint256 fundId) public payable {
        uint256 amount = msg.value;

        // Checks
        if (amount <= 0) revert AmountLessThanZero();
        if (fundId >= fundCounter) revert FundDoesNotExist();
        if (listFunds[fundId].completed == true) revert FundAlreadyCompleted();

        // Update amount of contribution for author
        contributionAuthors[msg.sender] = contributionAuthors[msg.sender] + amount;

        // Update amount of fund
        listFunds[fundId].amount = listFunds[fundId].amount + amount;

        // Check if Fund is completed
        if (listFunds[fundId].amount >= listFunds[fundId].targetAmount) {
            sendFund(fundId);
        }

        // Create new donation
        Donation memory donation = Donation(amount, msg.sender);
        contributionFunds[fundId].push(donation);

        emit DonationCreated(amount, msg.sender);
    }

    // Internal function to send amount of fund if it is completed
    function sendFund(uint256 fundId) internal {
        if (fundId >= fundCounter) revert FundDoesNotExist();
        if (listFunds[fundId].completed == true) revert FundAlreadyCompleted();

        // Send amount of fund to the target address
        (bool result, ) = payable(listFunds[fundId].targetAddress).call{
            value: listFunds[fundId].amount
        }("");
        if (result == false) revert SendAmountFailed();

        // Set completed the fund
        listFunds[fundId].completed = true;

        emit FundCompleted(fundId);
    }


    // Updated function for verification and requesting funds
    function verifyAndRequest(
        uint256[2] calldata _pA, 
        uint[2][2] calldata _pB, 
        uint[2] calldata _pC, 
        uint[34] calldata _pubSignals,
        uint256 fundId,
        uint256 amount
    ) public {
        require(fundId < fundCounter, "Fund does not exist");
        bool isVerified = IAnonAadhaarVerifier(anonAadhaarVerifierAddr).verifyProof(_pA, _pB, _pC, _pubSignals);
        if (isVerified) {
            f = fundId;
            a = amount;
            data = "reached here";
            fundRequests[fundId][msg.sender] = amount;
        }
    }

        // Function to release funds for a specific fundId
    function releaseFund(uint256 fundId) public onlyOwner {
        require(fundId < fundCounter, "Fund does not exist");
        Fund storage fund = listFunds[fundId];

        uint256 totalAvailableAmount = fund.amount;
        uint256 totalRequestedAmount;
        address[] memory requesters = new address[](fundCounter);
        uint256[] memory amounts = new uint256[](fundCounter);
        uint256 requesterCount = 0;

        // Iterate to find total requested amount and store requesters
        for (uint256 i = 0; i < fundCounter; i++) {
            address requester = msg.sender;
            uint256 requestedAmount = fundRequests[fundId][requester];
            if (requestedAmount > 0) {
                totalRequestedAmount += requestedAmount;
                requesters[requesterCount] = requester;
                amounts[requesterCount] = requestedAmount;
                requesterCount++;
            }
        }

        if (totalAvailableAmount < totalRequestedAmount) {
            // Release funds proportionally
            for (uint256 i = 0; i < requesterCount; i++) {
                uint256 proportionalAmount = (amounts[i] * totalAvailableAmount) / totalRequestedAmount;
                payable(requesters[i]).transfer(proportionalAmount);
                fundRequests[fundId][requesters[i]] = 0;
            }
        } else {
            // Transfer the requested amount to each requester
            for (uint256 i = 0; i < requesterCount; i++) {
                payable(requesters[i]).transfer(amounts[i]);
                fundRequests[fundId][requesters[i]] = 0;
            }
        }

    }

    // Function to return list of funds
    function getFunds() public view returns (Fund[] memory) {
        return listFunds;
    }

    // Function to return list of donations of a fund
    function getDonations(
        uint256 fundId
    ) public view returns (Donation[] memory) {
        if (fundId >= fundCounter) revert FundDoesNotExist();
        return contributionFunds[fundId];
    }

    // Function to return total amount of contributions of an author
    function getContributions(address author) public view returns (uint256) {
        return contributionAuthors[author];
    }

    // Function to receive Ether. msg.data must be empty
    receive() external payable {
        totalEtherReceived += msg.value; // Update the total Ether received
        emit EtherReceived(msg.sender, msg.value); // Emit an event for logging
    }

    // Fallback function is called when msg.data is not empty
    fallback() external payable {
        totalEtherReceived += msg.value; // Update the total Ether received
        emit EtherReceived(msg.sender, msg.value); // Emit an event for logging
    }

    function setFundRequest(uint256 fundId, address requester, uint256 amount) public onlyOwner {
        fundRequests[fundId][requester] = amount;
    }
}