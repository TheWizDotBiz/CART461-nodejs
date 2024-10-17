//todo: make video call with sounds (TWO MICS OUCHIES), send gyroscopica data (its just floats, used for movement ig)
//get socket emit/receive on clients and servers pl0x
let io_socket = io();
let clientSocket = io_socket.connect(); //replace url with heroku stuff i imagine
let socketId = -1;


clientSocket.on("connect", function(data){
  console.log("connected to server");
  clientSocket.emit("clientJoin", socketId);
})
clientSocket.on('serverMessage', function(data){
  console.log("received a message from server: " + data);
})
document.addEventListener("keydown", keyInput)

function keyInput(){
  clientSocket.emit('sendMessage', "pressed a key");
}

function setup() {
    createCanvas(400, 400);
  }
  
  function draw() {
    background(220);
  }
