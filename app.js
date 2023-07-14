console.log("TraitAI HTTP is starting...")

const express = require('express');
const app = express();
app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
// const bodyParser = require('body-parser');
const port = 3000;

app.get('/', (req, res) => res.send('TraitAI HTTP IO'));

app.get('/trait_files', (req, res) => {
    const traitIo = require('./TraitIo');
    let stdout = traitIo.callTraitAi("GetAllTraits", "");
    res.json({ "BotResponse": stdout.toString().trim() });
});

app.get('/needed_birth_values', (req, res) => {
    const traitIo = require('./TraitIo');
    let stdout = traitIo.callTraitAi("GetNeededBirthValues", `Trait=${req.trait}`);
    res.json({ "BotResponse": stdout.toString().trim() });
});

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
    const allqueryParams = req.query;

    //bot_metadata was gotten by our caller.
    //they got the bot metadata from the blockchain
    const os = require("os");
    const fs = require("fs");
    const crypto = require("crypto");
    if (!req.body.bot_metadata) throw new Error("Must pass Tartist metadata in the body");

    //were gonna hard code some traits here in the proxy.
    //not sure if this is where this should go but its good for now.
    const metaData = req.body.bot_metadata;
    metaData.attributes.push({ "value": "GenericBotNamer" });
    metaData.attributes.push({ "value": "GenericBotDescriber" });
    metaData.attributes.push({ "value": "OpenApiChatter" });
    metaData.attributes.push({ "value": "AvatarGenerator" });
    metaData.attributes.push({ "value": "ImageGenerator" });
    metaData.attributes.push({ "value": "FileDownloader" });
    metaData.attributes.push({ "trait_type": "IpfsFilePinner.JWT", "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4NzY4Y2E2ZC0wZTJlLTQ0NGQtOGZmZi0zZGNhODU0ZmM0NzgiLCJlbWFpbCI6InRhcnRpbmZ0QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5NmJkMDU5M2Y3OTM0YjU5MmI1NyIsInNjb3BlZEtleVNlY3JldCI6ImQxZGFiNmVjODVjNGM0YTBjZDM1YmJkYTBkYTk1YWJhNTA4ZmZhMzBmYzBiNmFlMzY1OTI4MGRlNjFmOWRmODQiLCJpYXQiOjE2ODkwNDYzNTR9.FEFbP_nEgm4bwj_kAhlQLlCO7lpsgl_p6DmaWG_iCy8" });

    const botMetadata = JSON.stringify(metaData);
    const metadataHash = crypto.createHash('md5').update(botMetadata).digest('hex');
    const botMetadataFile = `${os.tmpdir()}/${metadataHash}.traitbot`;
    fs.writeFileSync(botMetadataFile, botMetadata);
    let cliContextArgs = "";
    for (const queryParam in allqueryParams) {
        if (queryParam != "prompt") {
            cliContextArgs = `${queryParam}="${allqueryParams[queryParam]}" ${cliContextArgs}`;
        }
    }
    const traitIo = require('./TraitIo');
    const stdout = traitIo.callTraitAi("PromptBot", `bot="${botMetadataFile}" ${cliContextArgs.trim()} ${whatToDo}`);

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

    res.json({ "BotResponse": stdout.toString().trim() });
});


app.listen(port, () => console.log(`TraitAI HTTP IO listening on port ${port}!`));