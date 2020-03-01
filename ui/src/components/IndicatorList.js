var m = require('mithril');
var prop = require('mithril/stream');

import IndicatorSelect from './IndicatorSelect';

export default (vnode) => {
  
  var filters = prop([]);
  
  return {
    
    view: (vnode) => {
      var {indicatorList} = vnode.attrs;
      return (
      <div>
      
        <br />
        <button type="button" class="btn btn-primary"
          onclick={() => {
            indicatorList().push({});
          }}
        >Add New Indicator</button>
        
        <br />
        
        {indicatorList().map((f,i) => {
          return <IndicatorSelect 
            indicatorObj={f}
            onchange={newObj => indicatorList()[i]=newObj}
          />
        })}
        
      </div>
    );
    }
  };
}