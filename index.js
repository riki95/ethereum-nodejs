require('dotenv').config();
var fs = require('fs');

const web3 = require('web3');
const express = require('express');
const Tx = require('ethereumjs-tx');
const app = express();

//Infura HttpProvider Endpoint
web3js = new web3(new web3.providers.HttpProvider("https://ropsten.infura.io/" + process.env.INFURA_API_KEY));

//Default variables for web3
var myAddress = process.env.MY_ADDRESS;
var privateKey = Buffer.from(process.env.MY_PRIVATE_KEY, 'hex')
var contractABI = JSON.parse(fs.readFileSync('abi.json'));
var contractAddress =process.env.YOUR_CONTRACT_ADDRESS;
var contract = new web3js.eth.Contract(contractABI,contractAddress);

var ropstenURL = 'https://ropsten.etherscan.io/';
var ropstenAddressURL = ropstenURL + 'address/';
var ropstenTxURL = ropstenURL + 'tx/';


app.get('/create', () => {
    let x = web3js.eth.accounts.create();
    console.log('Created Address: ' + x.address)
})

app.get('/sendtx',function(res){
    let newAccount = web3js.eth.accounts.create();
    var toAddress = newAccount.address;
    console.log('ToAddress: ' + ropstenAddressURL + toAddress)

    var count;
    // get transaction count, later will used as nonce
    web3js.eth.getTransactionCount(myAddress).then(function(v){
        count = v;
        var amount = web3js.utils.toHex(1);
        //creating raw tranaction
        var rawTransaction = { 
            "from": myAddress, 
            "gasPrice": web3js.utils.toHex(20 * 1e9), 
            "gasLimit": web3js.utils.toHex(8000029), 
            "to": contractAddress,
            "data": contract.methods.mintToken(toAddress, amount).encodeABI(), 
            "nonce": web3js.utils.toHex(count) 
        }
        var transaction = new Tx(rawTransaction);

        //signing transaction with private key
        transaction.sign(privateKey);
        //sending transacton via web3js module
        web3js.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
        .on('transactionHash', (transaction) => {
            console.log('Transaction: ' + ropstenTxURL + transaction)
        });
    })
});

app.get('/sendmoretx',function(){
    var reporter = web3js.eth.accounts.create();
    console.log('ReporterAddress: ' + ropstenAddressURL + reporter.address);

    var addresses = []
    for(var i = 0; i < 5;i++) {
        let newAccount = web3js.eth.accounts.create();
        var toAddress = newAccount.address;
        console.log('VoterAddress: ' + ropstenAddressURL + toAddress)
        addresses.push(toAddress.toString());
    }
    var count;
    // get transaction count, later will used as nonce
    web3js.eth.getTransactionCount(myAddress).then(function(v){
        count = v;
        var amount_reporter = web3js.utils.toHex(2);
        var amount_voters = web3js.utils.toHex(1);

        web3js.eth.getBlock("latest", false, (error, result) => {
            //creating raw tranaction
            var rawTransaction = { 
                "from": myAddress, 
                "gasPrice": web3js.utils.toHex(20 * 1e9), 
                "gasLimit": web3js.utils.toHex(result.gasLimit), 
                "to": contractAddress,
                "data": contract.methods.drop(reporter.address, addresses, amount_reporter, amount_voters).encodeABI(), 
                "nonce": web3js.utils.toHex(count) 
            }
            var transaction = new Tx(rawTransaction);

            //signing transaction with private key
            transaction.sign(privateKey);
            //sending transacton via web3js module
            web3js.eth.sendSignedTransaction('0x'+transaction.serialize().toString('hex'))
            .on('transactionHash', (transaction) => {
                console.log('Transaction: ' + ropstenTxURL + transaction)
            });
        });
    })
});

app.get('/gasLimit', () => {
    web3js.eth.getBlock("latest", false, (error, result) => {
        console.log(result.gasLimit)
        // => 8000029
    });
})

app.get('/gasPrice', () => {
    web3js.eth.getGasPrice((err, res) => {
        console.log(res);
    })
})

app.listen(3000, () => {
    console.log('Example app listening on port 3000!');
    console.log('http://localhost:3000/create');
    console.log('http://localhost:3000/sendtx');
    console.log('http://localhost:3000/sendmoretx');
    console.log('http://localhost:3000/gas')
});