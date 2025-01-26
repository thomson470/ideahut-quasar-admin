const sha = {
  /*
   * SHA1
   */
  sha1: function (msg) {
    function rotate_left(n, s) {
      return (n << s) | (n >>> (32 - s))
    }
    function cvt_hex(val) {
      let str = '',
        i,
        v
      for (i = 7; i >= 0; i--) {
        v = (val >>> (i * 4)) & 0x0f
        str += v.toString(16)
      }
      return str
    }
    function Utf8Encode(string) {
      string = string.replace(/\r\n/g, '\n')
      let utftext = ''
      for (let n = 0; n < string.length; n++) {
        let c = string.charCodeAt(n)
        if (c < 128) {
          utftext += String.fromCharCode(c)
        } else if (c > 127 && c < 2048) {
          utftext += String.fromCharCode((c >> 6) | 192)
          utftext += String.fromCharCode((c & 63) | 128)
        } else {
          utftext += String.fromCharCode((c >> 12) | 224)
          utftext += String.fromCharCode(((c >> 6) & 63) | 128)
          utftext += String.fromCharCode((c & 63) | 128)
        }
      }
      return utftext
    }
    let blockstart
    let i, j
    let W = new Array(80)
    let H0 = 0x67452301
    let H1 = 0xefcdab89
    let H2 = 0x98badcfe
    let H3 = 0x10325476
    let H4 = 0xc3d2e1f0
    let A, B, C, D, E
    let temp
    msg = Utf8Encode(msg)
    let msg_len = msg.length
    let word_array = new Array()
    for (i = 0; i < msg_len - 3; i += 4) {
      j =
        (msg.charCodeAt(i) << 24) |
        (msg.charCodeAt(i + 1) << 16) |
        (msg.charCodeAt(i + 2) << 8) |
        msg.charCodeAt(i + 3)
      word_array.push(j)
    }
    switch (msg_len % 4) {
      case 0:
        i = 0x080000000
        break
      case 1:
        i = (msg.charCodeAt(msg_len - 1) << 24) | 0x0800000
        break
      case 2:
        i = (msg.charCodeAt(msg_len - 2) << 24) | (msg.charCodeAt(msg_len - 1) << 16) | 0x08000
        break
      case 3:
        i =
          (msg.charCodeAt(msg_len - 3) << 24) |
          (msg.charCodeAt(msg_len - 2) << 16) |
          (msg.charCodeAt(msg_len - 1) << 8) |
          0x80
        break
    }
    word_array.push(i)
    while (word_array.length % 16 != 14) word_array.push(0)
    word_array.push(msg_len >>> 29)
    word_array.push((msg_len << 3) & 0x0ffffffff)
    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {
      for (i = 0; i < 16; i++) W[i] = word_array[blockstart + i]
      for (i = 16; i <= 79; i++) W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1)
      A = H0
      B = H1
      C = H2
      D = H3
      E = H4
      for (i = 0; i <= 19; i++) {
        temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5a827999) & 0x0ffffffff
        E = D
        D = C
        C = rotate_left(B, 30)
        B = A
        A = temp
      }
      for (i = 20; i <= 39; i++) {
        temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ed9eba1) & 0x0ffffffff
        E = D
        D = C
        C = rotate_left(B, 30)
        B = A
        A = temp
      }
      for (i = 40; i <= 59; i++) {
        temp =
          (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8f1bbcdc) & 0x0ffffffff
        E = D
        D = C
        C = rotate_left(B, 30)
        B = A
        A = temp
      }
      for (i = 60; i <= 79; i++) {
        temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xca62c1d6) & 0x0ffffffff
        E = D
        D = C
        C = rotate_left(B, 30)
        B = A
        A = temp
      }
      H0 = (H0 + A) & 0x0ffffffff
      H1 = (H1 + B) & 0x0ffffffff
      H2 = (H2 + C) & 0x0ffffffff
      H3 = (H3 + D) & 0x0ffffffff
      H4 = (H4 + E) & 0x0ffffffff
    }
    temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4)
    return temp.toLowerCase()
  },

  /*
   * SHA256
   */
  sha256: function (ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount))
    }
    let mathPow = Math.pow
    let maxWord = mathPow(2, 32)
    let lengthProperty = 'length'
    let i, j
    let result = ''
    let words = []
    let asciiBitLength = ascii[lengthProperty] * 8
    let hash = (sha.sha256.h = sha.sha256.h || [])
    let k = (sha.sha256.k = sha.sha256.k || [])
    let primeCounter = k[lengthProperty]
    let isComposite = {}
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0
      }
    }
    ascii += '\x80'
    while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00'
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i)
      if (j >> 8) return
      words[i >> 2] |= j << (((3 - i) % 4) * 8)
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0
    words[words[lengthProperty]] = asciiBitLength
    for (j = 0; j < words[lengthProperty]; ) {
      let w = words.slice(j, (j += 16))
      let oldHash = hash
      hash = hash.slice(0, 8)
      for (i = 0; i < 64; i++) {
        let w15 = w[i - 15],
          w2 = w[i - 2]
        let a = hash[0],
          e = hash[4]
        let temp1 =
          hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                  w[i - 7] +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
                0)
        let temp2 =
          (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]))
        hash = [(temp1 + temp2) | 0].concat(hash)
        hash[4] = (hash[4] + temp1) | 0
      }
      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        let b = (hash[i] >> (j * 8)) & 255
        result += (b < 16 ? 0 : '') + b.toString(16)
      }
    }
    return result
  },
}
export { sha }
