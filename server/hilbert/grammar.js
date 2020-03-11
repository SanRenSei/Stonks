
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
      | Decimal
      
    ArrExp = number ":" number
      
    Func = Summation 
      | Ind "[" Params "]" -- func
      
    Params = (Exp ",")* Exp
      
    SoloInd = upper+
    
    Summation = "Σ" PriExp
    
    Ind = upper+
    
    Decimal = "-" digit+ "." digit+ -- neg_dec
      | digit+ "." digit+ -- dec
      | "-" number -- neg
      | number
    number = digit+
      
  }
  
`);