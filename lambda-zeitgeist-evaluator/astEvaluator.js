const actions = require('./zeitgeistActions.js');

let runCommand = async (command) => {
  if (actions[command.type]) {
    let args = [];
    let argIndex = 0;
    while (command['arg'+argIndex]) {
      args.push(command['arg'+argIndex]);
      argIndex++;
    }
    await actions[command.type](...args);
  } else {
    console.log('No command for ' + command.type);
  }
}

module.exports = async (ast) => {
  for (let i=0;i<ast.length;i++) {
    let command = ast[i];
    await runCommand(command);
  }
}