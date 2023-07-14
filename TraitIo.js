export const callTraitAi = (traitAiFunction, argsString) => {
  const execSync = require('child_process').execSync;
  return execSync(`${process.env.WAPP_PATH} ${traitAiFunction} ${argsString}`);
};