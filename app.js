console.log("TraitAI HTTP is starting...")

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('TraitAI HTTP IO'));

app.post("/prompt_bot", (req, res) => {
    //this is almost a direct line to the CLI and highly suseptable to injection attacks.
    //do not expose to the public internet, in this form

    //here is some SO code I found and modified but have not tried.
    //It uses arguments instead of string interpliation to call command which
    //would fix the injection concern.
    //Also not sure if the `bot=${botMetadataFile}` part is safe
    /**
        const { spawn } = require('child_process');
        // Note that the arguments are in an array, not using string interpolation
        const promptBot = spawn(process.env.WAPP_PATH, ['PromptBot', `bot=${botMetadataFile}`, whatToDo]);
    
        promptBot.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        });
    
        promptBot.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
        });
    
        promptBot.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
        });
     */

    if (!process.env.WAPP_PATH) {
        throw new Error("WAPP_PATH environment variable must be set");
    }

    const whatToDo = req.query.prompt;

    //bot_metadata was gotten by our caller.
    //they got the bot metadata from the blockchain
    const os = require("os");
    const fs = require("fs");
    const crypto = require("crypto");
    const botMetadata = req.body.bot_metadata;
    const metadataHash = crypto.createHash('md5').update(botMetadata).digest('hex');
    const botMetadataFile = `${os.tmpdir()}/${metadataHash}.traitbot`;
    fs.writeFileSync(botMetadataFile, botMetadata);
    const stdout = execSync(`${process.env.WAPP_PATH} PromptBot bot="${botMetadataFile}" ${whatToDo}`);

    //find any local filenames in stdout and translate them to IPFS CIDs (after uploading/pinning them to Pinata)
    // foreach stdout as responseItem
    //     if responseItem is localfile
    //         upload local file to IPFS and get CID
    //              stdOut replace localfilename with IPFS url
    //NAH scratch that!!! 
    //The bot will just upload shit to IPFS and then return the CID.
    //I kow originally the whole point of using NodeJs wa to use the Pinata SDK here
    //but just makes way more sense to let the bot do it
    //and then IPFS acts as a nice file broker. 
    //Otherwise we need a separate file broker or we need to pass around potentially large data directly.
    //akes a lot of convenient sense to just use IPFS.
    //So to recap, by the time we get here, and file paths will already be IPFS.
    //We need give bot a trait to do it

    res.json({ "BotResponse": stdout.toString() });
});


app.listen(port, () => console.log(`TraitAI HTTP IO listening on port ${port}!`));