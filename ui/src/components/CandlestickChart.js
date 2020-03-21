var m = require('mithril');
var prop = require('mithril/stream');

export default (vnode) => {
  
  var hoverCandle = prop(-1);
  
  return {
    view: (vnode) => {
            
      var {data} = vnode.attrs;
      var displayCandles = 50;
      
      if (data.length==0) {
        return <div>Fetch data first</div>;
      }
      
      var lowestLow = data.filter((x,i)=>i<50).map(x => x.low).reduce((x,n)=>Math.min(x,n));
      var highestHigh = data.filter((x,i)=>i<50).map(x => x.high).reduce((x,n)=>Math.max(x,n));
      
      var hoverInfo = hoverCandle()!=-1 && [
        `DATE: ${data[hoverCandle()].date}`,
        `OPEN: ${data[hoverCandle()].open}`,
        `LOW: ${data[hoverCandle()].low}`,
        `HIGH: ${data[hoverCandle()].high}`,
        `CLOSE: ${data[hoverCandle()].close}`,
        `VOLUME: ${data[hoverCandle()].volume}`
      ].map((t,i) => {
        return <text
          x={0}
          y={20*i}
          transform={`translate(5 ${-highestHigh+(highestHigh-lowestLow)/10}) scale(1 ${(highestHigh-lowestLow)/1000})`}
          >
        {t}
        </text>
      });
      
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
          onmouseover={evt => hoverCandle(i)}
          onmouseout={evt => hoverCandle(-1)}
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
          {hoverInfo}
        </svg>
      </div>;
    }
  };
}