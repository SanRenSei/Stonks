var m = require('mithril');
var prop = require('mithril/stream');

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
            filterList().push({});
          }
          }
        >Add New Filter</button>
        
      </div>
    );
    }
  };
}