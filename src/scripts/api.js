import { Router } from 'src/router/index.js'
import { APP } from 'src/scripts/static'
import { util } from 'src/scripts/util'
import { uix } from 'src/scripts/uix'
import { storage } from 'src/scripts/storage'
import axios from 'axios'

const processError = (objerr, onError, notify) => {
  let error = {}
  if (util.isObject(objerr)) {
    if (util.isArray(objerr.response)) {
      error = objerr.response
    } else if (util.isObject(objerr.response)) {
      let response = objerr.response
      if (response.status === 401) {
        // UNAUTHORIZED
        Router.push({ path: '/login' })
        return
      } else if (response.status === 502 || response.status === 503) {
        error.code = response.status + ''
        error.text = 'Service is unavailable'
      } else if (response.status === -4) {
        error.code = response.status + ''
        error.text = 'Timeout'
      } else if (response.status && response.error) {
        error.code = response.status + ''
        error.text = response.error
      } else {
        error.code = 'AE'
        error.text = 'Application Error'
      }
      error = [error]
    } else if (util.isArray(objerr.error)) {
      error = objerr.error
    } else if (objerr.code && objerr.message) {
      error.code = objerr.code + ''
      error.text = objerr.message + ''
      error = [error]
    }
  } else if (util.isArray(objerr)) {
    error = objerr
  }
  let dialog = false
  if (util.isFunction(onError)) {
    onError(util.isArray(error) ? error : [error])
    dialog = true === notify
  } else {
    dialog = true
  }
  if (dialog) {
    if (util.isArray(error)) {
      let i = error.length - 1
      uix.notify(error[i].text + ' (' + error[i].code + ')')
    } else {
      uix.notify(JSON.stringify(error))
    }
  }
}

const build = async (options) => {
  let opts = util.isObject(options) ? options : {}
  opts.method = util.isString(opts.method) ? opts.method.trim().toUpperCase() : 'GET'
  opts.baseURL = APP.api
  opts.url = util.isString(opts.url) ? opts.url : options.path
  let auth = storage.auth()
  let headers = util.isObject(opts.headers) ? opts.headers : {}
  if (util.isString(auth.token)) {
    headers['Authorization'] = auth.token
  }
  if (!util.isDefined(headers['Accept'])) {
    headers['Accept'] = 'application/json'
  }
  if (!util.isDefined(headers['Content-Type'])) {
    headers['Content-Type'] = 'application/json'
  }
  opts.headers = headers
  opts.timeout = util.isNumber(opts.timeout) && opts.timeout > 0 ? opts.timeout : APP.timeout
  opts.timeout = opts.timeout * 1000
  if (util.isFunction(opts.onStart)) {
    opts.onStart(opts)
  }
  let res = await axios(opts)
  return res
}

const request = (options) => {
  let opts = util.isObject(options) ? options : {}
  build(opts)
    .then(function (response) {
      util.log('<<api-request-success>>', response)
      if (util.isFunction(opts.onFinish)) {
        opts.onFinish()
      }
      if (200 === response.status) {
        let result = response.data
        if (0 === result.status) {
          if (util.isFunction(opts.onSuccess)) {
            opts.onSuccess(result.data, result.info)
          }
        } else {
          processError(util.isArray(result.error) ? result.error : [], opts.onError, opts.notify)
        }
      } else {
        processError({ response: response }, opts.onError, opts.notify)
      }
    })
    .catch(function (error) {
      util.log('<<api-request-error>>', error)
      if (util.isFunction(opts.onFinish)) {
        opts.onFinish()
      }
      if (!util.isObject(error.response)) {
        Router.push({ path: '/blank' })
      }
      processError(error, opts.onError, opts.notify)
    })
}

const api = {
  multimedia: (link) => {
    link = link || ''
    if (
      !link.startsWith('http://') &&
      !link.startsWith('https://') &&
      !link.startsWith('file://')
    ) {
      let multimediaUrl = storage.config().multimediaUrl || ''
      return multimediaUrl + link
    }
    return link
  },
  call: (options) => {
    request(options)
  },
  send: (options) => {
    // tidak ada pengecekan format respon
    // bisa berguna untuk download
    let opts = util.isObject(options) ? options : {}
    build(opts)
      .then((response) => {
        util.log('<<api-send-success>>', response)
        if (util.isFunction(opts.onFinish)) {
          opts.onFinish()
        }
        if (util.isFunction(opts.onSuccess)) {
          opts.onSuccess(response)
        }
      })
      .catch((error) => {
        util.log('<<api-send-error>>', error)
        if (util.isFunction(opts.onFinish)) {
          opts.onFinish()
        }
        if (!util.isObject(error.response)) {
          Router.push({ path: '/blank' })
        }
        if (error.code && error.message && false !== opts.notify) {
          if (!(error.response && 401 === error.response.status)) {
            uix.notify(error.message + ' (' + error.code + ')')
          }
        }
        if (util.isFunction(opts.onError)) {
          opts.onError(error)
        }
      })
  },
}
export { api }
