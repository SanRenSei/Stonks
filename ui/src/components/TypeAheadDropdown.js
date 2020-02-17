var m = require('mithril');
var prop = require('mithril/stream');

import ScrollableList from './ScrollableList';

export default (vnode) => {
  
  var focused = prop(false);
  var text = prop('');
  
  const filteredItems = (items, filter) => {
    return items.filter(item => {
      return item.toLowerCase().indexOf(filter.toLowerCase())>=0;
    });
  };
  
  return {
    view: (vnode) => {
      var {items, actions, onAction} = vnode.attrs;
      actions = actions || [];
      
      var actionButtons = (
         <div class="input-group-append">
         {actions.map(action => {
             return <button class="btn btn-outline-secondary" type="button"
             onclick = {evt => onAction(action, text())}>
               {action}
             </button>
         })}
         </div>
      );
      
      return (
        <div class="col-sm-5" style={{margin:'1em'}}>
          <div class="input-group">
            <input type="text" class="form-control" 
              placeholder="Security Symbol" 
              oninput = {(evt) => {
                text(evt.target.value.toUpperCase());
              }}
              onfocus = {() => {
                focused(true);
              }}
              onfocusout = {() => {
                focused(false);
              }}
              value = {text()}
            />
            {actionButtons}
          </div>
          {(focused() && <ScrollableList items={filteredItems(items,text())} clickOption={text} />)}
        </div>);
    }
  };
}