/*
    Copyright (c) 2020, Cameron Hamilton-Rich

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted, provided that the above
    copyright notice and this permission notice appear in all copies.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

    note: Copy env to .env and update the private key to your account.

    ethToDai.js

    Exchange some eth for dai on Uniswap
*/

require('dotenv').config();
const { ChainId, Fetcher, WETH, Route, Trade, TokenAmount, TradeType, Percent } = require('@uniswap/sdk');
const ethers = require('ethers');
var networks = require('@ethersproject/networks');
const util = require('util');

const url = process.env.URL;
console.log("url: " + url);

// ABI imports
const uniswapV2ExchangeAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'; 
const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

const chainId = ChainId.MAINNET;

const init = async () => {
    // pick who your provider
    const provider = new ethers.providers.JsonRpcProvider(url);

    const dai = await Fetcher.fetchTokenData(chainId, daiAddress, provider, "DAI", "Dai Stablecoin");
    console.log(util.inspect(dai));
    const weth = WETH[chainId];
    const pair = await Fetcher.fetchPairData(dai, weth, provider); // use the provider, otherwise you'll get a warning
    const route = new Route([pair], weth);

    // swap 1 ether
    const trade = new Trade(route, new TokenAmount(weth, ethers.utils.parseEther("1.0")), TradeType.EXACT_INPUT);
    console.log("execution price: $" + trade.executionPrice.toSignificant(6));
    console.log("price impact: " + trade.priceImpact.toSignificant(6) + "%"); // always > 0.3%

    const slippageTolerance = new Percent('50', '10000'); // 0.5%
    const amountOutMin = trade.minimumAmountOut(slippageTolerance).raw;
    const amountOutMinHex = ethers.BigNumber.from(amountOutMin.toString()).toHexString();

    const path = [weth.address, dai.address];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 mins time
    const inputAmount = trade.inputAmount.raw;
    const inputAmountHex = ethers.BigNumber.from(inputAmount.toString()).toHexString(); 

    const signer = new ethers.Wallet(process.env.PRIVATE_KEY);
    const account = signer.connect(provider);

    // declare the DAI contract interfaces
    const daiContract = new ethers.Contract(
        daiAddress,
        ['function balanceOf(address owner) external view returns (uint)',
            'function decimals() external view returns (uint8)'],
        account
      );

    // work out our current balance
    let balance = await daiContract.balanceOf(account.address);
    const decimals = await daiContract.decimals();
    console.log("initial balance: " + ethers.utils.formatUnits(balance.toString(), decimals));
    
    // declare the Uniswap contract interface
    const uniswap = new ethers.Contract(
        uniswapV2ExchangeAddress,
        ['function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'],
        account
      );

    const gasPrice = await provider.getGasPrice();

    // do the swap
    const tx = await uniswap.swapExactETHForTokens(
        amountOutMinHex,
        path,
        account.address,
        deadline,
        { 
            value: inputAmountHex, 
            gasPrice: gasPrice.toHexString(),
            gasLimit: ethers.BigNumber.from(150000).toHexString()
        }
    );

    // display the final balance
    balance = await daiContract.balanceOf(account.address);
    console.log("final balance: " + ethers.utils.formatUnits(balance.toString(), decimals));
}

init();
