import Sequences from '../models/Sequences.js';

Sequences.sync({alter:true}).then(_ => {
  console.log('Database sync complete');
})