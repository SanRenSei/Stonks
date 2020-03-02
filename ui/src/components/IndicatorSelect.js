var m = require('mithril');

import TypeAheadDropdown from './TypeAheadDropdown';

export default (vnode) => {
  
  return {
    
    view: (vnode) => {
      var {indicatorObj, onchange} = vnode.attrs;
      return (
      <div>
      
        <TypeAheadDropdown 
          items={['OPEN', 'LOW', 'HIGH', 'CLOSE', 'PRICE']}
          placeholder="Indicator"
          onchange={onchange}
        />
        
      </div>
    );
    }
  };
}