require('dotenv').config();
var fs = require('fs');

const web3 = require('web3');
const express = require('express');
const Tx = require('ethereumjs-tx');

const app = express();

//Infura HttpProvider Endpoint
web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/" + process.env.INFURA_API_KEY));

app.get('/create', function(req,res){
    let x = web3js.eth.accounts.create('ciao');
    res.json({adds: x})
});

app.get('/sendtx',function(req,res){
        let x = web3js.eth.accounts.create('ciao');
        var myAddress = process.env.MY_ADDRESS;
        var privateKey = Buffer.from(process.env.MY_PRIVATE_KEY, 'hex')
        var toAddress = x.address;
        console.log('to: ' + toAddress);

        //contract abi is the array that you can get from the ethereum wallet or etherscan
        //var contractABI =process.env.YOUR_CONTRACT_ABI;
        var contractABI = JSON.parse(fs.readFileSync('abi.json'));

        var contractAddress =process.env.YOUR_CONTRACT_ADDRESS;
        //creating contract object
        var contract = new web3js.eth.Contract(contractABI,contractAddress);

        var count;
        // get transaction count, later will used as nonce
        web3js.eth.getTransactionCount(myAddress).then(function(v){
            //console.log("Count: "+v);
            count = v;
            var amount = web3js.utils.toHex(100);

            //creating raw tranaction
            var rawTransaction = { 
            "from": myAddress, 
            "gasPrice": web3js.utils.toHex(20 * 1e9), 
            "gasLimit": web3js.utils.toHex(210000), 
            "to": contractAddress,
            //"data": contract.methods.transfer(toAddress, amount).encodeABI(), 
            "data": contract.methods.mintToken(toAddress, amount).encodeABI(), 
            "nonce": web3js.utils.toHex(count) 
            }
            //console.log(rawTransaction);
            //creating tranaction via ethereumjs-tx
            var transaction = new Tx(rawTransaction);
            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
            .on('transactionHash', (c) => {
                console.log('trans: ' + c)
                res.json({a: c})
        });
            

            //contract.methods.balanceOf(myAddress).call().then(function(balance){console.log(balance)});
        })
    });
app.listen(3000, () => console.log('Example app listening on port 3000!'))