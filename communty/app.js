var express = require('express');
var request = require("request");
var jsdom = require('jsdom');
const
{
    JSDOM
} = jsdom;
const
{
    window
} = new JSDOM('<html></html>');
var $ = require('jquery')(window);
var app = express();
app.use(express.static('app'))


var fs = require('fs');

var pKey = fs.readFileSync(__dirname + "/key.key");
var cert = fs.readFileSync(__dirname + "/cert.cert");
var bundle = fs.readFileSync(__dirname + "/bundle.ca-bundle");
var creds = {key: pKey, cert: cert, ca: bundle, requestCert: false,rejectUnauthorized: false};


var server = require('https').createServer(creds, app);
var io = require('socket.io')(server);

var baseUrl = "https://faceinthe.space:3000"
var tempImage;
var data;

server.listen(6969);
console.log(process.env.IP);
var path = require('path');

