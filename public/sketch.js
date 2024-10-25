//this is all clientside stuff for SENDER
//todo: make video call with sounds (TWO MICS OUCHIES), send gyroscopica data (its just floats, used for movement ig)
//todo: video doesnt render on the receiving end for some godforsaken reason istg, gotta work on that
//todo: https://doc-kurento.readthedocs.io/en/stable/tutorials/node/tutorial-one2one.html this might help
//socketIo setup from big man thomas
let io_socket = io();
let clientSocket = io_socket.connect(); //replace url with heroku stuff i imagine
let socketId = -1;
//let clientType = document.getElementById("script").className; //set to S or R, S for sender, R for receiver
let clientType; //s for sender, r for receiver, determined by whether or not the navigator detects a webcam
let gyroscopeData;

//mediaPipe setup from Alex
//https://github.com/mattelim/p5-mediapipe-segmentation
const isFlipped = true;

let segmentMask;
let segmentImage;
let videoImage;
//mediapipe stuff that thomas shoveled in
let networkVideoImage;
let capture;
let sendVideoReady = true;
let testimg;
let WIDTH = 640;
let HEIGHT = 480;

const videoElement = document.getElementsByClassName("input_video")[0];
videoElement.style.display = "none";
//these two are deadass used for a singular reference in the webcam setup because the function that does that resides outisde of p5js and therefore cant reference it for some reason
let dw;
let dh;
//socketio networking ------------------------------------------------------------------------------------------------------------------
clientSocket.on("connect", function(data){
  console.log("connected to server");
  clientSocket.emit("clientJoin", socketId);
})
clientSocket.on('serverMessage', function(data){
  console.log("received a message from server: " + data + " your clientType is " + clientType);
})
clientSocket.on('serverSendGyroData', function(data){
  if(clientType == 'r'){
    gyroscopeData = data;
  }
})
clientSocket.on("serverSendRawCameraFootage", function(data, data2){
  if(clientType == 'r'){
    segmentMask = data;
    segmentImage = data2;
  }
})
document.addEventListener("keydown", keyInput)

function keyInput(e){ //mostly for debugging, press e to switch clientType
  if(e.key == 'e'){
    if(clientType == 's'){
      clientType = 'r';
    }else{
      clientType = 's';
    }
    clientSocket.emit('sendMessage', "flipping clientType to " + clientType);
  }

  if(e.key == 't'){
    window.location.href = 'indexReceiver.html';
  }

  if(e.key == 'k'){
    loadPixels();
    clientSocket.emit('sendPixelArray', pixels);
    clientSocket.emit('sendMessage', "running sendVIdeo");
  }
}

//test
function preload(){
  testimg = loadImage('bigcheese.jpg');
}

function setup(){
 clientType = 's'; //clientType is likely deprecated but whatever
  createCanvas(WIDTH, HEIGHT);
  capture = createCapture(VIDEO);
  capture.hide();
  videoImage = createImage(WIDTH, HEIGHT);
}

function draw(){
  sendVideo();
}

function updateGyroscopeData(newGyroscopeData){
  if(clientType == 's'){
    if(newGyroscopeData != gyroscopeData){ //newGyroscopeData being this frame's gyroscope data/values
      gyroscopeData = newGyroscopeData;
      clientSocket.emit("updateGyroData", gyroscopeData);
    }
  }
}

function sendVideo(){
  rectMode(CORNERS);
  image(capture, 0, 0, WIDTH, HEIGHT);
  videoImage.copy(capture, 0, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT); //last two params are image width and height so change it whatever you want really
  /*
  //send image as pixels?
  loadPixels();
  clientSocket.emit('sendPixelArray', pixels);
  clientSocket.emit('sendMessage', "running sendVIdeo");*/
}