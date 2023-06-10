// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import "@openzeppelin/contracts/security/Pausable.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
// import "@openzeppelin/contracts/utils/Strings.sol";
// import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "Presale.sol";
import "ReputationScore.sol";

contract FckTcktmstr is ReputationScore, AutomationCompatibleInterface { 
    
    // uint256 public currentTokenId = 0;

    mapping(uint256 => address) public eventOwners;
    mapping(uint256 => uint256) public tokenListPrices;
    mapping(uint256 => uint256) public supplyLeft;
    // mapping(address => mapping(uint256 => uint256)) public tokenResalePrices;
    

    mapping(uint256 => Presale) public presales;

    mapping(address => mapping(uint256 => uint256)) public numTokensForSale;

    event TicketCreated(uint256 indexed ticketId, address indexed owner, uint256 ticketSupply, uint256 priceInWei, string eventName, string date, string venueName);
    event TicketResold(address indexed from, address indexed to, uint256 indexed tokenId, uint256 amount);
    event RoyaltyDisbursed(address indexed owner, uint256 tokenId, uint256 profit);
    event TicketSold(address indexed owner, uint256 ticketId, uint256 quantity);
    event TokenListedForSale(address indexed owner, uint256 indexed tokenId, uint256 price, uint256 amount);
    event PresaleCreated(uint256 eventId, uint256 startTime, uint256 endTime);
    event PresaleStateUpdated(uint256 indexed eventId, Presale.PresaleState presaleStateBefore, Presale.PresaleState presaleStateAfter);

    constructor() 
    {}

    function createPresale(uint256 ticketSupply, uint256 priceInWei, string memory eventName, string memory date, string memory venueName, uint256 startTime, uint256 endTime) public {
        createTicket(ticketSupply, priceInWei, eventName, date, venueName);
        presales[currentTokenId] = new Presale(msg.sender, currentTokenId, startTime, endTime);
        emit PresaleCreated(currentTokenId, startTime, endTime);
    }

    function hasPresale(uint256 id) public view returns (bool) {
        return address(presales[id] ) != 0x0000000000000000000000000000000000000000;
    }
    function getReputationScore(address id) public view returns(uint){
        uint purchases = 0;
        uint resales = 0;
        for(uint i = 0; i<=currentTokenId; i++) {
            if(balanceOf(id, i) > 0) {
                purchases++;
            }
            if(tokenResalePrices[id][i] > 0) {
                resales++;
            }
        }
        if(purchases == 0) {
            return 50;
        }
        
        return 100 - ((resales/purchases)*100);
        // return 100*(a - b);
        // return aw- b;
        // return b;
    }

    function mint(uint256 id, uint256 amount) public payable {
        // require(eventOwners[id] != 0x0000000000000000000000000000000000000000, "Invalid ticket id");
        require((hasPresale(id)|| presales[id].isEligibleForSale(msg.sender)) && (totalSupply(id) + amount <= supplyLeft[id]) && (msg.value >= tokenListPrices[id] * amount), "Sale not available or insf funds");
        // require(totalSupply(id) + amount <= supplyLeft[id], "Max. supply reached");
        // require(msg.value >= tokenListPrices[id] * amount, "Insufficient funds");
        
        supplyLeft[id] -= amount;
        _mint(msg.sender, id, amount, "");
        emit TicketSold(msg.sender, id, amount);
    }

    function createTicket(uint256 ticketSupply, uint256 priceInWei, string memory eventName, string memory date, string memory venueName) public {
        require(ticketSupply > 0 && priceInWei > 0, "Invld Supply,Price");
        uint256 ticketId = currentTokenId + 1;
        currentTokenId = ticketId;
        supplyLeft[ticketId] = ticketSupply;
        tokenListPrices[ticketId] = priceInWei;
        eventOwners[ticketId] = msg.sender;
        emit TicketCreated(ticketId, msg.sender, ticketSupply, priceInWei, eventName, date, venueName);
    }
   

    function setSalesPrice(uint256 ticketId, uint256 price, uint256 amount) public {
        require(price > 0 && amount > 0 && (balanceOf(msg.sender, ticketId) >= amount && (eventOwners[ticketId] != msg.sender)), "Bad price amt evt");
        
        // require(balanceOf(msg.sender, ticketId) >= amount, " Not enough tokens");
        // require(eventOwners[ticketId] != msg.sender, "Only 1 listing per event");
        tokenResalePrices[msg.sender][ticketId] = price;
        numTokensForSale[msg.sender][ticketId] = amount;
        emit TokenListedForSale(msg.sender, ticketId, price, amount);
    }

    function buyResoldToken(address tokenOwner, uint256 ticketId, uint256 amount) public payable {
        uint256 salesPrice = tokenResalePrices[tokenOwner][ticketId];

        require(amount > 0 && msg.value >= salesPrice * amount && (balanceOf(tokenOwner, ticketId) >= amount && salesPrice > 0 && numTokensForSale[tokenOwner][ticketId] >= amount), "Invld amt, payment");
        // require(balanceOf(tokenOwner, ticketId) >= amount && salesPrice > 0 && numTokensForSale[tokenOwner][ticketId] >= amount, "Not enough tkts");
        
        
        // Transfer the token to the buyer
        _safeTransferFrom(tokenOwner, msg.sender, ticketId, amount, "");
        // Transfer the payment to the token owner
        payable(tokenOwner).transfer(salesPrice * amount);
        numTokensForSale[tokenOwner][ticketId] -= amount;
        if(numTokensForSale[tokenOwner][ticketId] == 0) {
            tokenResalePrices[tokenOwner][ticketId] = 0;
        }

        emit TicketResold(tokenOwner, msg.sender, ticketId, amount);

        uint256 profit = salesPrice - tokenListPrices[ticketId];
        if (profit > 0) {
            payable(eventOwners[ticketId]).transfer(profit);
            emit RoyaltyDisbursed(eventOwners[ticketId], profit, ticketId);
        }
        
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (bool, bytes memory performData)
    {
        return (needsUpkeep(), performData);

    }
    function needsUpkeep() public view returns(bool) {
        for(uint i =1; i<= currentTokenId; i++) {
            if(presales[i].needsUpkeep()) {
                return true;
            }
        }
        return false;
    }

    function performUpkeep(bytes calldata /*performData */) external override {
         for(uint i =1; i<= currentTokenId; i++) {
            Presale p = presales[i];
            if(p.needsUpkeep()) {
                Presale.PresaleState s = p.eventPresaleState();
                Presale.PresaleState s2 = p.updatePresaleState();
                emit PresaleStateUpdated(i, s, s2);
            }
        }
        
    }
}
