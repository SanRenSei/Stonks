import runtime from "../Runtime.js";

export default class Invocation {

  constructor(tokens) {
    this.tokens = tokens;
    this.curries = [];
  }

  addToken(token) {
    this.tokens.push(token);
  }

  curry(value) {
    this.curries.unshift(value);
  }

  async invoke() {
    for (let i=0;i<this.curries.length;i++) {
      runtime.push(this.curries[i]);
    }
    for (let i=0;i<this.tokens.length;i++) {
      await runtime.executeToken(this.tokens[i]);
    }
  }

  toString() {
    return this.tokens.join(' ');
  }

}