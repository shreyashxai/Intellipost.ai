import { config } from 'dotenv';
import readline from 'readline/promises';
import { GoogleGenAI } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
// const { log } = require('console');
config();

let tools = []
const ai = new GoogleGenAI({apiKey: process.env.GENAI_API_KEY});

const mcpClient = new Client({
    name: "example-client",
    version: "1.0.0",
    transport: new SSEClientTransport({
        url: "http://localhost:3001/sse"
    })
})
 
const chatHistory = [];
const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout,
});


mcpClient.connect(new SSEClientTransport( new URL("http://localhost:3001/sse")))
.then(async () => {
    console.log("Connected To Server");
    
        tools  = (await mcpClient.listTools()).tools.map(tool=>{
        return {
            name: tool.name,
            ddescription: tool.description,
            parameters: {
                type: tool.inputSchema.type,
                properties: tool.inputSchema.properties,
                required: tool.inputSchema.required
            }
        }
    });
    
    chatLoop();

})


async function chatLoop(){

const question = await rl.question('You: ');

chatHistory.push({
    role:"user",
    parts: [
        {
        text:question,
        type:"text"
}
]
})

const response = await ai.models.generateContent({
    model:"gemini-2.0-flash-001",
    contents: chatHistory,
    config:{
        tools: [
           {
             functionDeclarations: tools
           }
        ]
    }
})

const responseText = response.candidates[ 0 ].content.parts[ 0 ].text;
chatHistory.push({
    role:"model",
    parts:[
        {
            text: responseText,
            type: "text"
        }
    ]
})

console.log(`Ai: ${responseText}`);

chatLoop();

}


