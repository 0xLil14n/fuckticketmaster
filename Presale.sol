// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "contract-9d8b91b7db.sol";

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
    /**
     * Use an interval in seconds and a timestamp to slow execution of Upkeep
     */
    uint public immutable interval;
    uint public lastTimeStamp;
    

    constructor(uint updateInterval) {
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
    }

    function shouldOpen() public view returns (bool) {
        return eventPresaleState == PresaleState.Pending && block.timestamp >= presaleStartTime && block.timestamp < presaleCloseTime;
    }
    function shouldClose() public view returns (bool) {
        return eventPresaleState == PresaleState.Open && block.timestamp >= presaleCloseTime;
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
        require(presaleStartTime < block.timestamp, "Presale Queue is closed.");
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
