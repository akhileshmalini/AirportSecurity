var express = require('express');
var mysql = require("mysql");
var port = Number(process.env.PORT || 3000);
var path = require('path');
var bodyParser = require('body-parser');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json 
app.use(bodyParser.json())

server.listen(3000);
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
/*
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
*/
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "guest",
  database: "project",
  multipleStatements: true
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');

});


io.on('connection', function (socket) {
  /*
      io.sockets.on('connection', function (socket){
        setInterval(()=>{
          socket.emit('dbcon', con);
        }, 1000);
      });
  */
      io.sockets.on('connection', function (socket) {
        setInterval(function(){
          con.query("SELECT * FROM AIRLINES, AIRLINE_CONTACTS WHERE AIRLINES.AID=AIRLINE_CONTACTS.AID;",function(err,rows){
            if(err) throw err;
            socket.emit('airlinesdetails', rows);
          }
        )}, 1000);
      
      }); 

      io.sockets.on('connection', function (socket) {
        setInterval (()=> {
          con.query("SELECT * FROM AIRLINES,ARRIVALS WHERE AIRLINES.AID=ARRIVALS.AID;",function(err,rows){
            if(err) throw err;
            socket.emit('arrival', rows);
          }
        )}, 1000);
      });
      
      io.sockets.on('connection', function (socket) {
        setInterval (()=> {
          con.query("SELECT * FROM AIRLINES,FLIGHT WHERE AIRLINES.AID=FLIGHT.AID AND FLIGHT.ORIGIN='NEW DELHI'",function(err,rows){
            if(err) throw err;
            socket.emit('departures', rows);
            //   for (var i = 0; i < rows.length; i++) {
            //   console.log(rows[i].namea);
            // };
          }
        )}, 1000);
      });

      io.sockets.on('connection', function (socket) {
        setInterval(() => {
          con.query("SELECT * FROM AIRLINES,FLIGHT WHERE AIRLINES.AID=FLIGHT.AID AND FLIGHT.ORIGIN!='NEW DELHI' AND FLIGHT.DEST!='NEW DELHI'",function(err,rows){
            if(err) throw err;
            socket.emit('transit', rows);
            //   for (var i = 0; i < rows.length; i++) {
            //   console.log(rows[i].namea);
            // };
          }
        )}, 1000);
      });

      io.sockets.on('connection', function (socket) {
        setInterval(()=> {
          con.query("SELECT * FROM PASSENGER_MANAGEMENT",function(err,rows){
            if(err) throw err;
            socket.emit('passengerdetails', rows);
            //   for (var i = 0; i < rows.length; i++) {
            //   console.log(rows[i].namea);
            // };
          }
        )}, 1000);
    });
});

app.post('/insertFlight', function (req, res){

  var flight_no = req.body.flight_no;
  var aid = req.body.aid;
  var origin = req.body.origin.toUpperCase();
  var dest = req.body.dest.toUpperCase();
  if (origin == null)
  origin = 'NEW DELHI';
  if (dest == null)
  dest = 'NEW DELHI';
  var eta = req.body.eta;
  var etd = req.body.etd;
  if (dest == 'NEW DELHI')
  {
    etd=null;
  }
  
  if (origin == 'NEW DELHI')
  {
    eta=null;
  }
  
  if (dest != 'NEW DELHI' && origin != 'NEW DELHI')
  {
    etd=null;
    eta=null;
  }
  
  var gate = req.body.gate;
  flight = {
    flight_no: flight_no,
    gate: gate,
    origin: origin,
    dest: dest,
    aid: aid,
    eta: eta,
    etd: etd
  };
  con.query("INSERT INTO FLIGHT SET ?", flight, function(err,rows){
    console.log(flight);
      console.log (rows);
    res.sendFile('public/index.html', {
      root: __dirname
					});
  });
});

app.post('/insertPassenger', function (req, res){

  var ssid = req.body.ssid;
  var name = req.body.name;
  var nation = req.body.nation;
  var flight_no = req.body.flight_no;
  var visa = req.body.visa;
  var declarations = req.body.declarations;
  if (declarations != 'PROVIDED')
    declarations = 'NOT PROVIDED';
  var flag = 'GREEN';
  if (visa == null || declarations == 'NOT PROVIDED')
    flag = 'YELLOW';

  con.query ("SELECT SSID FROM CRIMINALS", function (err, rows){
    if (err)
      throw err;
    for (i = 0; i < rows.length; i++)
    {
      if (rows [i].SSID == ssid)
      {
        flag = 'RED';
        return flag;
      }
    }
    });

  var passenger = {
    ssid: ssid,
    name: name.toUpperCase(),
    nation: nation.toUpperCase(),
    visa: visa,
    declarations: declarations,
    flag: flag,
    flight_no: flight_no
  };
  con.query("INSERT INTO PASSENGER_MANAGEMENT SET ?", passenger, function(err, rows){
      var criminals = [];
  con.query ("SELECT SSID FROM CRIMINALS", function (err, rows){
    if (err)
      throw err;
      for (i = 0; i < rows.length; i++)
        criminals [i] = rows [i].SSID;
      for (i = 0; i < criminals.length; i++)
        if (criminals[i] == ssid)
        {
          con.query ("UPDATE PASSENGER_MANAGEMENT SET FLAG='RED' WHERE SSID=?", ssid, function(err, rows){
            res.sendFile('public/index.html', {
                root: __dirname
              });
          });
          break;
        }
        res.sendFile('public/index.html', {
                root: __dirname
              });
  });
			});


  

});

  app.post('/insertAirline', function (req, res){

  var aid = req.body.aid;
  var name = req.body.name.toUpperCase();
  var contact = req.body.contact;
  
  var gate = req.body.gate;
  airline = {
    aid: aid,
    name: name
  };
  contact = {
    aid: aid,
    contact_no: contact,
  };
  con.query("INSERT INTO AIRLINES SET ?", airline, function(err,rows){
    if (err)
      throw err;
    con.query("INSERT INTO AIRLINE_CONTACTS SET ?", contact, function(err, rows){
      res.sendFile('public/index.html', {
      root: __dirname
					});
        });
    });
    
  });
/*
var socket1 = io.connect('http://localhost:3000');
socket1.on('con', function(con){
					flight = {
						flight_no='24567',
						gate='5',
						origin='MOSCOW',
						dest='NEW DELHI',
						aid='45692',
					}	

					con.query("INSERT INTO FLIGHT SET ?", flight, function(err,res){
						return;
						});
				});*/