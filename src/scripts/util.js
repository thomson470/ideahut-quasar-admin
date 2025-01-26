import moment from 'moment'
import { APP } from 'src/scripts/static'

const DATE = {
  LZ: function (x) {
    return (x < 0 || x > 9 ? '' : '0') + x
  },
  MONTHS: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ],
  DAYS: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
  ],
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const NUMBER_THRESHOLD = [
  { suffix: 'T', threshold: 1e12 },
  { suffix: 'B', threshold: 1e9 },
  { suffix: 'M', threshold: 1e6 },
  { suffix: 'K', threshold: 1e3 },
  { suffix: '', threshold: 1 },
]

const util = {
  /*
   * WEB PATH
   */
  webPath: function () {
    return APP.web
  },

  /*
   * LOG
   */
  log: function (...args) {
    if (true === APP.debug) {
      console.log(...args)
    }
  },

  /*
   * ASSERT
   */
  assert(condition, message) {
    if (false === condition) {
      throw new Error(message)
    }
  },

  /*
   * APPLY
   */
  apply(fx, ...args) {
    if (util.isFunction(fx)) {
      return fx(...args)
    }
  },

  /*
   * CALL IF
   */
  callIf(isTrue, fxTrue, fxFalse) {
    if (true === isTrue) {
      if (util.isFunction(fxTrue)) {
        return fxTrue()
      }
    } else if (util.isFunction(fxFalse)) {
      return fxFalse()
    }
    return null
  },

  /*
   * RUN IF
   */
  runIf(isTrue, fxTrue, fxFalse) {
    if (true === isTrue) {
      if (util.isFunction(fxTrue)) {
        fxTrue()
      }
    } else if (util.isFunction(fxFalse)) {
      fxFalse()
    }
  },

  /*
   * COPY
   */
  copy: function (value) {
    return JSON.parse(JSON.stringify(value))
  },

  /*
   * FORMAT
   */
  format: {
    /* MONEY */
    money: function (number, thousand, decimal, places, symbol) {
      places = !isNaN((places = Math.abs(places))) ? places : 2
      symbol = symbol !== undefined ? symbol : ''
      thousand = thousand || '.'
      decimal = decimal || ','
      let negative = number < 0 ? '-' : '',
        i = parseInt((number = Math.abs(+number || 0).toFixed(places)), 10) + '',
        j = (j = i.length) > 3 ? j % 3 : 0
      return (
        symbol +
        negative +
        (j ? i.substr(0, j) + thousand : '') +
        i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) +
        (places
          ? decimal +
            Math.abs(number - i)
              .toFixed(places)
              .slice(2)
          : '')
      )
    },
    /* DATE */
    date: function (value, options) {
      options = util.isObject(options) ? options : {}
      let date
      if (util.isObject(value) && util.isFunction(value.getSeconds)) {
        date = value
      } else if (util.isNumber(value)) {
        let m = parseInt(value)
        if (isNaN(m)) {
          return ''
        }
        if (m < 10000000000) {
          m *= 1000
        }
        date = new Date()
        date.setTime(m)
      } else if (util.isString(value)) {
        date = Date.parse(value)
        if (isNaN(date)) {
          return ''
        }
      } else {
        return ''
      }
      let MONTHS = DATE.MONTHS
      if (util.isArray(options.months) && options.months.length === 24) {
        MONTHS = options.months
      }
      let DAYS = DATE.DAYS
      if (util.isArray(options.days) && options.days.length === 14) {
        DAYS = options.days
      }
      let f = options.format || 'EE, dd MMM yyyy  HH:mm:ss',
        dt = date,
        res = '',
        i_f = 0,
        c = '',
        token = ''
      let y = dt.getYear() + '',
        M = dt.getMonth() + 1,
        d = dt.getDate(),
        E = dt.getDay(),
        H = dt.getHours(),
        m = dt.getMinutes(),
        s = dt.getSeconds()
      let v = new Object()
      if (y.length < 4) {
        y = '' + (y - 0 + 1900)
      }
      v['y'] = '' + y
      v['yyyy'] = y
      v['YYYY'] = y
      v['yy'] = y.substring(2, 4)
      v['YY'] = y.substring(2, 4)
      v['M'] = M
      v['MM'] = DATE.LZ(M)
      v['MMMM'] = MONTHS[M - 1]
      v['MMM'] = MONTHS[M + 11]
      v['d'] = d
      v['D'] = d
      v['dd'] = DATE.LZ(d)
      v['DD'] = DATE.LZ(d)
      v['E'] = DAYS[E + 7]
      v['EE'] = DAYS[E]
      v['H'] = H
      v['HH'] = DATE.LZ(H)
      if (H == 0) {
        v['h'] = 12
      } else if (H > 12) {
        v['h'] = H - 12
      } else {
        v['h'] = H
      }
      v['hh'] = DATE.LZ(v['h'])
      if (H > 11) {
        v['K'] = H - 12
      } else {
        v['K'] = H
      }
      v['k'] = H + 1
      v['KK'] = DATE.LZ(v['K'])
      v['kk'] = DATE.LZ(v['k'])
      if (H > 11) {
        v['a'] = 'PM'
      } else {
        v['a'] = 'AM'
      }
      v['m'] = m
      v['mm'] = DATE.LZ(m)
      v['s'] = s
      v['ss'] = DATE.LZ(s)
      while (i_f < f.length) {
        c = f.charAt(i_f)
        token = ''
        while (f.charAt(i_f) == c && i_f < f.length) {
          token += f.charAt(i_f++)
        }
        if (v[token] != null) {
          res = res + v[token]
        } else {
          res = res + token
        }
      }
      return res
    },
    number: function (value, precision = 2) {
      const found = NUMBER_THRESHOLD.find((x) => Math.abs(value) >= x.threshold)
      if (found) {
        const formatted =
          (value / found.threshold).toFixed(1 === found.threshold ? 0 : precision) + found.suffix
        return formatted
      } else {
        return value
      }
    },
  },

  /*
   * PARSE
   */
  parse: {
    date: function (value, options) {
      options = util.isObject(options) ? options : {}
      let date
      if (util.isObject(value) && util.isFunction(value.getSeconds)) {
        date = value
      } else if (util.isNumber(value)) {
        let m = parseInt(value)
        if (isNaN(m)) {
          return ''
        }
        if (m < 10000000000) {
          m *= 1000
        }
        date = new Date()
        date.setTime(m)
      } else if (util.isString(value)) {
        let format = options.format || 'YYYY-MM-DD HH:mm:ss'
        date = moment(value, format).toDate()
      }
      return date
    },
    epoch: function (value, options) {
      let date = util.parse.date(value, options)
      return date ? date.getTime() : null
    },
  },

  /*
   * TYPE VALIDATION
   */
  isFunction(o) {
    return typeof o === 'function'
  },
  isObject(o) {
    return Object.prototype.toString.apply(o) === '[object Object]'
  },
  isDefined(o) {
    return typeof o !== 'undefined'
  },
  isBoolean(o) {
    return typeof o === 'boolean'
  },
  isString(o) {
    return typeof o === 'string'
  },
  isNumber(o) {
    return typeof o === 'number'
  },
  isInteger(o) {
    return Number.isInteger(o)
  },
  isArray(o) {
    return Object.prototype.toString.apply(o) === '[object Array]'
  },
  isEmail(o) {
    return util.isString(o) ? o.match(EMAIL_REGEX) : false
  },

  /*
   * UUID
   */
  uuid: function () {
    let dt = new Date().getTime()
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (dt + Math.random() * 16) % 16 | 0
      dt = Math.floor(dt / 16)
      return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
    return uuid
  },

  /*
   * CONVERTER
   */
  stringToBuffer: function (string) {
    if (/[\u0080-\uffff]/.test(string)) {
      throw new Error('invalid string')
    }
    let array = new Uint8Array(string.length)
    for (let i = string.length; i--; ) {
      array[i] = string.charCodeAt(i)
    }
    return array.buffer
  },
  objectToBuffer: function (object) {
    return util.stringToBuffer(JSON.stringify(object))
  },
  bufferToString: function (buffer) {
    let array = new Uint8Array(buffer)
    let string = String.fromCharCode(array)
    if (/[\u0080-\uffff]/.test(string)) {
      throw new Error('invalid buffer')
    }
    return string
  },
  bufferToObject: function (buffer) {
    return JSON.parse(util.bufferToString(buffer))
  },
  blobToBase64: function (blob) {
    return new Promise((resolve) => {
      let reader = new FileReader()
      reader.onload = function () {
        let dataUrl = reader.result
        resolve(dataUrl)
      }
      reader.readAsDataURL(blob)
    })
  },

  /*
   * IMAGE
   */
  image: {
    blob: function (url) {
      return new Promise((resolve) => {
        let response = fetch(url)
        let blob = response.blob()
        resolve(blob)
      })
    },
    base64: async function (url) {
      let blob = await util.image.blob(url)
      let base64 = await util.blobToBase64(blob)
      return base64
    },
  },

  /*
   * GET FIELD VALUE
   */
  getFieldValue: function (field, row) {
    field = field || ''
    let ffs = field.split('.')
    let val = row[ffs[0]]
    if (util.isObject(val)) {
      for (let i = 1; i < ffs.length; i++) {
        val = val[ffs[i]]
        if (!util.isDefined(val)) {
          return undefined
        } else if (util.isObject(val)) {
          continue
        }
      }
    }
    return val
  },
}
export { util }
