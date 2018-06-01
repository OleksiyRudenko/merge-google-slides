/**
 * Binds methods by their names to a given context.
 * @param {Object} context
 * @param {Array} methodNames to bind
 */
export const bindHandlers = (context, ...methodNames) => {
  methodNames.forEach(name => {
    if (typeof context[name] === 'function') {
      context[name] = context[name].bind(context);
    } else {
      throw Error(
        `dom-utils.bindHandlers() expected function ${name}. Received ${typeof context[name]} instead.`
      );
    }
  });
};
