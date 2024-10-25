//as the name implies, this is serverside stuff
let express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
let static = require('node-static');
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));
const fs = require("fs");
server.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
io.on('connection', (socket)=>{
  console.log("client has connected");
  socket.on('sendMessage', function(data){
    console.log("received message " + data);
    socket.emit("serverMessage", data);
  })
  socket.on('updateGyroData', function(data){
    console.log("received gyroData " + data);
    socket.emit("serverSendGyroData", data);
  })
  socket.on('sendVideoImage', function(data){
    console.log("received VideoImage from Sender " + data);
    socket.emit("serverSendVideoImage", data);
  })
  socket.on('sendRawCameraFootage', function(data, data2){
    console.log("received raw camera footage: " + data + " " + data2);
    socket.emit("serverSendRawCameraFootage", data, data2);
  })
  socket.on('sendPixelArray', function(data){
    console.log("received pixel array");
    socket.emit('serverSendPixelArray', data);
  })
})
/*
//Import express
let express = require('express');

// Create the Express app
let app = express();

// Set the port used for server traffic.
let port = 3000;

// Middleware to serve static files from 'public' directory
//app.use(express.static('public'));

//socket.io setup things
const server = require('http').createServer();
const io = require('socket.io')(server);
let static = require('node-static');
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

io.on('connection', client =>{
  console.log("socket.io connection registered");
});
io.on('connect', function(socket){
  console.log("client joined with socketID " + socket);
})

//Run server at port
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});*/
