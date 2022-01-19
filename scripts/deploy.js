const main = async () => {
    const nftContractFactory = await hre.ethers.getContractFactory('MyNFT');
    const nftContract = await nftContractFactory.deploy();
    await nftContract.deployed();
    console.log("Contract deployed to:",nftContract.address);

    // function call 
    // wait for it to be mined
    await (await nftContract.makeNFT()).wait();
    console.log("Minted Nft #1")
    
    // mint another
    await (await nftContract.makeNFT()).wait();
    console.log("Minted NFT #2")
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

runMain();