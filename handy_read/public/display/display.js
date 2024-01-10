//Init socket connection
const socket = io();

var startGame = true; //start screen currently deactivated

//drawing pen position
var posX = 0;
var posY = 0;

//draw curve using changing position data
var curveData = [0, 0, 0, 0]; //x1-x4 + y1-y4
var curveDefStep = 0; //ends at 2

//init drawing activity
var firstValueReceived = false;
var startCanvas = false;
var drawingAllowed = false;

//smooth
var smoothNum = 5;
var lastValues = [];
var smoothArrayPos = 0;
var total = [0, 0];
var average = [0, 0];

//canvas to be base64 encoded
var drawing;

function setup(){
    createCanvas(500, 500);
    background(198, 0, 0);

    //fill smoothing array with empty slots
    for(let i = 0; i < smoothNum; i++){
        lastValues.push([0, 0]);
    }

    //establish socket on event (receiving phone rotation data from server), using socket data
    socket.on("test", (phoneRotX, phoneRotY) => {
        //constrain and map phone rotation data
        let constrainedY = constrain(phoneRotX, -5, 5);
        let constrainedX = constrain(phoneRotY, -8.5, 8.5);
        let mappedY = map(constrainedY, -5, 5, 0+10, width-10);
        let mappedX = map(constrainedX, -8.5, 8.5, 0+10, height-10);

        //smoothing
        // subtract the last reading
        total[0] = total[0] - lastValues[smoothArrayPos][0];
        total[1] = total[1] - lastValues[smoothArrayPos][1];

        //add last reading to array
        lastValues[smoothArrayPos]= [mappedX, mappedY];

        //add reading to total
        total[0] = total[0] + lastValues[smoothArrayPos][0];
        total[1] = total[1] + lastValues[smoothArrayPos][1];

        //advance to next pos in array
        smoothArrayPos++;

        //calc average
        average[0] = total[0] / smoothNum;
        average[1] = total[1] / smoothNum;

        //hand current position over to position variables
        posX = average[0];
        posY = average[1];

        //at the end of the array? wrap around
        if(smoothArrayPos >= smoothNum){
            smoothArrayPos = 0;
    
            drawingAllowed = true;
            if(!firstValueReceived){
                firstValueReceived = true;
                startCanvas = true;
                //to avoid line from (0, 0) at the beginning
                curveData[2] = posX;
                curveData[3] = posY;
            }
        }
      });
}

function draw(){
    //wait until game has started - currently inactivated because not developed enough
    /*if(!startGame){
        fill(255);
        textAlign(CENTER, CENTER);
        text("players, turn your knobs all the way to the right!", width/2, height/2);
        if(posX > width - width/4 && posY < 0 + height/4){
            startGame = true;
            background(198, 0, 0);
        }

    }*/
    if(startCanvas && startGame){
        stroke(255);
        fill(255);
        strokeWeight(5);
        //draw user movement as captured by phone
        if(curveDefStep == 0){
            curveData[0] = curveData[2];
            curveData[1] = curveData[3];
            curveDefStep++;
        }else if(curveDefStep == 1){
            curveData[2] = posX;
            curveData[3] = posY;
            curveDefStep++;
        }else{
            curveDefStep = 0;
            curve(curveData[0], curveData[1], curveData[0], curveData[1], curveData[2], curveData[3], curveData[2], curveData[3]);
        }
    }
}

//send drawing to GPT4-Vision: shortcut until properly added in code
function keyPressed(){
    sendCanvas();
}

function sendCanvas(){
    //get canvas image data and encode it in base64, send to server
    (async function(){
        drawing = await get();
        drawing.resize(512, 512);
        drawing.loadPixels();
        let askGPT = await drawing.canvas.toDataURL();
        //console.log(askGPT);
        socket.emit("askGPT", askGPT);
        console.log("I asked to ask GPT");
    })();

}
