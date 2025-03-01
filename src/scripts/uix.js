import { Notify, Loading, Dialog, Dark } from 'quasar'
import { util } from 'src/scripts/util'
import { msg } from 'src/scripts/msg'
import { storage } from 'src/scripts/storage'

const check_args = (...args) => {
  let cres = { trans: true, args: args }
  if (args?.length) {
    if (util.isBoolean(args[args.length - 1])) {
      cres.trans = args[args.length - 1]
      cres.args = args
      cres.args.splice(cres.args.length - 1)
    }
  }
  return cres
}
const replace_args = (text, ...args) => {
  let str = text
  for (let i = 0; i < args.length; i++) {
    str = str.replaceAll('#' + i + '#', args[i] + '')
  }
  return str
}

const uix = {
  /*
   * NOTIFY
   */
  notify: (text, ...args) => {
    if (util.isString(text)) {
      let cargs = check_args(...args)
      let message = cargs.trans ? msg.$t(text, ...cargs.args) : replace_args(text, ...cargs.args)
      Notify.create({
        message: message,
        multiLine: true,
        progress: true,
        classes: 'glossy full-width',
        html: true,
        actions: [{ icon: 'close', color: 'red' }],
      })
    }
  },

  /*
   * ERROR
   */
  error: (text, ...args) => {
    if (util.isString(text)) {
      let cargs = check_args(...args)
      let message = cargs.trans ? msg.$t(text, ...cargs.args) : replace_args(text, ...cargs.args)
      Notify.create({
        type: 'negative',
        position: 'center',
        message: message,
        multiLine: true,
        html: true,
        timeout: 1500,
      })
    }
  },

  /*
   * ALERT
   */
  alert: (text, ...args) => {
    if (util.isString(text)) {
      let cargs = check_args(...args)
      let message = cargs.trans ? msg.$t(text, ...cargs.args) : replace_args(text, ...cargs.args)
      Dialog.create({
        message: message,
        html: true,
      })
    }
  },

  /*
   * CONFIRM
   */
  confirm: (onOk, text, ...args) => {
    if (util.isString(text)) {
      let cargs = check_args(...args)
      let message = cargs.trans ? msg.$t(text, ...cargs.args) : replace_args(text, ...cargs.args)
      Dialog.create({
        message: message,
        html: true,
        ok: {
          noCaps: true,
          glossy: true,
          color: 'positive',
          label: msg.$t('label.continue'),
        },
        cancel: {
          noCaps: true,
          glossy: true,
          color: 'negative',
          label: msg.$t('label.cancel'),
        },
        persistent: true,
      }).onOk(() => {
        if (util.isFunction(onOk)) {
          onOk()
        }
      })
    }
  },

  /*
   * LOADER
   */
  loader: {
    show: (text, ...args) => {
      let params = {}
      if (util.isString(text)) {
        let cargs = check_args(...args)
        params.message = cargs.trans
          ? msg.$t(text, ...cargs.args)
          : replace_args(text, ...cargs.args)
      } else if (util.isObject(text)) {
        params = text
      }
      Loading.show(params)
    },
    hide: () => {
      Loading.hide()
    },
  },

  /*
   * DARK
   */
  dark: {
    active: (v) => {
      storage.dark(v)
      let b = storage.dark()
      Dark.set(b)
      return b
    },
    toggle: () => {
      let b = storage.dark()
      return uix.dark.active(!b)
    },
  },

  /*
   * CALENDAR
   */
  calendar: {
    beforeShow: (target, key_tab, key_proxy, key_value) => {
      target[key_proxy] = target[key_value]
      target[key_tab] = 'time' === target.type ? 'time' : 'date'
    },
  },

  /*
   * DIALOG
   */
  dialog: {
    init: (ref) => {
      let o = { show: false, parameters: null }
      if (util.isFunction(ref)) {
        o.pos = { x: 0, y: 0 }
        o.style = ''
        o.onDrag = (e) => {
          let d = ref()
          d.pos = { x: d.pos.x + e.delta.x, y: d.pos.y + e.delta.y }
          d.style = 'transform: translate(' + d.pos.x + 'px, ' + d.pos.y + 'px);'
        }
      }
      return o
    },
    show: (ref, parameters) => {
      if (util.isBoolean(ref?.show)) {
        if (util.isFunction(ref?.onDrag)) {
          ref.pos = { x: 0, y: 0 }
          ref.style = ''
        }
        ref.parameters = parameters
        ref.show = true
      }
    },
    hide: (ref) => {
      if (util.isBoolean(ref?.show)) {
        if (util.isFunction(ref?.onDrag)) {
          ref.pos = { x: 0, y: 0 }
          ref.style = ''
        }
        ref.parameters = null
        ref.show = false
      }
    },
  },
}
export { uix }
