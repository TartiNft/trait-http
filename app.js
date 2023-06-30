console.log("TraitAI HTTP is starting...")

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('TraitAI HTTP IO'));

app.get("/prompt_bot", (req, res) => {
    //this is almost a direct line to the CLI and highly suseptable to injection attacks.
    //do not expose to the public internet, in this form

    if (!process.env.WAPP_PATH) {
        throw new error("WAPP_PATH environment variable must be set");
    }

    const whatToDo = req.query.what_to_do;
    //bot_metadatafile was created by our caller.
    // they got the bot metadata from the blockchain, 
    //saved to a temp file, and that path is sent to us
    const botMetadataFile = req.query.bot_metadatafile;

    let stdout = execSync(`${process.env.WAPP_PATH} PromptBot bot=${botMetadataFile} ${whatToDo}`);
    res.json({ "BotResponse": stdout.toString() });
});


app.listen(port, () => console.log(`TraitAI HTTP IO listening on port ${port}!`));