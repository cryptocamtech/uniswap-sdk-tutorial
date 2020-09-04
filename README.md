# Uniswap V2 Tutorial

A Uniswap V2 SDK tutorial that swaps Ether for DAI using a forked mainnet 

The code can be downloaded from https://github.com/cryptocamtech/uniswap-sdk-tutorial

Preparation:
```
    cp env .env  
    // update variables in .env as appropriate  
    npm update
    chmod a+x ./fork_main.sh
```

And run
```
    ./fork_main.sh 
    node ethToDai.js
```
