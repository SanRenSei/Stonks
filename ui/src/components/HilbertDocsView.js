var m = require('mithril');

export default (vnode) => {

  return {
    
    view: () => {
      var basicFunctions = [
        {name: 'OPEN', desc: 'Opening price for an equity on the current day'},
        {name: 'CLOSE', desc: 'Closing price for an equity on the current day'},
        {name: 'LOW', desc: 'Lowest price for an equity on the current day'},
        {name: 'HIGH', desc: 'Highest price for an equity on the current day'},
        {name: 'VOLUME', desc: 'Share volume traded of an equity on the current day'},
        {name: 'NAME', desc: 'String value for official listed name for an equity on NASDAQ'},
        {name: 'STOCK', desc: 'True if the equity is a stock, false if the equity is an ETF'},
        {name: 'OPXCOUNT', desc: 'The number of unique options combinations of type (CALL/PUT), strike price, and expiration date for an equity that are currently available to trade on NASDAQ.'},
        {name: 'OPXDATES', desc: 'The number of unique options expiration dates that are currently available to trade on NASDAQ'},
        {name: 'OPXPRICES', desc: 'The number of unique option strike prices that are currently available to trade on NASDAQ'}
      ];
      var basicOperators = [
        {name: '+', desc: 'Add two numbers (applicable over array)'},
        {name: '-', desc: 'Subtract two numbers (applicable over array)'},
        {name: '*', desc: 'Multiply two numbers (applicable over array)'},
        {name: '/', desc: 'Divide two numbers (applicable over array)'},
        {name: 'δ', desc: 'Absolute value of a number'},
        {name: ':', desc: 'Generate an array of integer values between two numbers, inclusive'},
        {name: '&', desc: 'Minimum between two numbers'},
        {name: '|', desc: 'Maximum between two numbers'},
        {name: '🔗', desc: 'Join values into an array'}
      ];
      var arrayOperators = [
        {name: 'Σ', desc: 'Add all values in an array'},
        {name: 'Ω', desc: 'Returns the greatest value in an array'},
        {name: 'ω', desc: 'Returns the lowest value in an array'}
      ];
      var miscOperators = [
        {name: '→', desc: 'Used for recursive functions.  Apply the left side to the start of time.  Then, for each subsequent day, apply the right expression.',
        examples: [
          'Use HIGH→(HIGH | 1 Δ ATH) to declare an All Time High function.  On the first day of historical data, ATH = HIGH.  On subsequent days, ATM = HIGH | 1 Δ ATH (the maximum between todays HIGH and yesterdays ATH)'
        ]},
        {name: 'Ø', desc: 'Return the right side if the left side is null. Otherwise, return the left side.',
        examples: [
          'CLOSE[60]Ø0 will return 0 if data does not exist for an equity 60 days ago.  This might happen if it IPOed recently.',
          '(CLOSE[5]Ø-1)=-1 will return false if data exists 5 days ago, and true otherwise.  This can detect recent offerings and IPOs.'
        ]},
        {name: '⏪', desc: 'Rewind time until the left expression returns true.  Then, return the right expression.',
        examples: [
          '(ΣCLOSE[1:20]/20>ΣCLOSE[1:40]/40)⏪DATE will return the most recent date that the 20 day moving average was greater than the 40 day moving average',
          '(DATE=20210102)⏪CLOSE[1:20]/20 will return the 20 day moving average as of January 2, 2021.',
          '(CLOSE[1]>OPEN[1] & CLOSE[2]&OPEN[2])⏪(CLOSE[-1]/CLOSE) will give the monetary return of holding an equity for a day after the most recent time that it had two green days in a row.'
        ]},
        {name: 'Δ', desc: 'Perform an offset by a specified number of days.',
        examples: [
          '5ΔCLOSE will return the closing price 5 days ago.  Note this is the same as CLOSE[5].',
          '1:5 Δ (CLOSE/CLOSE[1]) will give the daily returns of the last 5 trading days'
        ]}
      ];
      return (
      <div>
      <br /><br />
        <h2> Basic Functions </h2>
        <br />
        <table>
          <tr>
            <th>Keyword</th>
            <th>Explanation</th>
          </tr>
          {basicFunctions.map(func => (<tr>
            <td>{func.name}</td>
            <td>{func.desc}</td>
          </tr>))}
        </table>
        <br /><br />
        <p> Note: The functions in the above table that apply to the current date can take an optional offset parameter representing a number of trading days. </p>
        <br />
        <p> Example: CLOSE[5] will return the closing price of an equity 5 trading days before the current date. </p>
        <br /><br />
        <h2>Basic Operators </h2>
        <table>
          <tr>
            <th>Operator</th>
            <th>Explanation</th>
          </tr>
          {basicOperators.map(func => (<tr>
            <td>{func.name}</td>
            <td>{func.desc}</td>
          </tr>))}
        </table>
        <br /><br />
        <h4> Examples </h4>
        <p> 2+2 will return 4 </p>
        <p> 2*3 will return 6 </p>
        <p> 1:5 will return [1,2,3,4,5] </p>
        <p> δ-5 will return 5 </p>
        <p> (1:5)*3 will return [3,6,9,12,15] </p>
        <p> (1:5)*(1:5) will return [1,4,9,16,25] </p>
        <p> δ(-3:3) will return [3,2,1,0,1,2,3] </p>
        <p> The offset parameter used in the basic function may also be an array. </p>
        <p> CLOSE[1:5] will return an array of the last 5 closing prices on trading days. </p>
        <p> OPEN[0:4]-CLOSE[1:5] will return an array of the last 5 overnight price changes between trading days </p>
        <p> 1 🔗 2 will return the array [1,2] </p>
        <p> [3,1,4] 🔗 [5,9,2] will return the array [3,1,4,1,5,9,2] </p>
        <h2>Array Operators </h2>
        <table>
          <tr>
            <th>Operator</th>
            <th>Explanation</th>
          </tr>
          {arrayOperators.map(func => (<tr>
            <td>{func.name}</td>
            <td>{func.desc}</td>
          </tr>))}
        </table>
        <br /><br />
        <h4> Examples </h4>
        <p> Σ1:5 will return 15 </p>
        <p> Ω1:5 will return 5 </p>
        <p> ω1:5 will return 1 </p>
        <p> ωLOW[1:20] will return the lowest price of an equity over the last 20 trading days </p>
        <p> ΣCLOSE[1:20]/20 will return the average closing price of an equity over the last 20 trading days </p>
        <h2>Additional Complex Operators </h2>
        <table>
          <tr>
            <th>Operator</th>
            <th>Explanation</th>
          </tr>
          {miscOperators.map(func => {
            var mainRow = <tr class='highlight'>
              <td>{func.name}</td>
              <td>{func.desc}</td>
            </tr>;
            var exampleRows = func.examples.map(ex => (
              <tr>
                <td colspan={2}>{ex}</td>
              </tr>
            ));
            console.log(exampleRows);
            return [mainRow, exampleRows];
          })}
        </table>
      </div>
    );
    }
  };
}