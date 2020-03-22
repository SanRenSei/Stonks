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
  
  var candlePeriodInputText = prop('1D');
  var candlePeriod = prop('1D');
  
  var filteredData = prop([]);
  
  var moveBack = () => {
    fromDate(moment(fromDate(), 'YYYYMMDD').subtract(1, 'month').format('YYYYMMDD'));
    toDate(moment(toDate(), 'YYYYMMDD').subtract(1, 'month').format('YYYYMMDD'));
  }
  
  var moveForward = () => {
    fromDate(moment(fromDate(), 'YYYYMMDD').add(1, 'month').format('YYYYMMDD'));
    toDate(moment(toDate(), 'YYYYMMDD').add(1, 'month').format('YYYYMMDD'));
  }
  
  var validCandlePeriod = (cpt) => {
    return parseInt(cpt)>0;
  }
  
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
      
      var candleInterval = parseInt(candlePeriod());
      if (candleInterval>1) {
        var reducedData = [];
        for (var i=filteredData().length-1;i>=0;i-=candleInterval) {
          var startDate = filteredData()[i].date, endDate = filteredData()[i].date;
          var {open, low, high, close, volume} = filteredData()[i];
          volume = parseInt(volume);
          for (var j=i-1;j>i-candleInterval && j>0;j--) {
            endDate = filteredData()[j].date;
            low = Math.min(low, filteredData()[j].low);
            high = Math.max(high, filteredData()[j].high);
            close = filteredData()[j].close;
            volume += parseInt(filteredData()[j].volume);
          }
          reducedData.unshift({
            date:`${startDate}-${endDate}`,
            open, low, high, close, volume
          });
        }
        filteredData(reducedData);
      }
      
      return <div>
        <div class="input-group">
          <div class="input-group-prepend">
            <button class="btn btn-outline-secondary" type="button"
              onclick={moveBack}
            >{"<"}</button>
          </div>
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
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button"
              onclick={moveForward}
            >{">"}</button>
          </div>
        </div>
        <br />
        
        <input
          class="form-control col-md-1"
          placeholder="Candle Period"
          value={candlePeriodInputText()}
          oninput = {(evt) => {
            candlePeriodInputText(evt.target.value);
            validCandlePeriod(candlePeriodInputText()) && candlePeriod(candlePeriodInputText());
          }}
        />
        
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