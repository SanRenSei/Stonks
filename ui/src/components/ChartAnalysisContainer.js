var m = require('mithril');
var prop = require('mithril/stream');
var moment = require('moment');

import BarChartIcon from '../icons/BarChart';
import CandlestickChart from './CandlestickChart';
import DataTable from './DataTable';
import TableIcon from '../icons/Table';

import TabContainer from './TabContainer';

export default (vnode) => {
  
  var activeTab = prop(0);
  var fromDate = prop('');
  var toDate = prop('');
  
  var filteredData = prop([]);
  
  return {
    view: (vnode) => {
      var {data} = vnode.attrs;
      
      if (data().length==0) {
        return <div>Search for data first</div>
      }
      
      if (toDate()=='') {
        toDate(data()[0].date);
      }
      
      if (fromDate()=='') {
        fromDate(moment().subtract(2, 'months').format('YYYYMMDD'));
      }
      
      if (fromDate().length==8 && toDate().length==8) {
        filteredData(data().filter(d => {
          return d.date>=fromDate() && d.date<=toDate();
        }));
      }
      
      var headerTabs = <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link active"
            onclick={() => activeTab(0)}>
            <TableIcon />
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link active"
            onclick={() => activeTab(1)}>
            <BarChartIcon />
          </a>
        </li>
      </ul>;
      
      return <div class="col-sm-6">
        <input 
          value={fromDate()}
          oninput = {(evt) => {
            fromDate(evt.target.value);
          }}>
        </input>
        <input 
          value={toDate()}
          oninput = {(evt) => {
            toDate(evt.target.value);
          }}>
        </input>
        <br />
        <br />
        <TabContainer 
          tabs = {[
            {content: <DataTable data={filteredData()} />},
            {content: <CandlestickChart data={filteredData()} />}
          ]}
        />
      </div>;
    }
  };
}