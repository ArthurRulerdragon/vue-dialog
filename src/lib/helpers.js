const merge = (...args) => {
  const [target] = args;
  for (let i = 1, j = args.length; i < j; i += 1) {
    let source = args[i] || {};
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        let value = source[prop];
        if (value !== undefined) {
          target[prop] = value;
        }
      }
    }
  }
  return target;
};

let scrollBarWidth;

const getScrollBarWidth = () => {
  if (scrollBarWidth !== undefined) {
    return scrollBarWidth;
  }

  const outer = document.createElement('div');
  outer.className = 'scrollbar__wrap';
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = 'scroll';

  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;
  outer.parentNode.removeChild(outer);
  scrollBarWidth = widthNoScroll - widthWithScroll;

  return scrollBarWidth;
};

const trim = (string) => {
  return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};

const camelCase = (name) => {
  return name.replace(
    /([\:\-\_]+(.))/g,
    (_, separator, letter, offset) => offset ? letter.toUpperCase() : letter
  ).replace(/^moz([A-Z])/, 'Moz$1');
};

const hasClass = (el, cls) => {
  if (!el || !cls) {
    return false;
  }
  if (cls.indexOf(' ') !== -1) {
    throw new Error('className should not contain space.');
  }
  if (el.classList) {
    return el.classList.contains(cls);
  }
  return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
};

const addClass = (el, cls) => {
  if (!el) {
    return;
  }
  let curClass = el.className;
  let classes = (cls || '').split(' ');

  for (let i = 0, j = classes.length; i < j; i++) {
    let clsName = classes[i];
    if (clsName) {
      if (el.classList) {
        el.classList.add(clsName);
      } else if (!hasClass(el, clsName)) {
        curClass += ' ' + clsName;
      }
    }
  }
  if (!el.classList) {
    el.className = curClass;
  }
};

const removeClass = (el, cls) => {
  if (!el || !cls) {
    return;
  }
  let classes = cls.split(' ');
  let curClass = ' ' + el.className + ' ';

  for (let i = 0, j = classes.length; i < j; i += 1) {
    let clsName = classes[i];
    if (clsName) {
      if (el.classList) {
        el.classList.remove(clsName);
      } else if (hasClass(el, clsName)) {
        curClass = curClass.replace(' ' + clsName + ' ', ' ');
      }
    }
  }
  if (!el.classList) {
    el.className = trim(curClass);
  }
};

const getStyle = () => {
  if (Number(document.documentMode) < 9) {
    return (element, styleName) => {
      if (!element || !styleName) {
        return null;
      }
      styleName = camelCase(styleName);
      if (styleName === 'float') {
        styleName = 'styleFloat';
      }
      try {
        switch (styleName) {
          case 'opacity':
            try {
              return element.filters.item('alpha').opacity / 100;
            } catch (e) {
              return 1.0;
            }
          default:
            return (element.style[styleName] || element.currentStyle ? element.currentStyle[styleName] : null);
        }
      } catch (e) {
        return element.style[styleName];
      }
    }
  }
  return (element, styleName) => {
    if (!element || !styleName) {
      return null;
    }
    styleName = camelCase(styleName);
    if (styleName === 'float') {
      styleName = 'cssFloat';
    }
    try {
      let computed = document.defaultView.getComputedStyle(element, '');
      return element.style[styleName] || computed ? computed[styleName] : null;
    } catch (e) {
      return element.style[styleName];
    }
  };
}

export default {
  merge,
  getScrollBarWidth,
  hasClass,
  addClass,
  removeClass,
  getStyle,
};

export const CLOSE_EVENT = () => {};
export const CLOSED_EVENT = () => {};
export const OPEN_EVENT = () => {};
export const OPENED_EVENT = () => {};
export const UPDATE_MODEL_EVENT = () => {};
