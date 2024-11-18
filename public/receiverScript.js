//socketIo setup from big man thomas
let io_socket = io();
let clientSocket = io_socket.connect(); //replace url with heroku stuff i imagine
let socketId = -1;

let videoImage;
let networkPixelArray;

let WIDTH = 640;
let HEIGHT = 480;

clientSocket.on("connect", function(data){
    console.log("connected to server as a receiver");
    clientSocket.emit("clientJoin", socketId);
})
clientSocket.on("serverSendVideoImage", function(data){
    console.log("received server videoImage " + data);
    videoImage = data;
})
clientSocket.on('serverSendPixelArray', function(data){
    console.log("received network pixel array " + data);
    networkPixelArray = data;
})

let myCanvas;
let otherStream;
function setup(){
    myCanvas = createCanvas(displayWidth, displayHeight);
    background(255, 0, 0);
    let p5lm = new p5LiveMedia(this, "CAPTURE", myCanvas, "CART498")
    p5lm.on('stream', gotStream);
}

function draw(){
    if(otherStream != null){
        image(otherStream, 0,0,displayWidth, displayHeight);
    }
    //drawPixelArray();
    /*
    if(videoImage != null){
        renderCameraFootage();
    }*/
}

function renderCameraFootage(){
    rectMode(CORNERS);
    image(videoImage, 0, 0, displayWidth, displayHeight);
}

function drawPixelArray(){
    if(networkPixelArray != null){
        set(networkPixelArray);
        updatePixels(0, 0, WIDTH, HEIGHT)
    }
}

function gotStream(stream, id){
    console.log("received a stream!");
    otherStream = stream;
}