import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

// abi file
import MyNFT from "./artifacts/contracts/MyNFT.sol/MyNFT.json";

// Constants
const TWITTER_HANDLE = "JayPanchalTwts";
const CONTRACT_ADDRESS = "0xc2fb5158d3A88701f49AFfA8bfb6348C71a7f0D4";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}`;
const TOTAL_MINT_COUNT = 100;
const RARIBLE_LINK = `https://rinkeby.rarible.com/collection/${CONTRACT_ADDRESS}`

const App = () => {
  // state variable used to store our user's public wallet
  const [currentAccount, setCurrentAccount] = useState("");
  const [mintCount, setMintCount] = useState("");
  const [connectedContract, setConnectedContract] = useState({});

  const checkIfWalletIsConnected = async () => {
    /*
    First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
    } else {
      console.log("we have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("found authorized account:", account);
      setCurrentAccount(account);
      loadBlockChainData();
    } else {
      console.log("No authorized account found");
    }
  };

  const loadBlockChainData = async () => {
    const { ethereum } = window;

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyNFT.abi,
          signer
        );
    setConnectedContract(connectedContract);
    console.log(connectedContract)

    let mintCount = await connectedContract.getTotalNFTsMintedSoFar();
    console.log(mintCount.toNumber());
    setMintCount(mintCount.toNumber());
  }

  // connectWallet method
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      let chainId = await ethereum.request({method: 'eth_chainId'});
      console.log("Connected to chain " + chainId);

      // string hex code of the chainID of the Rinkeby test network
      const rinkebyChainId = "0x4";
      if(chainId !== rinkebyChainId){
        alert("you Are not connected to the Rinkeby Test Network!");
      }

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener()
    } catch (error) {
      console.log(error);
    }
  };

  // setUp our listener
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
         // Capture event when our contract throws it
        connectedContract.on("NewNFTMinted",(from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
        })

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      let chainId = await ethereum.request({method: 'eth_chainId'});
      console.log("Connected to chain " + chainId);

      // string hex code of the chainID of the Rinkeby test network
      const rinkebyChainId = "0x4";
      if(chainId !== rinkebyChainId){
        alert("you Are not connected to the Rinkeby Test Network!");
      }

      if (ethereum) {
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeNFT();

        console.log("Mining... please wait");
        await nftTxn.wait();

        console.log(
          `Mined, see transcation: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );

        let mintCount = await connectedContract.getTotalNFTsMintedSoFar();
        setMintCount(mintCount.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container" style={{marginTop:"80px"}}>
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (
            <button
              onClick={askContractToMintNft}
              className="cta-button connect-wallet-button"
            >
              Mint NFT
            </button>
          )}
        </div>
        <div>
        <p className="header gradient-text" style={{fontSize:"30px"}}>Available: {TOTAL_MINT_COUNT-mintCount}/100</p>
        </div>
        <div style={{marginTop:"80px"}}>
            <button
              href={OPENSEA_LINK}
              className="cta-button connect-wallet-button"
            >
              OpenSea
            </button>
        </div>
        <div style={{marginTop:"20px"}}>
            <button
              href={RARIBLE_LINK}
              className="cta-button connect-wallet-button"
            >
              Rarible
            </button>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
