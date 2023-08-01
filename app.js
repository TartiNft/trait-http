console.log("TraitAI HTTP is starting...")

const express = require('express');
require('dotenv').config();
const app = express();
app.use(express.json());
const port = 3000;

/**
 * Get index. Return basic string to show life.
 */
app.get('/', (req, res) => res.send('TraitAI HTTP IO'));

/**
 * Get all available Traits from TRAIT AI
 */
app.get('/trait_files', (req, res) => {
    const traitIo = require('./TraitIo');
    let stdout = traitIo.callTraitAi("GetAllTraits", "");
    res.json({ "BotResponse": stdout.toString().trim() });
});

/**
 * Get the needed birth values for the specified Trait from TRAIT AI
 */
app.get('/needed_birth_values', (req, res) => {
    const traitIo = require('./TraitIo');
    let stdout = traitIo.callTraitAi("GetNeededBirthValues", `Trait=${req.query.trait}`);
    res.json({ "BotResponse": stdout.toString().trim() });
});

/**
 * Prompt a Trait AI bot to Do Something
 */
app.post("/prompt_bot", (req, res) => {

    //Validation guard clauses
    if (!process.env.WAPP_PATH) {
        throw new Error("WAPP_PATH environment variable must be set");
    }
    if (!req.body.bot_metadata) throw new Error("Must pass Tartist metadata in the body");
    if (!req.body.bot_metadata.attributes) throw new Error("Invalid metadata: " + metaData);

    //Get the metadata for the bot they wish to prompt
    const metaData = req.body.bot_metadata;

    //We add some Traits add here because we need them, but do not want to expose to the Dapp (usually because of secure tokens)
    metaData.attributes.push({ "trait_type": "IpfsFilePinner.JWT", "value": process.env.IPFS_FILE_PINNER_JWT });

    //Auto addd several other traits that we know the bots will need to make music.
    //This is hard-coded for the initial demo only to help the users and keep it easy.
    metaData.attributes.push({ "value": "AvatarGenerator" });
    metaData.attributes.push({ "value": "AudioFileHandler" });
    metaData.attributes.push({ "value": "AudioProcessor" });
    metaData.attributes.push({ "value": "AudioVstProcessor" });
    metaData.attributes.push({ "value": "GenericBotNamer" });
    metaData.attributes.push({ "value": "GenericBotDescriber" });
    metaData.attributes.push({ "value": "OpenApiChatter" });
    metaData.attributes.push({ "value": "ImageGenerator" });
    metaData.attributes.push({ "value": "FileDownloader" });
    metaData.attributes.push({ "value": "FileArchivist" });
    metaData.attributes.push({ "value": "GenericSoundSelector" });
    metaData.attributes.push({ "value": "GenericMusicThoerist" });

    //Store the metadata on disk for consumption by the Trait AI engine.
    //Use MD5 hash of the metadata to generate a unique, but reusable, file name.
    const botMetadata = JSON.stringify(metaData);
    const crypto = require("crypto");
    const metadataHash = crypto.createHash('md5').update(botMetadata).digest('hex');
    const os = require("os");
    const botMetadataFile = `${os.tmpdir()}/${metadataHash}.traitbot`;
    const fs = require("fs");
    fs.writeFileSync(botMetadataFile, botMetadata);

    //Convert the passed HTTP req vars into CLI args that Trait AI will understand
    const allqueryParams = req.query;
    let cliContextArgs = "";
    for (const queryParam in allqueryParams) {
        if (queryParam != "prompt") {
            cliContextArgs = `${queryParam}="${allqueryParams[queryParam]}" ${cliContextArgs}`;
        }
    }

    //Invoke the Trait AI engine to process the prompt and return stdout
    const traitIo = require('./TraitIo');
    const whatToDo = req.query.prompt;
    const stdout = traitIo.callTraitAi("PromptBot", `bot="${botMetadataFile}" ${cliContextArgs.trim()} ${whatToDo}`);
    res.json({ "BotResponse": stdout.toString().trim() });
});

//Start the HTTP server
app.listen(port, () => console.log(`TraitAI HTTP IO listening on port ${port}!`));

//This is almost a direct line to the CLI and highly suseptable to injection attacks.
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