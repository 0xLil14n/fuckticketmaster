// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

import "FuckTicketmaster.sol";

contract Presale is AutomationCompatibleInterface {
    
    enum PresaleState {
        Pending,
        Open,
        Closed
    }
    PresaleState public eventPresaleState;
    uint public eventId;
    mapping(address => bool) public isEligibleForPresale;
    uint256 public presaleStartTime;
    uint256 public presaleCloseTime;

    event PresaleOpened(uint eventId);
    event PresaleClosed(uint eventId);
    FckTcktmstr public ftm;
    
    address public _owner;
    address public _factory;

    constructor(address owner, uint256 _eventId, uint256 _presaleStart, uint256 _presaleClose) {
        eventId = _eventId;
        presaleStartTime = _presaleStart;
        presaleCloseTime = _presaleClose;
        _owner = owner;
        _factory = msg.sender;
        ftm = FckTcktmstr(msg.sender);
    }

    function shouldOpen() public view returns (bool) {
        return eventPresaleState == PresaleState.Pending && block.timestamp >= presaleStartTime && block.timestamp < presaleCloseTime;
    }
    function shouldClose() public view returns (bool) {
        return eventPresaleState == PresaleState.Open && block.timestamp >= presaleCloseTime;
    }
    function needsUpkeep() public view returns(bool) {
        return shouldOpen() || shouldClose();
    }
    
    function updatePresaleState() public returns (PresaleState) {
        if (eventPresaleState == PresaleState.Pending) {
            eventPresaleState = PresaleState.Open;
        } else if (eventPresaleState == PresaleState.Open) {
            eventPresaleState = PresaleState.Closed;
        }
        return eventPresaleState;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        bool openPresale =  shouldOpen();
        bool closePresale = shouldClose(); 
        
        upkeepNeeded = openPresale || closePresale;
        performData = abi.encode(openPresale, closePresale);
        return (upkeepNeeded, performData);

    }

    
    function isEligibleForSale(address id) public view returns (bool) {
        if (eventPresaleState == PresaleState.Closed) {
            // presale is over, open sale
            return true;
        } 
        if(eventPresaleState == PresaleState.Pending) {
            // sale has not started yet
            return false;
        }
        // otherwise it's open
        return isEligibleForPresale[id];
    }


    function performUpkeep(bytes calldata performData ) external override {
        (bool openPresale, bool closePresale) = abi.decode(performData, (bool, bool));
        if(openPresale) {
            eventPresaleState = PresaleState.Open;
            emit PresaleOpened(eventId);
        }
        else if(closePresale) {
            eventPresaleState = PresaleState.Closed;
            emit PresaleClosed(eventId);
        }
    }

    function addToPresale() public {
        require(eventPresaleState == PresaleState.Pending, "Presale Queue is closed.");
        require(ftm.getReputationScore(msg.sender) >= 50);
        isEligibleForPresale[msg.sender] = true;
    }

    function updateStartAndEndTime(uint256 startTime, uint256 endTime) public {
        require(startTime >= block.timestamp, "Start time must be in the future");
        require(endTime >= block.timestamp, "End time must be in the future");
        require(endTime >= startTime, "End time must be after start time");

        presaleStartTime = startTime;
        presaleCloseTime = endTime;

    }


}
