const socket = io();

let start = false;
var counter = 0;
var occasionalRotationX = 0;
var occasionalRotationY = 0;

function setup(){
    createCanvas(100, 100);
    background(255, 0, 255);
    let button = createButton("start");
    button.mousePressed(getAccel);
}

function draw(){
    if(start){
        background(255);
        text(rotationX, width/2, height/2);
        if(counter == 1){
            occasionalRotationX = rotationX;
            occasionalRotationY = rotationY;
            sendPhoneData();
            counter = 0;
        }else{
            counter++;
        }
    }
    
}

function getAccel(){
    DeviceMotionEvent.requestPermission().then(response => {
        if (response == 'granted') {
            console.log("accelerometer permission granted");
            // Do stuff here
            start = true;
            background(255, 0, 255);
        }
    });
}

function sendPhoneData(){
    let phoneDataX = rotationX;
    let phoneDataY = rotationY;
    socket.emit("phoneData", phoneDataX, phoneDataY);
    console.log("Data transferred: x: "+phoneDataX+", y: "+phoneDataY);

}