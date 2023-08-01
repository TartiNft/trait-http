/**
 * Invoke TRAIT AI Engine via system process
 * @param {string} traitAiFunction 
 * @param {string} argsString 
 * @returns {string} stdout
 */
const callTraitAi = (traitAiFunction, argsString) => {
  const execSync = require('child_process').execSync;
  if (!argsString) {
    argsString = "";
  }
  return execSync(`${process.env.WAPP_PATH} ${traitAiFunction} ${argsString}`);
};

module.exports = { callTraitAi };