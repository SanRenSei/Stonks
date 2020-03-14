var m = require('mithril');
var prop = require('mithril/stream');

import api from './interface/interface';

import FullSearchView from './components/FullSearchView';
import FunctionAdminView from './components/FunctionAdminView';
import HistorySearchView from './components/HistorySearchView';
import SymbolSearchView from './components/SymbolSearchView';

var App = (vnode) => {
  
  var viewMode = prop(0);
  const SYMBOL_SEARCH_VIEW = 0;
  const FULL_SEARCH_VIEW = 1;
  const HISTORY_SEARCH_VIEW = 2;
  const FUNCTION_ADMIN_VIEW = 3;
  
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
        > Market Search View </button>
        <button type="button" class="btn btn-primary btn-lg btn-block"
          onclick={() => {viewMode(HISTORY_SEARCH_VIEW);}}
        > History Search View </button>
        <button type="button" class="btn btn-primary btn-lg btn-block"
          onclick={() => {viewMode(FUNCTION_ADMIN_VIEW);}}
        > Function Admin View </button>
        {viewMode() == SYMBOL_SEARCH_VIEW && <SymbolSearchView />}
        {viewMode() == FULL_SEARCH_VIEW && <FullSearchView />}
        {viewMode() == HISTORY_SEARCH_VIEW && <HistorySearchView />}
        {viewMode() == FUNCTION_ADMIN_VIEW && <FunctionAdminView />}
      </div>
      );
    }
  }
};

m.mount(document.body, App)