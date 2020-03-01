var m = require('mithril');

import IndicatorSelect from './IndicatorSelect';

export default (vnode) => {
  
  return {
    
    view: (vnode) => {
      var {filterObj, onchange} = vnode.attrs;
      return (
      <div>
      
        <IndicatorSelect 
          onchange={ind => onchange({...filterObj, indicator:ind})}
        />
        
        <input
          value={filterObj.low}
          placeholder="Low"
          oninput={evt => onchange({...filterObj, low:parseFloat(evt.target.value)})}
        />
        
        <input 
          value={filterObj.high}
          placeholder="High"
          oninput={evt => onchange({...filterObj, high:parseFloat(evt.target.value)})}
        />
        
      </div>
    );
    }
  };
}