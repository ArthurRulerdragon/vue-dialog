import helper from './helpers';

let hasModal = false;
let hasInitZIndex = false;
let zIndex;

const getModal = () => {
  let modalDom = PopupManager.modalDom;
  if (modalDom) {
    hasModal = true;
    return modalDom;
  }
  hasModal = false;
  modalDom = document.createElement('div');
  PopupManager.modalDom = modalDom;

  modalDom.addEventListener('touchmove', function (event) {
    event.preventDefault();
    event.stopPropagation();
  });

  modalDom.addEventListener('click', function () {
    PopupManager.doOnModalClick && PopupManager.doOnModalClick();
  });

  return modalDom;
};

const instances = {};

const PopupManager = {
  modalFade: true,

  getInstance: (id) => instances[id],

  register(id, instance) {
    if (id && instance) {
      instances[id] = instance;
    }
  },

  deregister(id) {
    if (id) {
      instances[id] = null;
      delete instances[id];
    }
  },

  nextZIndex() {
    PopupManager.zIndex += 1
    return PopupManager.zIndex;
  },

  modalStack: [],

  doOnModalClick() {
    const topItem = PopupManager.modalStack[PopupManager.modalStack.length - 1];
    if (!topItem) {
      return;
    }

    const instance = PopupManager.getInstance(topItem.id);
    if (instance && instance.closeOnClickModal) {
      instance.close();
    }
  },

  openModal(id, zIndex, dom, modalClass, modalFade) {
    if (!id || zIndex === undefined) {
      return;
    }
    this.modalFade = modalFade;

    const modalStack = this.modalStack;

    for (let i = 0, j = modalStack.length; i < j; i++) {
      const item = modalStack[i];
      if (item.id === id) {
        return;
      }
    }

    const modalDom = getModal();

    // helper.addClass(modalDom, 'v-modal');
    if (this.modalFade && !hasModal) {
      // helper.addClass(modalDom, 'v-modal-enter');
    }
    if (modalClass) {
      let classArr = modalClass.trim().split(/\s+/);
      // classArr.forEach(item => helper.addClass(modalDom, item));
    }
    setTimeout(() => {
      helper.removeClass(modalDom, 'v-modal-enter');
    }, 200);

    if (dom && dom.parentNode && dom.parentNode.nodeType !== 11) {
      dom.parentNode.appendChild(modalDom);
    } else {
      document.body.appendChild(modalDom);
    }

    if (zIndex) {
      modalDom.style.zIndex = zIndex;
    }
    modalDom.tabIndex = 0;
    modalDom.style.display = '';
    this.modalStack.push({ id: id, zIndex: zIndex, modalClass: modalClass });
  },

  closeModal(id) {
    const modalStack = this.modalStack;
    const modalDom = getModal();

    if (modalStack.length > 0) {
      const topItem = modalStack[modalStack.length - 1];
      if (topItem.id === id) {
        if (topItem.modalClass) {
          let classArr = topItem.modalClass.trim().split(/\s+/);
          classArr.forEach(item => helper.removeClass(modalDom, item));
        }

        modalStack.pop();
        if (modalStack.length > 0) {
          modalDom.style.zIndex = modalStack[modalStack.length - 1].zIndex;
        }
      } else {
        for (let i = modalStack.length - 1; i >= 0; i--) {
          if (modalStack[i].id === id) {
            modalStack.splice(i, 1);
            break;
          }
        }
      }
    }

    if (modalStack.length === 0) {
      if (this.modalFade) {
        // helper.addClass(modalDom, 'v-modal-leave');
      }
      setTimeout(() => {
        if (modalStack.length === 0) {
          if (modalDom.parentNode) {
            modalDom.parentNode.removeChild(modalDom);
          }
          // modalDom.style.display = 'none';
          PopupManager.modalDom = undefined;
        }
        helper.removeClass(modalDom, 'v-modal-leave');
      }, 200);
    }
  }
};

Object.defineProperty(PopupManager, 'zIndex', {
  configurable: true,
  get() {
    if (!hasInitZIndex) {
      zIndex = zIndex || 2000;
      hasInitZIndex = true;
    }
    return zIndex;
  },
  set(value) {
    zIndex = value;
  }
});

const getTopPopup = () => {
  if (PopupManager.modalStack.length > 0) {
    const topPopup = PopupManager.modalStack[PopupManager.modalStack.length - 1];
    if (!topPopup) {
      return;
    }
    return PopupManager.getInstance(topPopup.id);
  }
};

// handle `esc` key when the popup is shown
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    const topPopup = getTopPopup();
    if (topPopup && topPopup.closeOnPressEscape) {
      if (topPopup.handleClose) {
        topPopup.handleClose()
        return
      }
      if (topPopup.handleAction) {
        topPopup.handleAction('cancel')
        return
      }
      topPopup.close();
    }
  }
});

export default PopupManager;
