var m = require('mithril');
var prop = require('mithril/stream');

import api from '../interface/interface';

import FilterList from './FilterList';
import IndicatorList from './IndicatorList';
import TypeAheadDropdown from './TypeAheadDropdown';

export default (vnode) => {
  
  var data = prop([]);
  var searchSymbol = prop("");
  var filters = prop([]);
  var queries = prop([]);
  
  return {
    
    view: () => {
      return (
      <div>
        <TypeAheadDropdown 
          items = {[]}
          value={searchSymbol}
        />
        <FilterList 
          filterList={filters}
        />
        <br />
        <IndicatorList 
          indicatorList={queries}
        />
        <br />
        <button type="button" class="btn btn-primary"
          onclick={() => {
            var searchPayload = {
              indicators: queries(),
              filters:filters()
            };
            api.searchHistory(searchSymbol(), searchPayload, d => {
              data(d);
            });
          }}
        >Search!</button>
        <br />
        <br />
        <br />
        {data().map(dr => {
          return <tr>
            {dr.map(dc => <td>{dc}</td>)}
          </tr>
        })}
      </div>
    );
    }
  };
}