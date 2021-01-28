var m = require('mithril');
var prop = require('mithril/stream');

import api from '../interface/interface';

export default (vnode) => {
  
  // Match formats like ABC_DEF[param = 0, param2 = 1]
  const indicatorNameRegex = /[A-Z_]+(\[([a-zA-Z0-9]+\s*=\s*[0-9.]+,?\s*)*])?/g;
  
  var cardDataEdit = {};
  
  var editMode = false;
  
  return {
    
    view: (vnode) => {
      var {cardData, saveAction} = vnode.attrs;
      if (!editMode) {
        return <div class="col-sm-9" mref="FunctionCard"> 
            <div class="card">
              <div class="card-header">{cardData.header}</div>
              <div class="card-body">
                <h5 class="card-title">{cardData.longName}</h5>
                <h6 class="card-title">{cardData.declaration}</h6>
                <p class="card-text">{cardData.description}</p>
                <button class="btn btn-primary" 
                  onclick={evt => {
                    editMode=true;
                    cardDataEdit = {...cardData};
                  }}>Edit</button>
              </div>
            </div>
          </div>
      } else {
        return <div class="col-sm-9" mref="FunctionCard"> 
          <div class="card">
            <div class="card-header edit">
              <input
                placeholder="Indicator Name"
                value={cardDataEdit.header}
                oninput={evt => cardDataEdit.header = evt.target.value}
                class={cardDataEdit.header.match(indicatorNameRegex)==null?'form-control is-invalid':''}
              />
            </div>
            <div class="card-body">
              <h5 class="card-title">
                <input
                  placeholder="Long Name"
                  value={cardDataEdit.longName}
                  oninput={evt => cardDataEdit.longName = evt.target.value}
                />
              </h5>
              <h6 class="card-title">
                <input
                  placeholder="Declaration"
                  value={cardDataEdit.declaration}
                  oninput={evt => cardDataEdit.declaration = evt.target.value}
                />
              </h6>
              <p class="card-text">
                <input
                  placeholder="Description"
                  value={cardDataEdit.description}
                  oninput={evt => cardDataEdit.description = evt.target.value}
                />
              </p>
              <button class="btn btn-primary" 
                onclick={evt => {
                  editMode=false;
                  saveAction(cardDataEdit);
                }}>
                Save
              </button>
            </div>
          </div>
        </div>
      }
    }
  };
}