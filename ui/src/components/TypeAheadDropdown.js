var m = require('mithril');

import ScrollableList from './ScrollableList';

export default (vnode) => {
  
  var focused = false;
  var text = '';
  
  const filteredItems = (items, filter) => {
    return items.filter(item => {
      return item.toLowerCase().indexOf(filter.toLowerCase())>=0;
    });
  };
  
  return {
    view: (vnode) => {
      var {items} = vnode.attrs;
      return (
        <div class="col-sm-3" style={{margin:'1em'}}>
          <div class="input-group">
            <input type="text" class="form-control" 
              placeholder="Security Symbol" 
              oninput = {(evt) => {
                text = evt.target.value.toUpperCase();
              }}
              onfocus = {() => {
                focused = true;
              }}
              onfocusout = {() => {
                focused = false;
              }}
              value = {text}
            />
            <div class="input-group-append">
              <button class="btn btn-outline-secondary" type="button">View</button>
              <button class="btn btn-outline-secondary" type="button">Update</button>
            </div>
          </div>
          {(focused && <ScrollableList items={filteredItems(items,text)} clickOption={(x)=>{
            text = items[x];
          }} />)}
        </div>);
    }
  };
}