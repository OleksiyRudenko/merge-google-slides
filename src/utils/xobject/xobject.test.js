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

  expect(filtered).toEqual(expected);
});

it('collects props\' values from object', () => {
  const collected = xobject.oCollectValuesFromProps({
    objectId: {any: 'any'},
    a: {
      objectId: 'x0',
      b0: {
        c: 'AAA'
      },
      b1: {
        objectId: 'x1',
        b10: {}
      },
    },
    c: {},
    d: {
      e: 'EEEE',
      f: [],
      g: [ 'aaaa', 'bbbb', {h: { objectId: 'x2', i: 'IIII' } }   ],
    },
    j: {
      objectId: {
        k: 'KKK',
        objectId: 'x3',
      },
      m: 'MMMM',
    }
  }, ['objectId']);

  const expected = [
    {any: 'any'},
    'x0',
    'x1',
    'x2',
    { k: 'KKK', objectId: 'x3', },
  ];

  expect(collected).toEqual(expected);
});

it('collects props\' values from object even deeper', () => {
  const collected = xobject.oCollectValuesFromProps({
    objectId: {any: 'any'},
    a: {
      objectId: 'x0',
      b0: {
        c: 'AAA'
      },
      b1: {
        objectId: 'x1',
        b10: {}
      },
    },
    c: {},
    d: {
      e: 'EEEE',
      f: [],
      g: [ 'aaaa', 'bbbb', {h: { objectId: 'x2', i: 'IIII' } }   ],
    },
    j: {
      objectId: {
        k: 'KKK',
        objectId: 'x3',
      },
      m: 'MMMM',
    },
    n: {
      objectId: ['x4', { objectId: 'x5'} ]
    }
  }, ['objectId'], true);

  const expected = [
    {any: 'any'},
    'x0',
    'x1',
    'x2',
    { k: 'KKK', objectId: 'x3', },
    'x3',
    ['x4', { objectId: 'x5'} ],
    'x5',
  ];

  expect(collected).toEqual(expected);
});

let globalCollection;

it('collects props\' values from object using oTraverse', () => {
  globalCollection = [];
  xobject.oTraverse({
    objectId: {any: 'any'},
    a: {
      objectId: 'x0',
      b0: {
        c: 'AAA'
      },
      b1: {
        objectId: 'x1',
        b10: {}
      },
    },
    c: {},
    d: {
      e: 'EEEE',
      f: [],
      g: [ 'aaaa', 'bbbb', {h: { objectId: 'x2', i: 'IIII' } }   ],
    },
    j: {
      objectId: {
        k: 'KKK',
        objectId: 'x3',
      },
      m: 'MMMM',
    },
    n: {
      objectId: ['x4', { objectId: 'x5'} ]
    }
  }, '', testCollector);

  const expected = [
    {any: 'any'},
    'x0',
    'x1',
    'x2',
    { k: 'KKK', objectId: 'x3', },
    'x3',
    ['x4', { objectId: 'x5'} ],
    'x5',
  ];

  expect(globalCollection).toEqual(expected);
});

function testCollector(path, propertyName, propertyValue) {
  if (['objectId'].includes(propertyName)) {
    globalCollection.push(propertyValue);
  }
  return false; // we don't need any mutations
}

it('collects props\' values along with property paths from object using oTraverse', () => {
  globalCollection = [];
  xobject.oTraverse({
    objectId: {any: 'any'},
    a: {
      objectId: 'x0',
      b0: {
        c: 'AAA'
      },
      b1: {
        objectId: 'x1',
        b10: {}
      },
    },
    c: {},
    d: {
      e: 'EEEE',
      f: [],
      g: [ 'aaaa', 'bbbb', {h: { objectId: 'x2', i: 'IIII' } }   ],
    },
    j: {
      objectId: {
        k: 'KKK',
        objectId: 'x3',
      },
      m: 'MMMM',
    },
    n: {
      objectId: ['x4', { objectId: 'x5'} ]
    }
  }, '', testRichCollector);

  const expected = [
    ['objectId', {any: 'any'}],
    ['a.objectId', 'x0'],
    ['a.b1.objectId', 'x1'],
    ['d.g[2].h.objectId', 'x2'],
    ['j.objectId', { k: 'KKK', objectId: 'x3', }],
    ['j.objectId.objectId', 'x3'],
    ['n.objectId', ['x4', { objectId: 'x5'} ]],
    ['n.objectId[1].objectId', 'x5'],
  ];

  expect(globalCollection).toEqual(expected);
});

function testRichCollector(path, propertyName, propertyValue) {
  if (['objectId'].includes(propertyName)) {
    globalCollection.push([path, propertyValue]);
  }
  return false; // we don't need any mutations
}

let globalMap = {}, globalCounter = 0;
it('mutates object using oTraverse', () => {
  globalMap = {};
  globalCounter = 0;
  const result = xobject.oTraverse({
    objectId: {any: 'any'},
    a: {
      objectId: 'x0',
      b0: {
        c: 'AAA'
      },
      b1: {
        objectId: 'x1',
        b10: {}
      },
    },
    c: {},
    d: {
      e: 'EEEE',
      f: [],
      parentId: 'x0',
      g: [ 'aaaa', 'bbbb', {h: { objectId: 'x2', i: 'IIII', parentId: 'x1' } }   ],
    },
    j: {
      objectId: {
        k: 'KKK',
        objectId: 'x3',
      },
      m: 'MMMM',
    },
    n: {
      objectId: ['x4', { objectId: 'x5', parentId: 'x1'} ]
    }
  }, '', testForMutation, testMutation);

  const expected = {
    objectId: 'id0_objectId',
    a: {
      objectId: 'id1_a.objectId',
      b0: {
        c: 'AAA'
      },
      b1: {
        b10: {},
        objectId: 'id2_a.b1.objectId',
      },
    },
    c: {},
    d: {
      e: 'EEEE',
      f: [],
      g: [ 'aaaa', 'bbbb', {h: { objectId: 'id3_d.g[2].h.objectId', i: 'IIII', parentId: 'id2_a.b1.objectId' } }   ],
      parentId: 'id1_a.objectId',
    },
    j: {
      objectId: 'id4_j.objectId',
      m: 'MMMM',
    },
    n: {
      objectId: 'id5_n.objectId',
    },
  };

  expect(result).toEqual(expected);
});

function testForMutation(path, propertyName, propertyValue) {
  return ['objectId', 'parentId'].includes(propertyName);
}

function testMutation(path, propertyName, propertyValue) {
  if (propertyName === 'objectId') {
    globalMap[propertyValue] = 'id' + globalCounter++ + '_' + path;
  }
  if (['objectId', 'parentId'].includes(propertyName)) {
    return globalMap[propertyValue];
  } else {
    return propertyValue;
  }
}

it('filters alphanumerics from array', () => {
  const collected = xobject.aFilterAlphaNumerics([
    'abc',
    '5',
    6,
    '7a',
    'a8',
  ]);

  const expected = [
    'abc',
    '5',
    6,
    '7a',
    'a8',
  ];

  expect(collected).toEqual(expected);
});

it('filters alphanumerics from array strictly', () => {
  const collected = xobject.aFilterAlphaNumerics([
    'abc',
    '5',
    6,
    '7a',
    'a8',
  ], true);

  const expected = [
    'abc',
    '5',
    '7a',
    'a8',
  ];

  expect(collected).toEqual(expected);
});

it('converts an array into object with keys from array elements excluding non-string|number values', () => {
  const factual = xobject.arrayToObjectKeys([
    'abc',
    '5',
    {abc: 'def'},
    6,
    ['j', 'k'],
    '7a',
    undefined,
    'a8',
    null,
    5,
    6,
  ]);

  const expected = {
    'abc': undefined,
    '5': undefined,
    6: undefined,
    '7a': undefined,
    'a8': undefined,
  };

  console.log(factual);

  expect(factual).toEqual(expected);
});

it('converts an array into object with keys from array elements thorough', () => {
  const factual = xobject.arrayToObjectKeys([
    'abc',
    '5',
    {abc: 'def'},
    6,
    ['j', 'k'],
    null,
    '7a',
    undefined,
    'a8',
    null,
  ], false);

  const expected = {
    'abc': undefined,
    '5': undefined,
    "{abc: 'def'}": undefined,
    6: undefined,
    "['j', 'k']": undefined,
    '7a': undefined,
    'undefined': undefined,
    'a8': undefined,
    'null': undefined,
  };

  console.log(factual);

  expect(factual).toEqual(expected);
});
