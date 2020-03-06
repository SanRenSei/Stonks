
const ohm = require('ohm-js');

module.exports = ohm.grammar(`
  
  Hilbert {
    Exp = CompExp
      | Func
      | SoloInd
      | number
      
    CompExp = Exp "<" Exp -- lt
      | Exp ">" Exp -- gt
      
    Func = Ind "[" number "]"
      
    SoloInd = upper+
    
    Ind = upper+
    
    number = digit+
      
  }
  
`);