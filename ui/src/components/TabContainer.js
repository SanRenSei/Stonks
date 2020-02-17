var m = require('mithril');
var prop = require('mithril/stream');

import BarChartIcon from '../icons/BarChart';
import TableIcon from '../icons/Table';

export default (vnode) => {
  
  var activeTab = prop(0);
  
  return {
    view: (vnode) => {
      var {tabs} = vnode.attrs;
      
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
        {headerTabs}
        {tabs[activeTab()].content}
      </div>;
    }
  };
}