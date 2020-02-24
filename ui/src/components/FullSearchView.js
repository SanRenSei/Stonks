var m = require('mithril');
var prop = require('mithril/stream');

import api from '../interface/interface';

import FilterList from './FilterList';

export default (vnode) => {
  
  var data = prop([]);
  var filters = prop([]);
  
  var searchPayload = {
    indicator: {
      type : "price"
    },
    filter : {
      indicator: {
        type : "price"
      },
      high:10
    }
  };
  
  return {
    
    view: () => {
      return (
      <div>
        <FilterList />
        <br />
        <button type="button" class="btn btn-primary"
          onclick={() => {
            api.searchAll(searchPayload, data);
          }}
        >Get Data!</button>
        {data().map(dr => {
          return <tr>
            <td>{dr[0]}</td>
            <td>{dr[1]}</td>
          </tr>
        })}
      </div>
    );
    }
  };
}