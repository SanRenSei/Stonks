
const ohm = require('ohm-js');

module.exports = ohm.grammar(`
  
  Hilbert {
    Exp = IncrementalExpr
    
    IncrementalExpr = CompExp "→" CompExp -- increment
      | CompExp "⏪" CompExp -- rewind
      | CompExp
    
    CompExp = AddExp "<" AddExp -- lt
      | AddExp ">" AddExp -- gt
      | AddExp "=" AddExp -- eq
      | AddExp "&" AddExp -- min
      | AddExp "|" AddExp -- max
      | AddExp
      
    AddExp = AddExp "+" MultExp -- plus
      | AddExp "-" MultExp -- minus
      | MultExp
      
    MultExp = MultExp "*" QuickBinOp -- times
      | MultExp "/" QuickBinOp -- div
      | QuickBinOp
      
    QuickBinOp = ParenExp "Ø" ParenExp -- nullCheck
      | ParenExp "Δ" ParenExp -- offset
      | ParenExp
      
    ParenExp = PriExp
      | "(" Exp ")" -- paren
      
    PriExp = Func
      | SoloInd
      | ArrExp
      | Decimal
      
    ArrExp = ParenExp ":" ParenExp
      
    Func = Summation
      | Maximum
      | Minimum
      | Absolute
      | Ind "[" Params "]" -- func
      
    Params = (Exp ",")* Exp
      
    SoloInd = upper+
    
    Summation = "Σ" ParenExp
    Maximum = "Ω" ParenExp
    Minimum = "ω" ParenExp
    Absolute = "δ" ParenExp
    
    Ind = upper+
    
    Decimal = "-" digit+ "." digit+ -- neg_dec
      | digit+ "." digit+ -- dec
      | "-" number -- neg
      | number
    number = digit+
      
  }
  
`);