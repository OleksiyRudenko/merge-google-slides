/**
 * Creates a copy of obj where each path ends in either of props.
 * filterProps({
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

function isObject(obj) {
  return obj != null && typeof obj === 'object' && Array.isArray(obj) === false;
}
