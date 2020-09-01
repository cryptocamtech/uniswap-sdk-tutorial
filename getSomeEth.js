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

    getSomeEth.js

    Do a Robin Hood and take from the rich and give to the poor (us!)
*/
require('dotenv').config();
const Web3 = require('web3');

const url = process.env.URL;
console.log("url: " + url);
const web3 = new Web3(url);

// "borrow" from this account - must be unlocked in ganache-cli
const ethBorrowAccount = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

const init = async () => {
    // get our account
    const myAccount = process.env.ACCOUNT;
    console.log("myAccount: " + myAccount);

    // do the transfer
    const txHash = await web3.eth.sendTransaction({
            from: ethBorrowAccount, 
            to: myAccount, 
            value: web3.utils.toWei('100', 'ether')
        })
        .catch(e => { throw Error('Error sending transaction: ' + e.message); });

    console.log('txHash: ' + txHash.transactionHash);
    const balance = await web3.eth.getBalance(myAccount);
    console.log("eth balance: " + web3.utils.fromWei(balance, 'ether'));
}

init();
