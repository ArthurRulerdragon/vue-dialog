<template>
  <transition
    name="dialog-fade"
    @after-enter="afterEnter"
    @after-leave="afterLeave"
  >
    <div
      v-show="visible"
      class="dialog__wrapper overlay"
      @click.self="handleWrapperClick"
    >
      <div
        role="dialog"
        :key="key"
        aria-modal="true"
        :aria-label="title || 'dialog'"
        :class="[
          'dialog',
          { 'is-fullscreen': fullscreen, 'dialog--center': center },
          customClass,
        ]"
        ref="dialog"
        :style="style"
      >
        <slot name="header" v-if="$slots.header"></slot>
        <div class="dialog__header" v-else>
          <slot name="title">
            <span class="dialog__title">{{ title }}</span>
          </slot>
          <button
            type="button"
            class="dialog__headerbtn"
            aria-label="Close"
            v-if="showClose"
            @click="handleClose"
          >
            <i class="dialog__close icon icon-close"></i>
          </button>
        </div>
        <div class="dialog__body" v-if="rendered"><slot></slot></div>
        <div class="dialog__footer" v-if="$slots.footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import Popup from "../lib/index";

const broadcast = function broadcast(componentName, eventName, params) {
  Object.keys(this.$refs || {}).forEach((key) => {
    const child = this.$refs[key]
    if (key === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
      return;
    }
    broadcast.apply(child, [componentName, eventName].concat([params]));
  });
};

export default {
  mixins: [Popup],
  props: {
    title: {
      type: String,
      default: "",
    },
    modal: {
      type: Boolean,
      default: true,
    },
    modalAppendToBody: {
      type: Boolean,
      default: true,
    },
    appendToBody: {
      type: Boolean,
      default: false,
    },
    lockScroll: {
      type: Boolean,
      default: true,
    },
    closeOnClickModal: {
      type: Boolean,
      default: true,
    },
    closeOnPressEscape: {
      type: Boolean,
      default: true,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    width: String,
    fullscreen: Boolean,
    customClass: {
      type: String,
      default: "",
    },
    top: {
      type: String,
      default: "15vh",
    },
    beforeClose: Function,
    center: {
      type: Boolean,
      default: false,
    },
    destroyOnClose: Boolean,
  },
  emits: ["open", "close", "opened", "closed", "update:visible"],
  data() {
    return {
      closed: false,
      key: 0,
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.closed = false;
        this.$emit("open");
        this.$el.addEventListener("scroll", this.updatePopper);
        this.$nextTick(() => {
          this.$refs.dialog.scrollTop = 0;
        });
        if (this.appendToBody) {
          document.body.appendChild(this.$el);
        }
        return;
      }
      this.$el.removeEventListener("scroll", this.updatePopper);
      if (!this.closed) {
        this.$emit("close");
      }
      if (this.destroyOnClose) {
        this.$nextTick(() => {
          this.key += 1;
        });
      }
    },
  },
  computed: {
    style() {
      let style = {};
      if (!this.fullscreen) {
        style.marginTop = this.top;
        if (this.width) {
          style.width = this.width;
        }
      }
      return style;
    },
  },
  methods: {
    dispatch(componentName, eventName, params) {
      let parent = this.$parent || this.$root;
      let name = parent.$options.componentName;

      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;
        if (parent) {
          name = parent.$options.componentName;
        }
      }
      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    broadcast(componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params);
    },
    handleWrapperClick() {
      if (!this.closeOnClickModal) return;
      this.handleClose();
    },
    handleClose() {
      if (typeof this.beforeClose === "function") {
        this.beforeClose(this.hide);
      } else {
        this.hide();
      }
    },
    hide(cancel) {
      if (cancel !== false) {
        this.$emit("update:visible", false);
        this.$emit("close");
        this.closed = true;
      }
    },
    updatePopper() {
      this.broadcast("ElSelectDropdown", "updatePopper");
      this.broadcast("ElDropdownMenu", "updatePopper");
    },
    afterEnter() {
      this.$emit("opened");
    },
    afterLeave() {
      this.$emit("closed");
    },
  },
  onMounted() {
    if (this.visible) {
      this.rendered = true;
      this.open();
      if (this.appendToBody) {
        document.body.appendChild(this.$el);
      }
    }
  },
  onUnmounted() {
    // if appendToBody is true, remove DOM node after destroy
    if (this.appendToBody && this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el);
    }
  },
};
</script>

<style>
.dialog {
  position: relative;
  margin: 0 auto 50px;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  width: 50%;
}

.dialog.is-fullscreen {
  width: 100%;
  margin-top: 0;
  margin-bottom: 0;
  height: 100%;
  overflow: auto;
}

.dialog__wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  margin: 0;
}

.dialog__header {
  padding: 20px 20px 10px;
}

.dialog__headerbtn {
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 0;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  font-size: 16px;
}

.dialog__headerbtn .dialog__close {
  color: #909399;
}

.dialog__headerbtn:focus .dialog__close,
.dialog__headerbtn:hover .dialog__close {
  color: #409eff;
}

.dialog__title {
  line-height: 24px;
  font-size: 18px;
  color: #303133;
}

.dialog__body {
  padding: 30px 20px;
  color: #606266;
  font-size: 14px;
  word-break: break-all;
}

.dialog__footer {
  padding: 10px 20px 20px;
  text-align: right;
  box-sizing: border-box;
}

.dialog--center {
  text-align: center;
}

.dialog--center .dialog__body {
  text-align: initial;
  padding: 25px 25px 30px;
}

.dialog--center .dialog__footer {
  text-align: inherit;
}

.dialog-fade-enter-active {
  animation: dialog-fade-in 0.3s;
}

.dialog-fade-leave-active {
  animation: dialog-fade-out 0.3s;
}

@keyframes dialog-fade-in {
  0% {
    transform: translate3d(0, -20px, 0);
    opacity: 0;
  }

  to {
    transform: translateZ(0);
    opacity: 1;
  }
}

@keyframes dialog-fade-out {
  0% {
    transform: translateZ(0);
    opacity: 1;
  }

  to {
    transform: translate3d(0, -20px, 0);
    opacity: 0;
  }
}

.overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  overflow: auto;
}

.popup-parent--hidden {
  overflow: hidden;
}

.v-modal-enter {
  animation: v-modal-in 0.2s ease;
}

.v-modal-leave {
  animation: v-modal-out 0.2s ease forwards;
}

@keyframes v-modal-in {
  0% {
    opacity: 0;
  }
}

@keyframes v-modal-out {
  to {
    opacity: 0;
  }
}

.v-modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  background: #000;
}
</style>
