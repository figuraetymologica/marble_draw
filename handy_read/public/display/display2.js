const socket = io();
let img;

function preload(){
    //img = loadImage("canvas5.png");
}

function setup(){
    createCanvas(100, 100);
    background(255, 0, 255);
}

function mousePressed(){
    (async function(){
        img = await loadImage("canvas5.png");
        img.resize(512, 512);
        img.loadPixels();
        let askGPT = await img.canvas.toDataURL();
        console.log(askGPT);
    })();
    //console.log(base64img);
    //socket.emit("askGPT", askGPT);
    //console.log("I asked to ask GPT");

}