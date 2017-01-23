var express = require('express');
var mysql = require("mysql");
var port = Number(process.env.PORT || 3000);
var path = require('path');
var bodyParser = require('body-parser');


var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3000);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var urlencodedParser = bodyParser.urlencoded({
    extended: false
});





var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "project"
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');

});


io.on('connection', function (socket) {

  socket.on('airlines', function (data) {

    con.query("SELECT * FROM airlines,flight WHERE airlines.AID=flight.AID AND airlines.ANAME='"+data+"';",function(err,rows){
      if(err) throw err;
      socket.emit('airlinesdetails', rows);
  });

});
});



con.query("SELECT * FROM airlines,flight WHERE airlines.AID=flight.AID AND flight.DEST='NEW DELHI'",function(err,rows){
  if(err) throw err;

  io.sockets.on('connection', function (socket) {
    socket.emit('arrival', rows);
  });
//   for (var i = 0; i < rows.length; i++) {
//   console.log(rows[i].namea);
// };
});


con.query("SELECT * FROM airlines,flight WHERE airlines.AID=flight.AID AND flight.ORIGIN='NEW DELHI'",function(err,rows){
  if(err) throw err;

  io.sockets.on('connection', function (socket) {
    socket.emit('departures', rows);
  });
//   for (var i = 0; i < rows.length; i++) {
//   console.log(rows[i].namea);
// };
});


con.query("SELECT * FROM airlines,flight WHERE airlines.AID=flight.AID AND flight.ORIGIN!='NEW DELHI' AND flight.DEST!='NEW DELHI'",function(err,rows){
  if(err) throw err;

  io.sockets.on('connection', function (socket) {
    socket.emit('transit', rows);
  });
//   for (var i = 0; i < rows.length; i++) {
//   console.log(rows[i].namea);
// };
});


// con.end(function(err) {
//   // The connection is terminated gracefully
//   // Ensures all previously enqueued queries are still
//   // before sending a COM_QUIT packet to the MySQL server.
// });


// app.listen(3000, function() {
//     console.log('Example app listening on port 3000!');
// });
