
import runtime from "./Runtime.js";
import DataSourceProvider from "./datasources/DataSourceProvider.js";
import Invocation from "./struct/Invocation.js";
import Time from "./struct/Time.js";

const commands = [
  {regex: /^\d+$/, action: token => runtime.push(parseInt(token))},
  {regex: /^\"[^\"]*\"$/, action: token => runtime.push(token.substring(1, token.length-1))},
  {regex: /^\[\d+\]$/, action: token => {
    let arrLen = parseInt(token.substring(1, token.length-1));
    let toPush = [];
    for (let i=0;i<arrLen;i++) {
      toPush.unshift(runtime.pop());
    }
    runtime.push(toPush);
  }},
  {regex: /^#\d+$/, action: token => {
    let index = parseInt(token.substring(1));
    runtime.push(runtime.peekIndex(index));
  }},
  {regex: /⏳.*/, action: token => {
    runtime.push(new Time(token.substring(1)));
  }},
  {regex: /📚.*/, action: async token => {
    let dataSource = await DataSourceProvider.createDataObject(token.substring(2));
    runtime.push(dataSource);
  }}, 
  {token: '(', action: _ => {
    runtime.setCommandOverride([
      {token: ')', action: _ => runtime.removeCommandOverride()},
      {regex: /.*/, action: _ => {}}
    ]);
  }},
  {token: '{', action: _ => {
    let nesting = 1;
    let tokens = [];
    runtime.setCommandOverride([
      {token: '{', action: _ => {
        nesting++;
        tokens.push('{');
      }},
      {token: '}', action: _ => {
        nesting--;
        if (nesting==0) {
          runtime.push(new Invocation(tokens));
          runtime.removeCommandOverride();
        } else {
          tokens.push('}');
        }
      }},
    {regex: /.*/, action: token => tokens.push(token)}
    ]);
  }},
  {token: 'ALIAS', action: _ => {
    let tokens = [];
    runtime.setCommandOverride([
      {token: ';', action: _ => {
        runtime.removeCommandOverride();
        let values = [];
        for (let i=tokens.length-1;i>=0;i--) {
          values[i] = runtime.pop();
          commands.unshift({
            token: tokens[i],
            action: _ => {runtime.push(values[i]);}
          });
        }
        for (let i=0;i<values.length;i++) {
          runtime.push(values[i]);
        }
        runtime.addStackAliases(tokens);
      }},
      {regex: /.*/, action: token => tokens.push(token)}
    ]);
  }},
  {token: 'FUNC', action: _ => {
    let tokens = [];
    let depth = 0;
    runtime.setCommandOverride([
      {token: ';', action: token => {
        if (depth == 0) {
          runtime.removeCommandOverride();
          let funcName = tokens.splice(0, 1)[0];
          let func = new Invocation(tokens);
          commands.unshift({
            token: funcName,
            action: async _ => await func.invoke()
          });
        } else {
          tokens.push(token);
          depth--;
        }
      }},
      {token: 'ALIAS', action: token => {
        depth++;
        tokens.push(token);
      }},
      {regex: /.*/, action: token => tokens.push(token)}
    ]);
  }},
  {token: '<obj>', action: _ => {
    runtime.push({});
  }},
  {regex: /<[a-zA-Z]+/, action: setter => {
    let varname = setter.substring(1);
    let val = runtime.pop(), obj = runtime.pop();
    obj[varname] = val;
    runtime.push(obj);
  } },
  {regex: />[a-zA-Z]+/, action: getter => {
    let varname = getter.substring(1);
    let obj = runtime.pop();
    runtime.push(obj);
    runtime.push(obj[varname]);
  } },
  {token: '+', action: _ => {
    let right = runtime.pop();
    let left = runtime.pop(); 
    runtime.push(left+right);
  }},
  {token: '-', action: _ => {
    let right = runtime.pop(), left = runtime.pop();
    runtime.push(left-right);
  }},
  {token: '*', action: _ => {
    let right = runtime.pop();
    let left = runtime.pop(); 
    runtime.push(left*right);
  }},
  {regex: /\*\d+$/, action: async token => {
    let loopCount = parseInt(token.substring(1));
    let func = runtime.pop();
    for (let i=0;i<loopCount;i++) {
      await func.invoke();
    }
  }},
  {token: '/', action: _ => {
    let right = runtime.pop();
    let left = runtime.pop();
    if (typeof left == 'number' && typeof right == 'number') {
      runtime.push(left/right);
      return;
    }
    if (typeof left == 'string' && typeof right == 'string') {
      runtime.push(left.split(right));
      return;
    }
    throw 'Cannot divide';
  }},
  {token: '%', action: _ => {
    let right = runtime.pop();
    let left = runtime.pop();
    runtime.push(left%right);
  }},
  {token: '=', action: _ => {
    let right = runtime.pop(), left = runtime.pop();
    runtime.push(left==right);
  }},
  {token: '>', action: _ => {
    let right = runtime.pop(), left = runtime.pop();
    runtime.push(left>right);
  }},
  {token: '[a,b]', action: _ => {
    let right = runtime.pop(), left = runtime.pop();
    let arr = [];
    for (let i=left;i<=right;i++) {
      arr.push(i);
    }
    runtime.push(arr);
  }},
  {token: '/mod', action: _ => {
    let divisor = runtime.pop(), product = runtime.pop();
    let quotient = Math.floor(product/divisor);
    let remainder = product%divisor;
    runtime.push(quotient);
    runtime.push(remainder);
  }},
  {token: 'call', action: _ => {
    let func = runtime.pop();
    func.invoke();
  }},
  {token: 'ceil', action: _ => {
    runtime.push(Math.ceil(runtime.pop()));
  }},
  {token: 'curry', action: _ => {
    let func = runtime.pop(), curryVal = runtime.pop();
    func.curry(curryVal);
    runtime.push(func);
  }},
  {regex: /drop\d+$/, action: async token => {
    let dropCount = parseInt(token.substring(4));
    for (let i=0;i<dropCount;i++) {
      runtime.pop();
    }
  }},
  {token: 'dup', action: _ => {
    let val = runtime.pop();
    runtime.push(val);
    runtime.push(val);
  }},
  {token: 'floor', action: _ => {
    runtime.push(Math.floor(runtime.pop()));
  }},
  {token: 'if', action: _ => {
    let fPath = runtime.pop(), tPath = runtime.pop(), pred = runtime.pop();
    if (pred) {
      tPath.invoke();
    } else {
      fPath.invoke();
    }
  }},
  {token: 'map', action: _ => {
    let invocation = runtime.pop(), arr = runtime.pop();
    let toReturn = [];
    for (let i=0;i<arr.length;i++) {
      runtime.push(arr[i]);
      invocation.invoke();
      toReturn[i] = runtime.pop();
    }
    runtime.push(toReturn);
  }},
  {token: 'pop', action: _ => runtime.pop()},
  {token: 'print', action: _ => console.log(runtime.pop())},
  {regex: /rot\d+$/, action: async token => {
    let rotCount = parseInt(token.substring(3));
    let item = runtime.pop();
    let cache = [];
    for (let i=0;i<rotCount;i++) {
      cache.push(runtime.pop());
    }
    runtime.push(item);
    for (let i=cache.length-1;i>=0;i--) {
      runtime.push(cache[i]);
    }
  }},
  {token: 'suffix', action: _ => {
    let elem = runtime.pop(), arr = runtime.pop();
    arr.push(elem);
    runtime.push(arr);
  }},
  {token: 'sum', action: _ => {
    let arr = runtime.pop();
    let val = 0;
    arr.forEach(v => val+=v);
    runtime.push(val);
  }},
  {token: 'swap', action: _ => {
    let elem1 = runtime.pop(), elem2 = runtime.pop();
    runtime.push(elem1);
    runtime.push(elem2);
  }},
  {token: 'th', action: async _ => {
    let index = runtime.pop(), array = runtime.pop();
    let val = await array.get(index);
    runtime.push(val);
  }},
  {token: 'while', action: _ => {
    let func = runtime.pop(), pred = runtime.pop();
    pred.invoke();
    let predVal = runtime.pop();
    while (predVal) {
      func.invoke();
      pred.invoke();
      predVal = runtime.pop();
    }
  }}
]

let getMatchingCommand = (token, commandOverride) => {
  let commandList = commandOverride || commands;
  for (let i=0;i<commandList.length;i++) {
    if (commandList[i].regex && commandList[i].regex.test(token)) {
      return commandList[i];
    }
    if (commandList[i].token && commandList[i].token==token) {
      return commandList[i];
    }
  }
  throw 'Could not match command to token: ' + token;
}

let getCommandIndex = (commandToken) => {
  for (let i=0;i<commands.length;i++) {
    if (commands[i].token==commandToken) {
      return i;
    }
  }
}

let removeCommand = (commandToken) => {
  commands.splice(getCommandIndex(commandToken), 1);
}

export default getMatchingCommand;
export { removeCommand };