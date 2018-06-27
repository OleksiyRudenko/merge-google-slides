import {bindHandlers} from "../bind";
import {DeferredCachedRequestService} from './DeferredCachedRequestService';

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
    const queries = [
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
      DeferredCachedRequestService.request({agent: q.agent, query: q.query}, {success: this.onSuccess});
    });
  }

  onSuccess(res) {
    console.log(res);
  }
}

const A = new _A();
