var m = require('mithril');
var prop = require('mithril/stream');

import TypeAheadDropdown from './TypeAheadDropdown';

export default (vnode) => {
  
  return {
    
    view: (vnode) => {
      var {indicator, remove} = vnode.attrs;
      remove = remove || (() => {});
      if (!(indicator().type)) {
        indicator().type = prop('');
      }
      
      return (
      <div>
      
        <TypeAheadDropdown 
          items={['OPEN', 'LOW', 'HIGH', 'CLOSE', 'PRICE']}
          placeholder="Indicator"
          value={indicator().type}
          actions={["X"]}
          onAction={remove}
        />
        
      </div>
    );
    }
  };
}