var m = require('mithril');
var prop = require('mithril/stream');

import api from './interface/interface';

import FullSearchView from './components/FullSearchView';
import SymbolSearchView from './components/SymbolSearchView';

var App = (vnode) => {
  
  var viewMode = prop(0);
  const SYMBOL_SEARCH_VIEW = 0;
  const FULL_SEARCH_VIEW = 1;
  
  return {
  
    oninit: () => {},
    
    view: () => {
      return (
      <div>
        <button type="button" class="btn btn-primary btn-lg btn-block"
          onclick={() => {viewMode(SYMBOL_SEARCH_VIEW);}}
        > Symbol Search View </button>
        <button type="button" class="btn btn-primary btn-lg btn-block"
          onclick={() => {viewMode(FULL_SEARCH_VIEW);}}
        > Full Search View </button>
        {viewMode() == SYMBOL_SEARCH_VIEW && <SymbolSearchView />}
        {viewMode() == FULL_SEARCH_VIEW && <FullSearchView />}
      </div>
      );
    }
  }
};

m.mount(document.body, App)