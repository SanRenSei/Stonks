var m = require('mithril');
var prop = require('mithril/stream');

import TypeAheadDropdown from './TypeAheadDropdown';

export default (vnode) => {
  
  return {
    
    view: (vnode) => {
      var {indicator} = vnode.attrs;
      if (!(indicator().type)) {
        indicator().type = prop('');
      }
      
      return (
      <div>
      
        <TypeAheadDropdown 
          items={['OPEN', 'LOW', 'HIGH', 'CLOSE', 'PRICE']}
          placeholder="Indicator"
          value={indicator().type}
        />
        
      </div>
    );
    }
  };
}