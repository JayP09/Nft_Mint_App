// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import OpenZeppelin Contracts
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

// helper Functions
import {Base64} from "./libraries/Base64.sol";

// Inherit the imported contract 
// MyNft contract have access to the inherited contract's methods
contract MyNFT is ERC721URIStorage{
    // state variable

    // event 
    event NewNFTMinted(address sender, uint256 tokenId);


    // OpenZeppelin to help us keep track of tokenIds
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    //This is our SVG code. All we need to change is the word that's displayed. Everything else stays the same.
    // split the SVG at the part where it asks for the background color.
    string svgPartOne = "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='";
    string svgPartTwo = "'/><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";
    
    // Create Three array with random words for NFT.
    string[] firstWords = ["Tract","Grass","Fever","Taste","Push","Admiration","Fire","Leak","Genetic","Coast","Reaction","Feeling","Do"];
    string[] secondWords = ["Define","Property","Hour","Cap","Visit","Sink","Aloof","Harsh","Asylum","Eavesdrop","College","Collection","Epic"];
    string[] thirdWords = ["Pump","Pain","Request","Slippery","Aquarium","Kick","Beach","Say","Order","Sense","Cat","Wall","Shit"];

    // Colors array
    string[] colors = ["red","#08C2A8","black","yellow","blue","green"];

    constructor () ERC721 ("Epic NFT","Epic"){
        console.log("This is my First Nft contract");
    }

    // return total mint count
    function getTotalNFTsMintedSoFar() view public returns(uint256) {
        return _tokenIds.current();
    }
    
    // Function to randomly pick a word from each array
    function pickRandomFirstWord(uint256 tokenId) public view returns(string memory) {
        uint256 rand = random(string(abi.encodePacked("FiRST_WORD", Strings.toString(tokenId))));
        // Squash the # between 0 and the length of the array to avoid going out of bounds.
        rand = rand % firstWords.length;
        return firstWords[rand];
    }

    function pickRandomSecondWord(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId))));
        rand = rand % secondWords.length;
        return secondWords[rand];
    }

    function pickRandomThirdWord(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("THIRD_WORD",Strings.toString(tokenId))));
        rand = rand % thirdWords.length;
        return thirdWords[rand];
    }


    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    // Random color picker function
    function pickRandomColor(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(string(abi.encodePacked("COLOR",Strings.toString(tokenId))));
        rand = rand % colors.length;
        return colors[rand];
    }


    // Functions to mint nft
    function makeNFT() public {
        require(_tokenIds.current() <= 100);

        // get the current tokenId, this starts at 0
        uint256 newItemId = _tokenIds.current();

        // Randomly grab one word from each of the three arrays
        string memory first = pickRandomFirstWord(newItemId);
        string memory second = pickRandomSecondWord(newItemId);
        string memory third = pickRandomThirdWord(newItemId);
        string memory combinedWord = string(abi.encodePacked(first,second, third));

        // Add the random color in
        // now Concatenate it all together, and then close the <text> and <svg> tags.
        string memory randomColor = pickRandomColor(newItemId);
        string memory finalSvg = string(abi.encodePacked(svgPartOne, randomColor, svgPartTwo, combinedWord,"</text></svg>"));

        // Get all the Json metadata in place and base64 encode it
        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                // We set the title of our NFT as the generated word.
                combinedWord,'", "description": "An Epic NFTs", "image": "data:image/svg+xml;base64,',
                // We add data:image/svg+xml;base64 and then append our base64 encode our svg.
                Base64.encode(bytes(finalSvg)),
                '"}'
            )
        );

        // Just like before, prepend data:application/json;base64, to our data.
        string memory finalTokenUri = string(
            abi.encodePacked("data:application/json;base64,",json)
        );

        // Mint the nft to the sender using msg.sender
        _safeMint(msg.sender, newItemId);

        // Update your URI
        _setTokenURI(newItemId, finalTokenUri);

        console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);

        //Increment the counter for when the next NFT is minted
        _tokenIds.increment();

        emit NewNFTMinted(msg.sender, newItemId);
    }
}