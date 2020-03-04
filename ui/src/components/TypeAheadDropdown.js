var m = require('mithril');
var prop = require('mithril/stream');

import ScrollableList from './ScrollableList';

export default (vnode) => {
  
  var focused = prop(false);
  
  const filteredItems = (items, filter) => {
    return items.filter(item => {
      return item.toLowerCase().indexOf(filter.toLowerCase())>=0;
    });
  };
  
  return {
    view: (vnode) => {
      var {items, actions, onAction, placeholder, value} = vnode.attrs;
      placeholder = placeholder || 'Security Symbol';
      actions = actions || [];
      
      var actionButtons = (
         <div class="input-group-append">
         {actions.map(action => {
             return <button class="btn btn-outline-secondary" type="button"
             onclick = {evt => onAction(action, value())}>
               {action}
             </button>
         })}
         </div>
      );
      
      return (
        <div class="col-sm-5" style={{margin:'1em'}}>
          <div class="input-group">
            <input type="text" class="form-control"
              placeholder={placeholder}
              oninput = {(evt) => {
                value(evt.target.value.toUpperCase());
              }}
              onfocus = {() => {
                focused(true);
              }}
              onfocusout = {() => {
                focused(false);
              }}
              value = {value()}
            />
            {actionButtons}
          </div>
          {(focused() && <ScrollableList 
            items={filteredItems(items,value())} 
            clickOption={(item) => {
              value(item);
            }} 
          />)}
        </div>);
    }
  };
}