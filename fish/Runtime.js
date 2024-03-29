import getMatchingCommand, {removeCommand} from "./Commands.js";

class Runtime {

  constructor() {
    this.stack = [];
    this.commandOverride = null;
    this.aliases = [];
  }

  pop() {
    if (this.stack.length>0) {
      let toReturn = this.stack.splice(this.stack.length-1, 1)[0];
      for (let i=0;i<this.aliases.length;i++) {
        if (this.aliases[i].index >= this.stack.length) {
          removeCommand(this.aliases[i].alias);
          this.aliases.splice(i, 1);
          i--;
        }
      }
      return toReturn;
    }
  }

  peekIndex(index) {
    return this.stack[this.stack.length-1-index];
  }

  push(val) {
    this.stack.push(val);
  }

  clear() {
    this.stack = [];
  }

  setCommandOverride(fn) {
    this.commandOverride = fn;
  }

  removeCommandOverride() {
    this.commandOverride = null;
  }

  addStackAliases(aliases) {
    for (let i=0;i<aliases.length;i++) {
      this.aliases.push({
        index: i + this.stack.length - aliases.length,
        alias: aliases[i]
      });
    }
  }

  async executeToken(token) {
    let command = getMatchingCommand(token, this.commandOverride);
    if (command.action) {
      let action = command.action;
      await action(token);
      return;
    }
    if (command.code) {
      let tokens = command.code.split(' ');
      for (let i=0;i<tokens.length;i++) {
        await this.executeToken(tokens[i]);
      }
      return;
    }
    throw 'Badly configured token: ' + token;
  }

}

let instance = new Runtime();
export default instance;