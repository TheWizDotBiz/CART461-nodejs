//this is all clientside stuff
//todo: make video call with sounds (TWO MICS OUCHIES), send gyroscopica data (its just floats, used for movement ig)
//todo: you need to create a whole ass different node project for the receiving end, crazy ig? idfk
//get socket emit/receive on clients and servers pl0x

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
clientSocket.on('serverSendVideoImage', function(data){
  if(clientType == 'r'){
    //set videoImage to data
    networkVideoImage = data;
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
}

  function updateGyroscopeData(newGyroscopeData){
    if(clientType == 's'){
      if(newGyroscopeData != gyroscopeData){ //newGyroscopeData being this frame's gyroscope data/values
        gyroscopeData = newGyroscopeData;
        clientSocket.emit("updateGyroData", gyroscopeData);
      }
    }
  }

//mediapipe webcam and obfuscation --------------------------------------------------------------------------------------------------------
//webcam detection by thomas
navigator.getMedia = ( navigator.getUserMedia || // use the proper vendor prefix
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia);

navigator.getMedia({video: true}, function() {
// webcam is available
clientType = 's';
}, function() {
// webcam is not available
clientType = 'r';
});


//alex mediapipe stuff
function setup() {
  createCanvas(displayWidth, displayHeight);
  videoImage = createGraphics(displayWidth, displayHeight);
  dw = displayWidth;
  dh = displayHeight;
  networkVideoImage = videoImage;
 // updateTimer = updateFrequency;
  //videoImage.rectMode(CORNER);
}

function onSelfieSegmentationResults(results) {
  print("running onSelfieSegmentationResults");
  if(clientType == 's'){
    segmentMask = results.segmentationMask; //these two used to be outside of that if statements in that function
    segmentImage = results.image;
    clientSocket.emit("sendRawCameraFootage", segmentMask, segmentImage);
  }
}

const selfieSegmentation = new SelfieSegmentation({
  locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1/${file}`;
  },
});

selfieSegmentation.setOptions({
  modelSelection: 1,
});
selfieSegmentation.onResults(onSelfieSegmentationResults);

const camera = new Camera(videoElement, {
  onFrame: async () => {
      await selfieSegmentation.send({ image: videoElement });
  },
  width: dw,
  height: dh,
});
camera.start();

function draw() {
  switch(clientType){
    case 's':
      background(0, 255, 0);
      print("draw s");
      if (segmentImage && segmentMask) {
          videoImage.drawingContext.save();
          videoImage.drawingContext.clearRect(0, 0, displayWidth, displayHeight);
          videoImage.drawingContext.drawImage(
              segmentMask,
              0,
              0,
              displayWidth,
              displayHeight
          );
          videoImage.drawingContext.globalCompositeOperation = 'source-in';
          videoImage.drawingContext.drawImage(
              segmentImage,
              0,
              0,
              displayWidth,
              displayHeight
          );
          videoImage.drawingContext.restore();
      }
  
      push();
      if (isFlipped) {
          translate(width, 0);
          scale(-1, 1);
      }
      displayWidth = width;
      displayHeight = (width * videoImage.height) / videoImage.width;
      image(videoImage, 0, 0, displayWidth, displayHeight); //arg 1 was videoImage
      pop();
      //clientSocket.emit("sendVideoImage", videoImage);
      break;
    case 'r':
      print("draw r");
      background(0,0,255);
      push();
      if (isFlipped) {
          translate(width, 0);
          scale(-1, 1);
      }
      displayWidth = width;
      displayHeight = (width * networkVideoImage.height) / networkVideoImage.width;
      image(networkVideoImage, 0, 0, displayWidth, displayHeight);
      pop();
    break;
    default:
      print("draw error: clientType is neither s nor r");
    break;
  }
  
//Send videoImage over network
/*
if(clientType == 's'){
  if (segmentImage && segmentMask) {
      videoImage.drawingContext.save();
      videoImage.drawingContext.clearRect(0, 0, 1000, 1000);
      videoImage.drawingContext.drawImage(
          segmentMask,
          0,
          0,
          displayWidth,
          displayHeight
      );
      videoImage.drawingContext.globalCompositeOperation = 'source-in';
      videoImage.drawingContext.drawImage(
          segmentImage,
          0,
          0,
          displayWidth,
          displayHeight
      );
      videoImage.drawingContext.restore();
  }
     clientSocket.emit("sendVideoImage", videoImage);
  }else if(clientSocket == 'r'){
    if(networkVideoImage != null){
      videoImage = networkVideoImage;
    }
  }

  push();
  if (isFlipped) {
      translate(width, 0);
      scale(-1, 1);
  }
  displayWidth = width;
  displayHeight = (width * videoImage.height) / videoImage.width;
  image(videoImage, 0, 0, displayWidth, displayHeight);
  pop();
*/
 
}