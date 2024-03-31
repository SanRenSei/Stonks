import runtime from "../Runtime.js";

export default class Invocation {

  constructor(tokens) {
    this.tokens = tokens;
    this.curries = [];
    this.cache = null;
    this.cacheEnabled = false;
    this.numCacheParams = 0;
    this.numCacheOutputs = 0;
  }

  addToken(token) {
    this.tokens.push(token);
  }

  curry(value) {
    this.curries.unshift(value);
  }

  enableCache(numParams, numOutputs) {
    this.numCacheParams = numParams;
    this.numCacheOutputs = numOutputs;
    this.cacheEnabled = true;
    this.cache = {};
  }

  async invoke() {
    if (!this.cacheEnabled) {
      await this.cachelessInvoke();
      return;
    }
    let cacheHit = this.checkCacheHit();
    if (cacheHit) {
      return;
    }
    let paramStr = this.createCacheParamStr();
    await this.cachelessInvoke();
    let output = [];
    for (let i=0;i<this.numCacheOutputs;i++) {
      output[i] = runtime.peekIndex(this.numCacheOutputs-1-i);
    }
    this.cache[paramStr] = output;
  }

  createCacheParamStr() {
    let paramStr = '';
    for (let i=0;i<this.numCacheParams;i++) {
      paramStr += runtime.peekIndex(i).toString();
    }
    return paramStr;
  }

  checkCacheHit() {
    let paramStr = this.createCacheParamStr();
    if (this.cache[paramStr]) {
      for (let i=0;i<this.numCacheParams;i++) {
        runtime.pop();
      }
      let cacheResult = this.cache[paramStr];
      for (let i=0;i<this.numCacheOutputs;i++) {
        runtime.push(cacheResult[i]);
      }
      return true;
    }
  }

  async cachelessInvoke() {
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