console.log("TraitAI HTTP is starting...")

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('TraitAI HTTP IO'));

app.get("/prompt_bot", (req, res) => {
    //this is almost a direct line to the CLI and highly suseptable to injection attacks.
    //do not expose to the public internet, in this form

    const whatToDo = req.query.what_to_do;
    const botId = req.query.bot_id;
    const pathToWapp = "C:\\Users\\admin\\Documents\\Beatmaker\\BeatMaker\\Bin\\wapp.bat";

    const { execSync } = require('child_process');
    let stdout = execSync(`${pathToWapp} PromptBot bot_id=${botId} ${whatToDo}`);
    res.json({ "BotResponse": stdout.toString() });
});


app.listen(port, () => console.log(`TraitAI HTTP IO listening on port ${port}!`));