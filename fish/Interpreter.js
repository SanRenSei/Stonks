
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);

import getMatchingCommand from "./Commands.js";
import runtime from "./Runtime.js";
import Invocation from "./struct/Invocation.js";

let tokenize = (code) => {
  let tokens = code.split(/\s+/);
  for (let i=0;i<tokens.length;i++) {
    if (tokens[i][0]=='"' && (tokens[i].length==1 || tokens[i][tokens[i].length-1]!='"')) {
      tokens[i] = tokens[i] + ' ' + tokens[i+1];
      tokens.splice(i+1, 1);
      i--;
    }
    if (tokens[i]=='') {
      tokens.splice(i, 1);
      i--;
    }
  }
  return tokens;
}

const runCode = async code => {
  let tokens = tokenize(code);
  for (let i=0;i<tokens.length;i++) {
    await runtime.executeToken(tokens[i]);
  }
}

export default runCode;