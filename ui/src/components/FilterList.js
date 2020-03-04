var m = require('mithril');
var prop = require('mithril/stream');

import IndicatorFilter from './IndicatorFilter';

export default (vnode) => {
  
  var filters = prop([]);
  
  return {
    
    view: (vnode) => {
      var {filterList} = vnode.attrs;
      return (
      <div>
      
        <br />
        <button type="button" class="btn btn-primary"
          onclick={() => {
            filterList().push(prop({}));
          }}
        >Add New Filter</button>
        
        <br />
        
        {filterList().map(f => {
          return <IndicatorFilter 
            filter={f}
          />
        })}
        
      </div>
    );
    }
  };
}