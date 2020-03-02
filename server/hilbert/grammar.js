
const ohm = require('ohm-js');

module.exports = ohm.grammar(`
  
  Hilbert {
    Exp = CompExp
      | Ind
      
    CompExp = Exp "<" Exp -- lt
      | Exp ">" Exp -- gt
      
    Ind = Date
      | Open
      | Low
      | High
      | Close
      | Volume
      
    Date = "DATE"
    Open = "OPEN"
    Low = "LOW"
    High = "HIGH"
    Close = "CLOSE"
    Volume = "VOLUME"
  }
  
`);