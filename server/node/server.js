var https = require("https");
var express = require('express'),
  app = express(),
  port = 3000; //process.env.PORT || 3000,

  bodyParser = require('body-parser');

var fs = require("fs");

var pKey = fs.readFileSync(__dirname + "/key.key");
var cert = fs.readFileSync(__dirname + "/cert.cert");
var bundle = fs.readFileSync(__dirname + "/bundle.ca-bundle");
var creds = {key: pKey, cert: cert, ca: bundle, requestCert: false,rejectUnauthorized: false};



app.use(bodyParser.json());
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb'}));
app.use(express.static("public"));
console.log(process.env.IP);

var httpsServer = https.createServer(creds, app);
httpsServer.listen(3000, function(err){console.log(err); });

var routes = require('./api/routes/serverRoutes'); //importing route
routes(app); //register the route

//app.listen(80,3000);
console.log('todo list RESTful API server started on: ' + port);
