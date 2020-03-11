var m = require('mithril');
var prop = require('mithril/stream');

import IndicatorSelect from './IndicatorSelect';

export default (vnode) => {
  
  return {
    
    view: (vnode) => {
      var {filter, remove} = vnode.attrs;
      remove = remove || (() => {});
      if (!(filter().indicator)) {
        filter().indicator = prop({});
      }
      
      return (
      <div>
      
        <IndicatorSelect 
          indicator={filter().indicator}
          remove={remove}
        />
        
        <input
          value={filter().low}
          placeholder="Low"
          oninput={evt => filter().low = parseFloat(evt.target.value) || null}
        />
        
        <input 
          value={filter().high}
          placeholder="High"
          oninput={evt => filter().high = parseFloat(evt.target.value) || null}
        />
        
      </div>
    );
    }
  };
}