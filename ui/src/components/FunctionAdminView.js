var m = require('mithril');
var prop = require('mithril/stream');

import iFunctionAdmin from '../interface/iFunctionAdmin';

import FunctionCard from './FunctionCard';

export default (vnode) => {
  
  var functions = prop([]);
  
  return {
    
    oninit: () => {
      iFunctionAdmin.getAllFunctions(functions)
    },
    
    view: () => {
      console.log(functions());
      return (
      <div>
      <br /><br />
      {functions().map(f => {
        return <FunctionCard 
          cardData={f}
          saveAction={funcData => iFunctionAdmin.saveFunction(funcData, functions)}
        />
      })}
      <br />
      <button class="btn btn-primary" 
        onclick={evt => {
          functions().push({
            header:'',
            longName:'',
            declaration:'',
            description:''
          });
        }}>
        Add Function
      </button>
      </div>
    );
    }
  };
}