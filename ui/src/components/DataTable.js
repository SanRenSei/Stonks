var m = require('mithril');
var prop = require('mithril/stream');

export default (vnode) => {
  
  var page = prop(0);
  var displayRows = prop(50);
  
  return {
    view: (vnode) => {
      var {data} = vnode.attrs;
      
      var headers = ['Date', 'Open', 'Low', 'High', 'Close', 'Volume'];
      
      var highlightPositive = (r) => {
        return r.close > r.open;
      };
      
      var highlightNegative = (r) => {
        return r.open > r.close;
      };
      
      var rows = [];
      
      var headerRow = <tr>
        {headers.map(h => <th scope="col">{h}</th>)}
      </tr>;
      
      rows.push(headerRow);
      
      var startRow = page()*displayRows();
      var endRow = startRow + displayRows();
      for (var i=startRow;i<endRow && i<data.length;i++) {
        rows.push(<tr class={`${highlightPositive(data[i]) && 'table-success'} ${highlightNegative(data[i]) && 'table-danger'}`}>
          {headers.map(h => <td>{data[i][h.toLowerCase()]}</td>)}
        </tr>);
      }
      
      return (
        <div style={{margin:'1em'}}>
          <table class="table table-sm">
            {rows}
          </table>
        </div>);
    }
  };
}