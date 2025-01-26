import { api } from 'src/scripts/api'
import { util } from 'src/scripts/util'
import { storage } from 'src/scripts/storage'

let I18N
let LOADING = false

const _update = function (data) {
  if (!(util.isObject(I18N) && I18N.global)) {
    return
  }
  let i18n = I18N.global
  if (util.isArray(data.languages)) {
    let config = storage.config()
    config.languages = data.languages
    storage.config(config)
  }
  i18n.locale = data.active
  i18n.setLocaleMessage(data.active, data.message)
}

const _load = (next) =>
  new Promise(() => {
    api.call({
      path: '/message/portal',
      onSuccess(data) {
        data = util.isObject(data) ? data : {}
        if (util.isObject(data.message) && util.isString(data.active)) {
          _update(data)
        }
        next()
      },
      notify: true,
      onError(error) {
        next()
        util.log('<<msg._activate-ERROR>>', error)
      },
    })
  })

const msg = {
  i18n: function (v) {
    if (util.isObject(v)) {
      I18N = v
    } else {
      return I18N
    }
  },

  $t: function (text, ...args) {
    if (!util.isString(text)) {
      return ''
    }
    let str
    if (I18N?.global) {
      str = String(text)
      str = I18N.global.t(str)
      for (let i = 0; i < args.length; i++) {
        str = str.replaceAll('#' + i + '#', I18N.global.t(args[i] + ''))
      }
    } else {
      str = msg.$r(text, ...args)
    }
    return str
  },

  $r: function (text, ...args) {
    if (!util.isString(text)) {
      return ''
    }
    let str = String(text)
    for (let i = 0; i < args.length; i++) {
      str = str.replaceAll('#' + i + '#', args[i] + '')
    }
    return str
  },

  load: async function (next) {
    if (!LOADING) {
      LOADING = true
      await _load(next)
    }
  },
}
export { msg }
