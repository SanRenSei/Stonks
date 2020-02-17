var m = require('mithril');
var prop = require('mithril/stream');

export default (vnode) => {
  
  return {
    view: (vnode) => {
      var {data} = vnode.attrs;
      var displayCandles = 50;
      
      if (data.length==0) {
        return <div>Fetch data first</div>;
      }
      
      var lowestLow = data.filter((x,i)=>i<50).map(x => x.low).reduce((x,n)=>Math.min(x,n));
      var highestHigh = data.filter((x,i)=>i<50).map(x => x.high).reduce((x,n)=>Math.max(x,n));
      
      var candles = data.filter((x,i)=>i<50).map((d, i) => {
        return [
        <line
          x1 = {988-20*i}
          y1 = {-d.low}
          x2 = {988-20*i}
          y2 = {-d.high}
          stroke = "black"
        />,
        
        <rect 
          x={980-20*i}
          y={-Math.max(d.open, d.close)}
          width={16}
          height={Math.abs(d.close-d.open)}
          fill={d.close>d.open?'green':'red'}
        />]
      });
      
      return <div>
        <svg
          preserveAspectRatio="none"
          viewBox={`0 ${-highestHigh} 1000 ${highestHigh-lowestLow}`}
          width={500}
          height={500}
        >
          {candles}
        </svg>
      </div>;
    }
  };
}