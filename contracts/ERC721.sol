pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MockCongressSol is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address public owner;
    address public minter;
    string public baseURI = "ipfs://";
    string public contractURI = "QmTPTu31EEFawxbXEiAaZehLajRAKc7YhxPkTSg31SNVSe";


    constructor() ERC721("PAC DAO PHATCAT", "PHATCAT") { 
        owner = msg.sender;
        minter = msg.sender;
    }

    function mint(address recipient, string memory tokenURI)
        public
        returns (uint256)
    {
        require(msg.sender == owner);
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function counter() 
        public view
        returns (uint256)
    {
        return _tokenIds.current();
    }

    function totalSupply() 
    	public view
	returns (uint256)
    {
	return _tokenIds.current();
    }

    function set_owner(address new_owner)
        public
        returns (uint256)
    { 
        require(msg.sender == owner);
        owner = new_owner;
    }

    function setBaseURI(string memory newURI) public {
        // Only Owner
        require(msg.sender == owner);
        baseURI = newURI;
    }

    function seetMinter(address addr) public {
        require(msg.sender == owner);
        minter = addr; 
    }

}
