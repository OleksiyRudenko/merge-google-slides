/**
 * This callback is used by oTraverse to test the node against arbitrary conditions.
 * Can also be used to collect data.
 * @callback testCallback
 * @param {string} path
 * @param {string} propertyName
 * @param {*} propertyValue
 * @returns {Boolean} whether to apply mutationCallback
 */

/**
 * This callback is used by oTraverse to mutate the node value.
 * @callback mutationCallback
 * @param {string} path
 * @param {string} propertyName
 * @param {*} propertyValue
 * @returns {*} a value to replace original property value
 */

/**
 * Traverses object.
 * @param {Object} obj
 * @param {string} path
 * @param {testCallback} testCallback
 * @param mutationCallback
 * @returns {*}
 */
export const oTraverse = (obj, path, testCallback, mutationCallback) => {
  if (Array.isArray(obj)) {
    obj.forEach((element, idx) => {
      oTraverse(element, `${path}[${idx}]`, testCallback, mutationCallback);
    });
  } else if (isObject(obj)) {
    Object.keys(obj).forEach(propertyName => {
      const deeperPath = path + (path.length ? '.' : '') + propertyName;
      if (testCallback(deeperPath, propertyName, obj[propertyName]) && mutationCallback) {
        obj[propertyName] = mutationCallback(deeperPath, propertyName, obj[propertyName]);
      }
      oTraverse(obj[propertyName], deeperPath, testCallback, mutationCallback);
    });
  }
  return obj;
};

/**
 * Creates a copy of obj where each path ends in either of props.
 * oFilterProps({
 *   objectId: {any:any},
 *   a: { b0: { c: 'AAA'}, b1: { objectId: 'x', b10: {} } },
 *   c: {}
 * }, 'objectId') ==> {
 *   objectId: {any:any},
 *   a: {b1: { objectId: 'x' } }
 * }
 * When either of props is met then entire path is preserved
 * @param {Object} obj
 * @param {Array} props
 * @returns {Object}
 */
export const oFilterProps = (obj, props) => {
  let resultingObject = {};
  // console.log('>>>>>> oFilterProps() searching among ', Object.keys(obj), obj);
  Object.keys(obj).forEach(key => {
    if (props.includes(key)) {
      // console.log('oFilterProps() found!', key, obj[key]);
      resultingObject[key] = obj[key];
    } else {
      if (isObject(obj[key])) {
        // traverse deeper
        const subObj = oFilterProps(obj[key], props);
        if (Object.keys(subObj).length) {
          resultingObject[key] = subObj;
        }
      } else {
        if (Array.isArray(obj[key])) {
          const arr = obj[key].map(el => {
            if (isObject(el)) {
              const subObj = oFilterProps(el, props);
              if (Object.keys(subObj).length) {
                return subObj;
              }
            }
            return null;
          }).filter(el => !!el);
          // console.log(arr);
          if (arr.length) {
            resultingObject[key] = arr;
          }
        }
      }
    }
  });
  // console.log('<<<<<<<<< oFilterProps() returning ', resultingObject);
  return resultingObject;
};

/**
 * Creates an array of values from props.
 * oCollectValuesFromProps({
 *   objectId: {any:any},
 *   a: { b0: { c: 'AAA'}, b1: { objectId: 'x', b10: {} } },
 *   c: {}
 * }, 'objectId') ==> [
 *   {any:any},
 *   'x',
 * ]
 * When either of props is met then its value listed and its children are not traversed
 * @param {Object} obj
 * @param {Array} props
 * @param {Boolean} deeper whether to dig into found prop value if the value is an Object as well
 * @returns {Array}
 */
export const oCollectValuesFromProps = (obj, props, deeper = false) => {
  let resultingArray = [];
  // console.log('>>>>>> oCollectValuesFromProps() searching among ', Object.keys(obj), obj);
  Object.keys(obj).forEach(key => {
    if (props.includes(key)) {
      // console.log('oCollectValuesFromProps() found!', key, obj[key]);
      resultingArray.push(obj[key]);
      if (deeper) {
        if (Array.isArray(obj[key])) {
          // resultingArray = resultingArray.concat(['NESTED ARRAY FOUND ' + JSON.stringify(obj[key])]);
          const arr = obj[key].map(el => {
            if (isObject(el)) {
              const subArray = oCollectValuesFromProps(el, props, deeper);
              if (subArray.length) {
                return subArray;
              } else {
                return null;
              }
            }
            return null;
          }).filter(el => !!el);
          // console.log('oCollectValuesFromProps() array container', arr);
          if (arr.length) {
            resultingArray = resultingArray.concat(...arr);
          }
        } else {
          if (isObject(obj[key])) {
            // resultingArray = resultingArray.concat(['NESTED OBJECT FOUND ' + JSON.stringify(obj[key])]);
            // traverse deeper
            const subArray = oCollectValuesFromProps(obj[key], props, deeper);
            if (subArray.length) {
              resultingArray = resultingArray.concat(subArray);
            }
          }
        }
      }
    } else {
      if (isObject(obj[key])) {
        // traverse deeper
        const subArray = oCollectValuesFromProps(obj[key], props, deeper);
        if (subArray.length) {
          resultingArray = resultingArray.concat(subArray);
        }
      } else {
        if (Array.isArray(obj[key])) {
          const arr = obj[key].map(el => {
            if (isObject(el)) {
              const subArray = oCollectValuesFromProps(el, props, deeper);
              if (subArray.length) {
                return subArray;
              } else {
                return null;
              }
            }
            return null;
          }).filter(el => !!el);
          // console.log('oCollectValuesFromProps() array container', arr);
          if (arr.length) {
            resultingArray = resultingArray.concat(...arr);
          }
        }
      }
    }
  });
  // console.log('<<<<<<<<< oCollectValuesFromProps() returning ', resultingArray);
  return resultingArray;
};

/**
 * Returns array of strings and numbers only
 * @param {Array} arr
 * @param {Boolean} noNumbers - no typeof numbers
 * @returns {Array}
 */
export const aFilterAlphaNumerics = (arr, noNumbers = false) => arr.filter(el => {
  let t = typeof el;
  return (t === 'string' || (t === 'number' && !noNumbers));
});

/**
 * Converts an array into object where keys are top-level values from array and values are undefined.
 * Non-number|string elements are JSON.stringified
 * @param {Array} arr
 * @param {Boolean} filterAlphaNumerics remove anything else but numbers or strings from arr
 * @returns {Object}
 */
export const arrayToObjectKeys = (arr, filterAlphaNumerics = true) => {
  let resultingObject = {};
  if (filterAlphaNumerics) { arr = aFilterAlphaNumerics(arr); }
  arr
    .map(el => typeof el === 'object' ? JSON.stringify(el) : el)
    .forEach(el => {
      resultingObject[el] = undefined;
  });
  return resultingObject;
};

export const deepClone = subject => JSON.parse(JSON.stringify(subject));

function isObject(obj) {
  return obj !== null && typeof obj === 'object' && Array.isArray(obj) === false;
}
