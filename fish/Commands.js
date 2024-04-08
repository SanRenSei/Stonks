
import runtime from "./Runtime.js";
import DataSourceProvider from "./datasources/DataSourceProvider.js";
import Invocation from "./struct/Invocation.js";
import Placeholder from "./struct/Placeholder.js";
import Time from "./struct/Time.js";

import stratRun from "./commands/stratRun.js";

const commands = [
  {regex: /^\d+$/, action: token => runtime.push(parseInt(token))},
  {regex: /^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?$/, action: token => runtime.push(parseFloat(token))},
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
  {token: '🧹', action: _ => { // clean
    runtime.clear();
  }},
  {regex: /📚.*/, action: async token => { // datasource
    let sourceName = token.substring(2);
    if (sourceName=='') {
      sourceName = runtime.pop();
    }
    let dataSource = await DataSourceProvider.createDataObject(sourceName);
    runtime.push(dataSource);
  }},
  {token: '🐞', action: _ => { // debug
    console.log('===== STACK DEBUG START =====')
    console.dir(runtime.stack, {depth:2})
    console.log('===== STACK DEBUG END =====')
  }},
  {regex: /🐞.*/, action: async token => { // debug
    let debugDepth = parseInt(token.substring(2));
    console.log(`===== STACK DEBUG START (Top ${debugDepth} of ${runtime.stack.length}) =====`)
    for (let i=0;i<debugDepth;i++) {
      console.log(runtime.peekIndex(i));
    }
    console.log('===== STACK DEBUG END =====')
  }},
  {token: '🌌', action: async _ => { // everything
    let timeseries = runtime.pop();
    await timeseries.fetchAllData();
    runtime.push(timeseries);
  }},
  {token: '📏', action: async _ => { // length
    let arrOrStr = runtime.pop();
    runtime.push(arrOrStr.length);
  }},
  {regex: /⏳.*/, action: token => { // timestamp
    runtime.push(new Time(token.substring(1)));
  }},
  {regex: /💾\d+_\d+/, action: token => { // save
    let tokenNums = token.substring(2).split('_');
    let numParams = tokenNums[0], numOutputs = tokenNums[1];
    let invocation = runtime.pop();
    invocation.enableCache(numParams, numOutputs);
    runtime.push(invocation);
  }},
  {token: '(', action: _ => {
    runtime.setCommandOverride([
      {token: ')', action: _ => runtime.removeCommandOverride()},
      {regex: /.*/, action: _ => {}}
    ]);
  }},
  {token: '[', action: _ => {
    let placeholder = new Placeholder();
    runtime.push(placeholder);
  }},
  {token: ']', action: _ => {
    let arr = [];
    let val = runtime.pop();
    while (!(val instanceof Placeholder)) {
      arr.unshift(val);
      val = runtime.pop();
    }
    runtime.push(arr);
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
    if (Array.isArray(left) && right.constructor.name=='Number') {
      runtime.push(left.map(e => e+right));
      return;
    }
    if (Array.isArray(right) && left.constructor.name=='Number') {
      runtime.push(right.map(e => e+left));
      return;
    }
    runtime.push(left+right);
  }},
  {token: '-', action: _ => {
    let right = runtime.pop(), left = runtime.pop();
    if (left instanceof Time && Array.isArray(right)) {
      runtime.push(right.map(d => left.withAdd(-d)));
      return;
    }
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
  {token: '<', action: _ => {
    let right = runtime.pop(), left = runtime.pop();
    runtime.push(left<right);
  }},
  {token: '<=', action: _ => {
    let right = runtime.pop(), left = runtime.pop();
    runtime.push(left<=right);
  }},
  {token: '>', action: _ => {
    let right = runtime.pop(), left = runtime.pop();
    runtime.push(left>right);
  }},
  {token: '>=', action: _ => {
    let right = runtime.pop(), left = runtime.pop();
    runtime.push(left>=right);
  }},
  {token: '&', action: _ => {
    let right = runtime.pop(), left = runtime.pop();
    runtime.push(left && right);
  }},
  {token: '[0,b)', code: '0 swap [a,b)'},
  {token: '[a,b)', action: _ => {
    let right = runtime.pop(), left = runtime.pop();
    let arr = [];
    for (let i=left;i<right;i++) {
      arr.push(i);
    }
    runtime.push(arr);
  }},
  {token: '[a,b]', action: _ => {
    let right = runtime.pop(), left = runtime.pop();
    let arr = [];
    for (let i=left;i<=right;i++) {
      arr.push(i);
    }
    runtime.push(arr);
  }},
  {token: '][', action: _ => {
    runtime.pop().forEach(i => runtime.push(i));
  }},
  {token: '/mod', action: _ => {
    let divisor = runtime.pop(), product = runtime.pop();
    let quotient = Math.floor(product/divisor);
    let remainder = product%divisor;
    runtime.push(quotient);
    runtime.push(remainder);
  }},
  {token: 'abs', action: _ => {
    runtime.push(Math.abs(runtime.pop()));
  }},
  {token: 'call', action: async _ => {
    let func = runtime.pop();
    await func.invoke();
  }},
  {regex: /callMap\d+$/, action: async token => {
    let funcList = runtime.pop();
    let callMapCount = parseInt(token.substring(7));
    let params = [];
    for (let i=callMapCount-1;i>=0;i--) {
      params[i] = runtime.pop();
    }
    let results = [];
    for (let i=0;i<funcList.length;i++) {
      for (let j=0;j<callMapCount;j++) {
        runtime.push(params[j]);
      }
      await funcList[i].invoke();
      results[i] = runtime.pop();
    }
    runtime.push(results);
  }},
  {token: 'ceil', action: _ => {
    runtime.push(Math.ceil(runtime.pop()));
  }},
  {token: 'cond', action: async _ => {
    let conditions = runtime.pop();
    for (let i=0;i<conditions.length;i++) {
      if (conditions[i] instanceof Invocation) {
        await conditions[i].invoke();
        return;
      }
      let predicate = conditions[i][0], func = conditions[i][1];
      await predicate.invoke();
      let result = runtime.pop();
      if (result) {
        await func.invoke();
        return;
      }
    }
  }},
  {token: 'curry', action: _ => {
    let func = runtime.pop(), curryVal = runtime.pop();
    func.curry(curryVal);
    runtime.push(func);
  }},
  {regex: /curry\d+$/, action: async token => {
    let func = runtime.pop();
    let curryCount = parseInt(token.substring(5));
    for (let i=0;i<curryCount;i++) {
      func.curry(runtime.pop());
    }
    runtime.push(func);
  }},
  {token: 'deepMap', action: async _ => {
    let deepMap = async (deepArr, invocation) => {
      if (Array.isArray(deepArr)) {
        let toReturn = [];
        for (let i=0;i<deepArr.length;i++) {
          toReturn.push(await deepMap(deepArr[i], invocation));
        }
        return toReturn;
      }
      return await invocation(deepArr);
    };
    let func = runtime.pop(), arr = runtime.pop();
    runtime.push(await deepMap(arr, async val => {
      runtime.push(val);
      await func.invoke();
      return runtime.pop();
    }));
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
  {token: 'false', action: _ => {
    runtime.push(false);
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
  {token: 'isArray', action: _ => {
    runtime.push(Array.isArray(runtime.pop()));
  }},
  {token: 'isTime', action: _ => {
    runtime.push(runtime.pop() instanceof Time);
  }},
  {token: 'map', action: async _ => {
    let invocation = runtime.pop(), arr = runtime.pop();
    let toReturn = [];
    for (let i=0;i<arr.length;i++) {
      runtime.push(arr[i]);
      await invocation.invoke();
      toReturn[i] = runtime.pop();
    }
    runtime.push(toReturn);
  }},
  {token: 'maximum', action: _ => {
    let arr = runtime.pop();
    let val = arr[0];
    arr.forEach(v => val=Math.max(val, v));
    runtime.push(val);
  }},
  {token: 'minimum', action: _ => {
    let arr = runtime.pop();
    let val = arr[0];
    arr.forEach(v => val=Math.min(val, v));
    runtime.push(val);
  }},
  {token: 'pop', action: _ => runtime.pop()},
  {token: 'print', action: _ => console.log(runtime.pop())},
  {regex: /^rot\d+$/, action: async token => {
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
  {token: 'strat-run', action: stratRun},
  {token: 'subpairs', code: '2 subseqs'},
  {token: 'subseqs', action: _ => {
    let windowSize = runtime.pop(), arr = runtime.pop();
    let toPush = [];
    for (let i=0;i<=arr.length-windowSize;i++) {
      let elem = [];
      for (let j=i;j<i+windowSize;j++) {
        elem.push(arr[j]);
      }
      toPush.push(elem);
    }
    runtime.push(toPush);
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
  {token: 'true', action: _ => {
    runtime.push(true);
  }},
  {regex: /uprot\d+$/, action: token => {
    let uprotCount = parseInt(token.substring(5));
    let item = runtime.pop();
    for (let i=0;i<uprotCount;i++) {
      runtime.pop();
    }
    runtime.push(item);
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