var m = require('mithril');

import TypeAheadDropdown from './components/TypeAheadDropdown';

var stuff = ['FB', 'AAPL', 'AMZN', 'NFLX', 'GOOGL', 'TSLA'];

var App = {
  view: () => {
    return (<TypeAheadDropdown items = {stuff} />);
  }
}

m.mount(document.body, App)