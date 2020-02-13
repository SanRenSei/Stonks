var m = require('mithril');

export default {
  view: (vnode) => {
    var {items, clickOption} = vnode.attrs;
    clickOption = clickOption || (()=>{});
    
    return (
      <div class="card scrollable-list" style="width: 18rem;">
        <ul class="list-group list-group-flush">
        {items.map((i,x) => {
            return <li class="list-group-item" 
              onmousedown={()=>{
                clickOption(x);
              }}>
              {i}
            </li>
        })}
        </ul>
      </div>);
  }
};