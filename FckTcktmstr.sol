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

    
    mapping(address => mapping(uint256 => uint256)) private tokenSalesPrices;
    mapping(address => mapping(uint256 => uint256)) private soldFor;
    mapping(string => uint256) public uuidToTokenId;
    mapping(address => uint256) private purchasesPerWallet;

    mapping(address => mapping(uint256 => uint256)) public numTokensForSale;

    event TicketResold(address indexed from, address indexed to, uint256 indexed tokenId);
    event RoyaltyDisbursed(address indexed owner, uint256 tokenId, uint256 profit);
    event TicketSold(address indexed owner, uint256 tokenId, string indexed ticketId, uint256 quantity);

    constructor(
        address[] memory _owners, 
        uint256[] memory _shares
    ) 
        ERC1155("") 
        PaymentSplitter(_owners, _shares)
    {}

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function uri(uint256 _id) public view virtual override returns (string memory) {
        require(exists(_id), "URI: nonexistent token");

        return string(abi.encodePacked(super.uri(_id), Strings.toString(_id)));
    }
    function mint(uint256 id, uint256 amount, uint256 price) internal {
        require(totalSupply(id) + amount <= MAX_SUPPLY, "Maximum supply already reached");
        require(purchasesPerWallet[msg.sender] < MAX_PER_WALLET, "Wallet purchase limit reached");
        require(msg.value == price * amount, "Insufficient funds");

        purchasesPerWallet[msg.sender] += 1;

        _mint(msg.sender, id, amount, "");
        soldFor[msg.sender][id] = price;
    }

    function addUuid(string memory uuid, uint256 tokenId) public {
        uuidToTokenId[uuid] = tokenId;
    }

    function publicMint(string memory uuid, uint256 amount)
        public
        payable
    {
        
        uint256 id = uuidToTokenId[uuid];

        mint(id, amount, publicPrice);
// event TicketSold(address indexed owner, uint256 tokenId, string indexed ticketId, uint256 quantity);
        emit TicketSold(msg.sender, id, uuid, amount);
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

    function setSalesPrice(uint256 tokenId, uint256 price, uint256 amount) public {
        require(price > 0, "Invalid price");
        require(amount > 0, "Invalid amount");
        require(balanceOf(msg.sender, tokenId) >= amount, "Invalid qty. Not enough tokens");
        tokenSalesPrices[msg.sender][tokenId] = price;
        numTokensForSale[msg.sender][tokenId] = amount;
        // TODO emit event here
    }

    function buyResoldToken(address tokenOwner, uint256 tokenId, uint256 amount) public payable {
        uint256 salesPrice = tokenSalesPrices[tokenOwner][tokenId];

        require(salesPrice > 0, "Token not for sale");
        require(amount > 0, "Must be valid amount");
        require(balanceOf(tokenOwner, tokenId) >= amount, "Not enough tokens available");
        require(msg.value >= salesPrice * amount, "Insufficient payment");
        require(numTokensForSale[tokenOwner][tokenId] >= amount, "Not enough tokens available for sale");
        
        // Transfer the token to the buyer
        _safeTransferFrom(tokenOwner, msg.sender, tokenId, amount, "");
        // Transfer the payment to the token owner
        payable(tokenOwner).transfer(salesPrice * amount);
        numTokensForSale[tokenOwner][tokenId] -= amount;
        tokenSalesPrices[tokenOwner][tokenId] = 0;

        // emit TokenResold()
        emit TicketResold(tokenOwner, msg.sender, tokenId);

        uint256 profit = salesPrice - soldFor[tokenOwner][tokenId];
        if (profit > 0) {
            payable(owner()).transfer(profit);
            emit RoyaltyDisbursed(owner(), profit, tokenId);
        }
        
    }
}
