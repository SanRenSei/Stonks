var m = require('mithril');
var prop = require('mithril/stream');

import IndicatorSelect from './IndicatorSelect';

export default (vnode) => {
  
  return {
    
    view: (vnode) => {
      var {filter} = vnode.attrs;
      if (!(filter().indicator)) {
        filter().indicator = prop({});
      }
      
      return (
      <div>
      
        <IndicatorSelect 
          indicator={filter().indicator}
        />
        
        <input
          value={filter().low}
          placeholder="Low"
          oninput={evt => filter().low = parseFloat(evt.target.value)}
        />
        
        <input 
          value={filter().high}
          placeholder="High"
          oninput={evt => filter().high = parseFloat(evt.target.value)}
        />
        
      </div>
    );
    }
  };
}