#!/bin/bash
source .env

for (( ; ; ))
do
    pkill -f "node /usr/local/bin/ganache-cli"
    ganache-cli --fork https://mainnet.infura.io/v3/$INFURA_PROJECT_ID -v -i 1 --unlock 0x742d35Cc6634C0532925a3b844Bc454e4438f44e & 
    sleep 2
    node getSomeEth.js;
    # wait for < 30 mins
    sleep 1750
done
