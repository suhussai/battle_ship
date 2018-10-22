// server.js
// where your node app starts

// init project
var express = require('express');

var app = express();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/tests", function (req, res) {
  res.sendFile(__dirname + '/views/tests.html');
});

// listen for requests :)
var listener = app.listen(3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
