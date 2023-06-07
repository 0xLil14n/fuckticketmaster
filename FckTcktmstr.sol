// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

contract FckTcktmstr is ERC1155, Ownable, ERC1155Supply, PaymentSplitter {
    uint public publicPrice = 0.0001 ether;
    // uint public presalePrice = 0.001 ether;
    
    uint public MAX_SUPPLY = 3;
    uint public MAX_PER_WALLET = 3;
    uint256 private currentTokenId = 0;

    mapping(uint256 => address) public eventOwners;
    mapping(uint256 => uint256) public tokenListPrices;
    mapping(uint256 => uint256) public supplyLeft;
    mapping(address => mapping(uint256 => uint256)) public tokenResalePrices;
    mapping(address => mapping(uint256 => uint256)) soldFor;
    mapping(address => uint256) private purchasesPerWallet;

    mapping(address => mapping(uint256 => uint256)) public numTokensForSale;

    event TicketCreated(uint256 indexed ticketId, address indexed owner, uint256 ticketSupply, uint256 priceInWei, string eventName, string date, string venueName);
    event TicketResold(address indexed from, address indexed to, uint256 indexed tokenId, uint256 amount);
    event RoyaltyDisbursed(address indexed owner, uint256 tokenId, uint256 profit);
    event TicketSold(address indexed owner, uint256 ticketId, uint256 quantity);
    event TokenListedForSale(address indexed owner, uint256 indexed tokenId, uint256 price, uint256 amount);

    constructor(
        address[] memory _owners, 
        uint256[] memory _shares
    ) 
        ERC1155("") 
        PaymentSplitter(_owners, _shares)
    {}

    function mint(uint256 id, uint256 amount, uint256 price) internal {
        require(eventOwners[id] != 0x0000000000000000000000000000000000000000, "Invalid id. Does not exist");
        require(totalSupply(id) + amount <= supplyLeft[id], "Maximum supply already reached");
        // require(purchasesPerWallet[msg.sender] < MAX_PER_WALLET, "Wallet purchase limit reached");
        require(msg.value >= price * amount, "Insufficient funds");

        purchasesPerWallet[msg.sender] += 1;
        supplyLeft[id] -= amount;
        _mint(msg.sender, id, amount, "");
        soldFor[msg.sender][id] = price;
    }

    function createTicket(uint256 ticketSupply, uint256 priceInWei, string memory eventName, string memory date, string memory venueName) public {
        require(ticketSupply > 0, "Invalid ticketSupply. Ticket supply must be greater than zero");
        require(priceInWei > 0, "Invalid price. Price must be greater than zero");
        uint256 ticketId = currentTokenId + 1;
        currentTokenId = ticketId;
        supplyLeft[ticketId] = ticketSupply;
        tokenListPrices[ticketId] = priceInWei;
        eventOwners[ticketId] = msg.sender;
        emit TicketCreated(ticketId, msg.sender, ticketSupply, priceInWei, eventName, date, venueName);
    }

    function publicMint(uint256 ticketId, uint256 amount)
        public
        payable
    {

        mint(ticketId, amount, publicPrice);
        emit TicketSold(msg.sender, ticketId, amount);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner 
    {
        _mintBatch(to, ids, amounts, data);
    }

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function setSalesPrice(uint256 ticketId, uint256 price, uint256 amount) public {
        require(price > 0, "Invalid price");
        require(amount > 0, "Invalid amount");
        require(balanceOf(msg.sender, ticketId) >= amount, "Invalid qty. Not enough tokens");
        require(eventOwners[ticketId] != msg.sender, "Wallets are only allowed 1 listing per event.");
        tokenResalePrices[msg.sender][ticketId] = price;
        numTokensForSale[msg.sender][ticketId] = amount;
        emit TokenListedForSale(msg.sender, ticketId, price, amount);
        // TODO emit event here
    }

    function buyResoldToken(address tokenOwner, uint256 ticketId, uint256 amount) public payable {
        uint256 salesPrice = tokenResalePrices[tokenOwner][ticketId];

        require(salesPrice > 0, "Token not for sale");
        require(amount > 0, "Must be valid amount");
        require(balanceOf(tokenOwner, ticketId) >= amount, "Not enough tokens available");
        require(msg.value >= salesPrice * amount, "Insufficient payment");
        require(numTokensForSale[tokenOwner][ticketId] >= amount, "Not enough tokens available for sale");
        
        // Transfer the token to the buyer
        _safeTransferFrom(tokenOwner, msg.sender, ticketId, amount, "");
        // Transfer the payment to the token owner
        payable(tokenOwner).transfer(salesPrice * amount);
        numTokensForSale[tokenOwner][ticketId] -= amount;
        if(numTokensForSale[tokenOwner][ticketId] == 0) {
            tokenResalePrices[tokenOwner][ticketId] = 0;
        }

        // emit TokenResold()
        emit TicketResold(tokenOwner, msg.sender, ticketId, amount);

        uint256 profit = salesPrice - tokenListPrices[ticketId];
        if (profit > 0) {
            payable(eventOwners[ticketId]).transfer(profit);
            emit RoyaltyDisbursed(owner(), profit, ticketId);
        }
        
    }
}
