import {bindHandlers} from "../bind";
import KoalaJs from './';

class _Querier {
  constructor() {
    bindHandlers(this, 'qu');
  }
  qu(q) {
    return new Promise(resolve => {
      window.setTimeout(resolve.bind(null, 'Echo ' + q), 120);
    });
  }
}

const Querier1 = new _Querier();
const Querier2 = new _Querier();

class _A {
  constructor() {
    bindHandlers(this, 'time');
    const queries = [
      { o: Querier1, agent: Querier1.qu, query: 'a0', sleepingTime: 0 },
      { o: Querier1, agent: Querier1.qu, query: 'a1' },
      { o: Querier1, agent: Querier1.qu, query: 'b1' },
      { o: Querier2, agent: Querier2.qu, query: 'A2' },
      { o: Querier1, agent: Querier1.qu, query: 'c1' },
      { o: Querier1, agent: Querier1.qu, query: 'c1' },
      { o: Querier2, agent: Querier2.qu, query: 'B2' },
      { o: Querier2, agent: Querier2.qu, query: 'B2' },
      { o: Querier1, agent: Querier1.qu, query: 'a1' }
    ];

    queries.forEach(q => {
      console.log('TESTing ', q.o.constructor.name, q.query);
      KoalaJs.request(q).then(response => {
        const d = new Date();
        console.log(this.time(d) + ': ' + response);
      }, rejection => {
        const d = new Date();
        console.log(this.time(d) + ': ' + rejection);
      });
    });
  }

  time(date) {
    return date.getUTCHours()+':'+date.getUTCMinutes()+':'+date.getUTCSeconds()+'.'+date.getUTCMilliseconds();
  }
}

const A = new _A();
