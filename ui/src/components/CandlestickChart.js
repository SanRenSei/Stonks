var m = require('mithril');
var prop = require('mithril/stream');

import magicNumbers from '../magic_numbers/MagicNumbers';

export default (vnode) => {
  
  var hoverCandle = prop(-1);
  
  // Take the current low and high and compute the smallest window from multiples of magic numbers that contains the low and high
  var aestheticViewport = (low, high) => {
    for (var i=0;i<magicNumbers.length;i++) {
      var lowBound = magicNumbers[i]*Math.floor(low/magicNumbers[i]);
      if (lowBound + magicNumbers[i] >= high) {
        return [lowBound, lowBound + magicNumbers[i]];
      }
    }
    return [low, high];
  }
  
  return {
    view: (vnode) => {
            
      var {data} = vnode.attrs;
      
      if (data.length==0) {
        return <div>Fetch data first</div>;
      }
      
      var lowestLow = data.map(x => x.low).reduce((x,n)=>Math.min(x,n));
      var highestHigh = data.map(x => x.high).reduce((x,n)=>Math.max(x,n));
      
      var viewport = aestheticViewport(lowestLow, highestHigh);
      console.log(viewport);
      lowestLow = viewport[0];
      highestHigh = viewport[1];
      
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
      
      var gridSpacing = (highestHigh-lowestLow)/10;
      var gridLines = [];
      for (var i=0;i<=10;i++) {
        gridLines.push(<line
          x1 = {0}
          y1 = {-highestHigh+i*gridSpacing}
          x2 = {1000}
          y2 = {-highestHigh+i*gridSpacing}
          stroke = "lightgrey"
        />);
        gridLines.push(<text
          x={0}
          y={0}
          transform={`translate(5 ${-highestHigh+i*gridSpacing}) scale(1 ${(highestHigh-lowestLow)/1000})`}
          >
          {highestHigh-i*gridSpacing}
        </text>);
      }
      
      var numCandles = data.length;
      var candleWidth = 800/numCandles;
      var candleSpacing = 1000/numCandles;
      var candles = data.map((d, i) => {
        return [
        <line
          x1 = {1000-candleSpacing*(i+1)+candleWidth/2}
          y1 = {-d.low}
          x2 = {1000-candleSpacing*(i+1)+candleWidth/2}
          y2 = {-d.high}
          stroke = "black"
        />,
        
        <rect 
          x={1000-candleSpacing*(i+1)}
          y={-Math.max(d.open, d.close)}
          width={candleWidth}
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
          {gridLines}
          {candles}
          {hoverInfo}
        </svg>
      </div>;
    }
  };
}