var m = require('mithril');
var prop = require('mithril/stream');

import api from '../interface/interface';

import FilterList from './FilterList';
import IndicatorList from './IndicatorList';

export default (vnode) => {
  
  var data = prop({
    results: []
  });
  var filters = prop([]);
  var queries = prop([]);
  
  return {
    
    view: () => {
      return (
      <div>
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
            api.searchAll(searchPayload);
          }}
        >Search!</button>
        <button type="button" class="btn btn-primary"
          onclick={() => {
            api.searchResults(d => {
              data(d);
              filters(d.currentSearch.filters);
              queries(d.currentSearch.indicators);
            });
          }}
        >Update Search Results</button>
        <br />
        <br />
        {data().progress && <div class="progress">
          <div class="progress-bar" role="progressbar"
            style={`width: ${data().progress*100}%`}
          >{`${Math.floor(data().progress*100)}%`}</div>
        </div>}
        <br />
        <table class="results-table">
          {data().results.map(dr => {
            return <tr>
              {dr.map(dc => <td>{dc}</td>)}
            </tr>
          })}
        </table>
      </div>
    );
    }
  };
}