// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Import OpenZeppelin Contracts
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

// Inherit the imported contract 
// MyNft contract have access to the inherited contract's methods
contract MyNFT is ERC721URIStorage{

    // OpenZeppelin to help us keep track of tokenIds
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor () ERC721 ("MemeNft","Meme"){
        console.log("This is my First Nft contract");
    }

    // Functions to mint nft
    function makeNFT() public {
        // get the current tokenId, this starts at 0
        uint256 newItemId = _tokenIds.current();

        // Mint the nft to the sender using msg.sender
        _safeMint(msg.sender, newItemId);

        // set the NFTs data.
        _setTokenURI(newItemId, "https://jsonkeeper.com/b/PD81");

        console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);

        //Increment the counter for when the next NFT is minted
        _tokenIds.increment();
    }
}