var m = require('mithril');
var prop = require('mithril/stream');

import api from '../interface/interface';

export default (vnode) => {
  
  var functions = prop([{
    name:'SMA[period = 1,offset = 0]',
    declaration:'SMA[period = 1, offset = 0] = ΣCLOSE[1:period+offset]/period',
    longName:'Simple Moving Average',
    description:'The mean price over the last X days'
  }]);
  
  return {
    
    view: () => {
      console.log('AAA');
      console.log(functions());
      return (
      <div>
      <br /><br />
      {functions().map(f => {
        return <div class="col-sm-9"> 
          <div class="card">
            <div class="card-header">{f.name}</div>
            <div class="card-body">
              <h5 class="card-title">{f.longName}</h5>
              <h6 class="card-title">{f.declaration}</h6>
              <p class="card-text">{f.description}</p>
              <button class="btn btn-primary">Edit</button>
            </div>
          </div>
        </div>
      })}
      </div>
    );
    }
  };
}