let ohmInterpreter = require('./zeitgeistParser.js');
let astEvaluator = require('./astEvaluator.js');
let fs = require('fs');

exports.handler = async (event) => {
    console.log('Begin function');
    let input = event.input;
    let parsed = ohmInterpreter(input);
    console.log('Done parsing');
    let output = parsed;
    await astEvaluator(parsed);
    return output;
};

exports.handler({input:fs.readFileSync('test.zeitgeist', 'utf-8')});