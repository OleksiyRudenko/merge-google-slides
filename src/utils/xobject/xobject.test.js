import * as xobject from './xobject';

it('filters object by props', () => {
  const filtered = xobject.oFilterProps({
    objectId: {any: 'any'},
    a: {
      b0: {
        c: 'AAA'
      },
      b1: {
        objectId: 'x',
        b10: {}
      },
    },
    c: {},
    d: {
      e: 'EEEE',
      f: [],
      g: [ 'aaaa', 'bbbb', {h: { objectId: 'HHHH', i: 'IIII' } }   ],
    },
  }, ['objectId']);

  const expected = {
    objectId: {any: 'any'},
    a: {
      b1: {
        objectId: 'x',
      },
    },
    d: {
      g: [ {h: { objectId: 'HHHH', } }  ],
    },
  };

  console.log(filtered);
  console.log(expected);

  expect(filtered).toEqual(expected);
});
