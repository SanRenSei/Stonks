var m = require('mithril');
var prop = require('mithril/stream');

import api from './interface/interface';

import CandlestickChart from './components/CandlestickChart';
import DataTable from './components/DataTable';
import TabContainer from './components/TabContainer';
import TypeAheadDropdown from './components/TypeAheadDropdown';

var stuff = prop(['FB', 'AAPL', 'AMZN', 'NFLX', 'GOOGL', 'TSLA']);
var data = prop([]);

var App = {
  
  oninit: () => {
    api.getAllSymbols(stuff)
  },
  
  view: () => {
    return (
    <div>
      <TypeAheadDropdown 
        items = {stuff()}
        actions={['View','Update']}
        onAction={(action, option) => {
          if (action == 'View') {
            api.getSymbol(option, data);
          }
          if (action == 'Update') {
            api.mineSymbol(option, data);
          }
        }}
      />
      <br />
      
      <TabContainer 
        tabs = {[
          {content: <DataTable data={data()} />},
          {content: <CandlestickChart data={data()} />}
        ]}
      />
      
    </div>
  );
  }
}

m.mount(document.body, App)