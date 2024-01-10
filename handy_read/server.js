import fs from "fs";
import express from "express";
import https from "https";
import { Server } from "socket.io";
import OpenAI from "openai";

const { createServer } = https;
const openai = new OpenAI();

//my fake certificate data for https on localhost
var options = {
    key: fs.readFileSync("./katha.test.key"),
    cert: fs.readFileSync("./katha.test.crt")
};

const app = express();
app.use(express.static('public'));
const httpsServer = createServer(options, app);

console.log('My socket server is running');

const io = new Server(httpsServer, {
});

io.on("connection", (socket) => {
    console.log(socket.id);

    //function on receiving phone rotation data
    socket.on("phoneData", sendPhoneData);
    //function on receiving canvas data
    socket.on("askGPT", wellAskGPT);

    //transfer phone rotation data to canvas
    function sendPhoneData(phoneDataX, phoneDataY){
        //console.log("data received: x: "+phoneDataX+", y: "+phoneDataY);
        io.emit("test", phoneDataX, phoneDataY);
    }

    //let GPT-4-Vision tell us what it sees in the canvas :-)
    function wellAskGPT(askGPT){
        let base64img = askGPT;
        async function main() {
            const response = await openai.chat.completions.create({
              model: "gpt-4-vision-preview",
              messages: [
                {
                  role: "user",
                  content: [
                    //{ type: "text", text: "In very few words, what’s in this image?" },
                    { type: "text", text: "What’s in this image?" },
                    {
                      type: "image_url",
                      image_url: {
                        "url": base64img,
                      },
                    },
                  ],
                },
              ],
              max_tokens: 100
            });
            console.log(response.choices[0]);
          }
          main();
    }

});

httpsServer.listen(5500);