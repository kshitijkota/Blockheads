// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    // Struct to represent a voter
    struct Voter {
        bool isRegistered;  // Flag indicating whether the voter is registered
        bool hasVoted;      // Flag indicating whether the voter has already cast a vote
    }

    // Mapping to store voters' details
    mapping(address => Voter) public voters;

    // Array to store candidate names
    string[] public candidateList;

    // Mapping to store votes for each candidate
    mapping(string => uint256) public votesReceived;

    // Function to register a voter
    function registerVoter() public {
        require(!voters[msg.sender].isRegistered, "Voter is already registered");

        voters[msg.sender].isRegistered = true;
    }

    // Function to cast a vote
    function castVote(string memory candidateName) public {
        require(voters[msg.sender].isRegistered, "Voter is not registered");
        require(!voters[msg.sender].hasVoted, "Voter has already voted");

        // Increment vote count for the candidate
        votesReceived[candidateName]++;

        // Mark the voter as having voted
        voters[msg.sender].hasVoted = true;
    }

    // Function to add a candidate to the list
    function addCandidate(string memory candidateName) public {
        // You can add additional logic here, such as checking if the candidate already exists
        candidateList.push(candidateName);
    }

    // Function to retrieve the total votes for a candidate
    function getVotesForCandidate(string memory candidateName) public view returns (uint256) {
        return votesReceived[candidateName];
    }

    // Function to retrieve the list of candidates
    function getCandidateList() public view returns (string[] memory) {
        return candidateList;
    }
}
