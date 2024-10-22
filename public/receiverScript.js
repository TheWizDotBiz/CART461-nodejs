//socketIo setup from big man thomas
let io_socket = io();
let clientSocket = io_socket.connect(); //replace url with heroku stuff i imagine
let socketId = -1;

let videoImage;

clientSocket.on("connect", function(data){
    console.log("connected to server as a receiver");
    clientSocket.emit("clientJoin", socketId);
})
clientSocket.on("serverSendVideoImage", function(data){
    console.log("received server videoImage " + data);
})

function setup(){
    createCanvas(displayWidth, displayHeight);
    background(255, 0, 0);
}

function draw(){
    if(videoImage != null){
        renderCameraFootage();
    }
}

function renderCameraFootage(){
    rectMode(CORNERS);
    image(videoImage, 0, 0, displayWidth, displayHeight);
}

