import { util } from 'src/scripts/util'

class cache {
  constructor(kwargs) {
    let s = this
    let p = util.isObject(kwargs) ? kwargs : {}
    let c = []
    // expiry dalam detik
    let expiry = util.isNumber(p.expiry) && p.expiry > 0 ? p.expiry * 1000 : 0
    let limit = util.isNumber(p.limit) && p.limit > 0 ? p.limit : 0
    let replace = util.isBoolean(p.replace) ? p.replace : false
    s.expiry = (v) => {
      if (util.isNumber(v) && v > 0) {
        expiry = v * 1000
      } else {
        return expiry
      }
    }
    s.limit = (v) => {
      if (util.isNumber(v) && v > 0) {
        limit = v
      } else {
        return limit
      }
    }
    s.replace = (v) => {
      if (util.isBoolean(v)) {
        replace = v
      } else {
        return replace
      }
    }
    s.get = (key) => {
      let i = c.findIndex((x) => x.key === key)
      let v = null
      if (i !== -1) {
        let o = replace ? c[i] : JSON.parse(JSON.stringify(c[i]))
        if (expiry !== 0) {
          let now = new Date().getTime()
          if (now < o.expiry) {
            v = o.value
          } else {
            c.splice(i)
          }
        } else {
          v = o.value
        }
      }
      return v
    }
    s.put = (key, value) => {
      let i = c.findIndex((x) => x.key === key)
      if (i !== -1) {
        c.splice(i, 1)
      }
      let obj = {
        key: key,
        value: value,
      }
      if (expiry !== 0) {
        let now = new Date().getTime()
        obj.expiry = now + expiry
      }
      c.push(obj)
      if (limit !== 0) {
        let diff = c.length - limit
        if (diff > 0) {
          c.splice(0, diff)
        }
      }
    }
    s.del = (key) => {
      let i = c.findIndex((x) => x.key === key)
      if (i !== -1) {
        c.splice(i, 1)
      }
    }
    s.clear = () => {
      c = []
    }
  }
}
export { cache }
