/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea() {
      return width * height;
    },
  };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const result = Object.create(proto);
  const JSONData = JSON.parse(json);
  Object.keys(JSONData).forEach((i) => {
    result[i] = JSONData[i];
  });

  return result;
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const cssSelectorBuilder = {
  line: '',
  pseudoElementCounter: 0,
  idCounter: 0,
  elementCounter: 0,
  level: 0,
  selectorsOrder: [],

  createObj() {
    const obj = { ...this };
    obj.level += 1;
    if (this.level === 0) {
      this.pseudoElementCounter = 0;
      this.idCounter = 0;
      this.elementCounter = 0;
      this.selectorsOrder = [];
    }
    this.line = '';
    return obj;
  },

  element(value) {
    this.elementCounter += 1;
    if (this.elementCounter > 1) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    if (this.selectorsOrder.length > 0) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.selectorsOrder.push('element');
    this.line += `${value}`;
    return this.createObj();
  },

  id(value) {
    this.idCounter += 1;
    if (this.idCounter > 1) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    if (this.selectorsOrder.length > 0 && this.selectorsOrder[this.selectorsOrder.length - 1] !== 'element') {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.selectorsOrder.push('id');
    this.line += `#${value}`;
    return this.createObj();
  },

  class(value) {
    if (this.selectorsOrder.length > 0
      && this.selectorsOrder[this.selectorsOrder.length - 1] !== 'id'
      && this.selectorsOrder[this.selectorsOrder.length - 1] !== 'element'
      && this.selectorsOrder[this.selectorsOrder.length - 1] !== 'class') {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.selectorsOrder.push('class');
    this.line += `.${value}`;
    return this.createObj();
  },

  attr(value) {
    if (this.selectorsOrder[this.selectorsOrder.length - 1] === 'pseudoClass' || this.selectorsOrder[this.selectorsOrder.length - 1] === 'pseudoElement') {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.selectorsOrder.push('attr');
    this.line += `[${value}]`;
    return this.createObj();
  },

  pseudoClass(value) {
    if (this.selectorsOrder[this.selectorsOrder.length - 1] === 'pseudoElement') {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.selectorsOrder.push('pseudoClass');
    this.line += `:${value}`;
    return this.createObj();
  },

  pseudoElement(value) {
    this.selectorsOrder.push('pseudoElement');
    this.pseudoElementCounter += 1;
    if (this.pseudoElementCounter > 1) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.line += `::${value}`;
    return this.createObj();
  },

  combine(selector1, combinator, selector2) {
    this.line += `${selector1.stringify()} ${combinator} ${selector2.stringify()}`;
    return this.createObj();
  },
  stringify() {
    const obj = this.createObj();
    return obj.line;
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
