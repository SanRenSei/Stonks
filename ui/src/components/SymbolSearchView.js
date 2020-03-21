var m = require('mithril');
var prop = require('mithril/stream');

import api from '../interface/interface';

import ChartAnalysisContainer from './ChartAnalysisContainer';
import TypeAheadDropdown from './TypeAheadDropdown';

export default (vnode) => {
  
  var symbolList = prop(['FB', 'AAPL', 'AMZN', 'NFLX', 'GOOGL', 'TSLA']);
  var data = prop([]);
  var searchSymbol = prop('');
  
  return {
  
    oninit: () => {
      api.getAllSymbols(symbolList)
    },
    
    view: () => {
      return (
      <div>
        <TypeAheadDropdown 
          items = {symbolList()}
          actions={['View','Update']}
          onAction={(action, option) => {
            if (action == 'View') {
              api.getSymbol(option, data);
            }
            if (action == 'Update') {
              api.mineSymbol(option, data);
            }
          }}
          value={searchSymbol}
        />
        <br />
        
        <ChartAnalysisContainer data={data} />
        
      </div>
    );
    }
  };
}