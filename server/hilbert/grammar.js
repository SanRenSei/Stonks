
const ohm = require('ohm-js');

module.exports = ohm.grammar(`
  
  Hilbert {
    Exp = CompExp
      
    CompExp = AddExp "<" AddExp -- lt
      | AddExp ">" AddExp -- gt
      | AddExp
      
    AddExp = AddExp "+" MultExp -- plus
      | AddExp "-" MultExp -- minus
      | MultExp
      
    MultExp = MultExp "*" PriExp -- times
      | MultExp "/" PriExp -- div
      | PriExp
      
    PriExp = Func
      | SoloInd
      | ArrExp
      | number
      
    ArrExp = number ":" number
      
    Func = Summation 
      | Ind "[" PriExp "]" -- func
      
    SoloInd = upper+
    
    Summation = "Σ" PriExp
    
    Ind = upper+
    
    number = digit+
      
  }
  
`);