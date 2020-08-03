!(function(name, context, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports = definition();
  else if (typeof define == 'function' && define.amd) define(definition);
  else context[name] = definition();
})('emasMtopee', this, function() {
  var mtopee;
  var win = window;
  var Promise = win.Promise;

  if (!Promise) {
    var error = '当前浏览器不支持Promise，请在windows对象上挂载Promise对象';
    mtopee = {
      ERROR: error
    };
    throw new Error(error);
    return mtopee;
  }

  var ready = Promise.resolve();

  // utitlites
  function defer() {
    var deferred = {};
    var promise = new Promise(function(resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });
    deferred.promise = promise;
    return deferred;
  }

  function defaults(params, defaultParams) {
    for (var key in defaultParams) {
      if (params[key] === undefined) {
        params[key] = defaultParams[key];
      }
    }
    return params;
  }

  function md5(string) {
    function rotateLeft(lValue, iShiftBits) {
      return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
    }

    function addUnsigned(lX, lY) {
      var lX4, lY4, lX8, lY8, lResult;
      lX8 = lX & 0x80000000;
      lY8 = lY & 0x80000000;
      lX4 = lX & 0x40000000;
      lY4 = lY & 0x40000000;
      lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
      if (lX4 & lY4) {
        return lResult ^ 0x80000000 ^ lX8 ^ lY8;
      }
      if (lX4 | lY4) {
        if (lResult & 0x40000000) {
          return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
        } else {
          return lResult ^ 0x40000000 ^ lX8 ^ lY8;
        }
      } else {
        return lResult ^ lX8 ^ lY8;
      }
    }

    function f(x, y, z) {
      return (x & y) | (~x & z);
    }

    function g(x, y, z) {
      return (x & z) | (y & ~z);
    }

    function h(x, y, z) {
      return x ^ y ^ z;
    }

    function i(x, y, z) {
      return y ^ (x | ~z);
    }

    function FF(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function II(a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(string) {
      var lWordCount;
      var lMessageLength = string.length;
      var lNumberOfWords_temp1 = lMessageLength + 8;
      var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
      var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
      var lWordArray = new Array(lNumberOfWords - 1);
      var lBytePosition = 0;
      var lByteCount = 0;
      while (lByteCount < lMessageLength) {
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] =
          lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition);
        lByteCount++;
      }
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
      lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
      lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
      return lWordArray;
    }

    function wordToHex(lValue) {
      var WordToHexValue = '',
        WordToHexValue_temp = '',
        lByte,
        lCount;
      for (lCount = 0; lCount <= 3; lCount++) {
        lByte = (lValue >>> (lCount * 8)) & 255;
        WordToHexValue_temp = '0' + lByte.toString(16);
        WordToHexValue =
          WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
      }
      return WordToHexValue;
    }

    function utf8Encode(string) {
      string = string.replace(/\r\n/g, '\n');
      var utftext = '';

      for (var n = 0; n < string.length; n++) {
        var c = string.charCodeAt(n);

        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if (c > 127 && c < 2048) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }

      return utftext;
    }

    var x = [],
      k,
      AA,
      BB,
      CC,
      DD,
      a,
      b,
      c,
      d,
      S11 = 7,
      S12 = 12,
      S13 = 17,
      S14 = 22,
      S21 = 5,
      S22 = 9,
      S23 = 14,
      S24 = 20,
      S31 = 4,
      S32 = 11,
      S33 = 16,
      S34 = 23,
      S41 = 6,
      S42 = 10,
      S43 = 15,
      S44 = 21;

    string = utf8Encode(string);

    x = convertToWordArray(string);

    a = 0x67452301;
    b = 0xefcdab89;
    c = 0x98badcfe;
    d = 0x10325476;

    for (k = 0; k < x.length; k += 16) {
      AA = a;
      BB = b;
      CC = c;
      DD = d;
      a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
      d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
      c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
      b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
      a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
      d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
      c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
      b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
      a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
      d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
      c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
      b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
      a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
      d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
      c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
      b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);
      a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
      d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
      c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
      b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
      a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
      d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
      c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
      b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
      a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
      d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
      c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
      b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
      a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
      d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
      c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
      b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
      a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
      d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
      c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
      b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
      a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
      d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
      c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
      b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
      a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
      d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
      c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
      b = HH(b, c, d, a, x[k + 6], S34, 0x4881d05);
      a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
      d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
      c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
      b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
      a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
      d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
      c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
      b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
      a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
      d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
      c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
      b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
      a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
      d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
      c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
      b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
      a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
      d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
      c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
      b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);
      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }

    var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);

    return temp.toLowerCase();
  }

  /*
  CryptoJS v3.1.2
  code.google.com/p/crypto-js
  (c) 2009-2013 by Jeff Mott. All rights reserved.
  code.google.com/p/crypto-js/wiki/License
  */
  var CryptoJS=CryptoJS||function(h,s){var f={},g=f.lib={},q=function(){},m=g.Base={extend:function(a){q.prototype=this;var c=new q;a&&c.mixIn(a);c.hasOwnProperty("init")||(c.init=function(){c.$super.init.apply(this,arguments)});c.init.prototype=c;c.$super=this;return c},create:function(){var a=this.extend();a.init.apply(a,arguments);return a},init:function(){},mixIn:function(a){for(var c in a)a.hasOwnProperty(c)&&(this[c]=a[c]);a.hasOwnProperty("toString")&&(this.toString=a.toString)},clone:function(){return this.init.prototype.extend(this)}},
  r=g.WordArray=m.extend({init:function(a,c){a=this.words=a||[];this.sigBytes=c!=s?c:4*a.length},toString:function(a){return(a||k).stringify(this)},concat:function(a){var c=this.words,d=a.words,b=this.sigBytes;a=a.sigBytes;this.clamp();if(b%4)for(var e=0;e<a;e++)c[b+e>>>2]|=(d[e>>>2]>>>24-8*(e%4)&255)<<24-8*((b+e)%4);else if(65535<d.length)for(e=0;e<a;e+=4)c[b+e>>>2]=d[e>>>2];else c.push.apply(c,d);this.sigBytes+=a;return this},clamp:function(){var a=this.words,c=this.sigBytes;a[c>>>2]&=4294967295<<
  32-8*(c%4);a.length=h.ceil(c/4)},clone:function(){var a=m.clone.call(this);a.words=this.words.slice(0);return a},random:function(a){for(var c=[],d=0;d<a;d+=4)c.push(4294967296*h.random()|0);return new r.init(c,a)}}),l=f.enc={},k=l.Hex={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++){var e=c[b>>>2]>>>24-8*(b%4)&255;d.push((e>>>4).toString(16));d.push((e&15).toString(16))}return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b+=2)d[b>>>3]|=parseInt(a.substr(b,
  2),16)<<24-4*(b%8);return new r.init(d,c/2)}},n=l.Latin1={stringify:function(a){var c=a.words;a=a.sigBytes;for(var d=[],b=0;b<a;b++)d.push(String.fromCharCode(c[b>>>2]>>>24-8*(b%4)&255));return d.join("")},parse:function(a){for(var c=a.length,d=[],b=0;b<c;b++)d[b>>>2]|=(a.charCodeAt(b)&255)<<24-8*(b%4);return new r.init(d,c)}},j=l.Utf8={stringify:function(a){try{return decodeURIComponent(escape(n.stringify(a)))}catch(c){throw Error("Malformed UTF-8 data");}},parse:function(a){return n.parse(unescape(encodeURIComponent(a)))}},
  u=g.BufferedBlockAlgorithm=m.extend({reset:function(){this._data=new r.init;this._nDataBytes=0},_append:function(a){"string"==typeof a&&(a=j.parse(a));this._data.concat(a);this._nDataBytes+=a.sigBytes},_process:function(a){var c=this._data,d=c.words,b=c.sigBytes,e=this.blockSize,f=b/(4*e),f=a?h.ceil(f):h.max((f|0)-this._minBufferSize,0);a=f*e;b=h.min(4*a,b);if(a){for(var g=0;g<a;g+=e)this._doProcessBlock(d,g);g=d.splice(0,a);c.sigBytes-=b}return new r.init(g,b)},clone:function(){var a=m.clone.call(this);
  a._data=this._data.clone();return a},_minBufferSize:0});g.Hasher=u.extend({cfg:m.extend(),init:function(a){this.cfg=this.cfg.extend(a);this.reset()},reset:function(){u.reset.call(this);this._doReset()},update:function(a){this._append(a);this._process();return this},finalize:function(a){a&&this._append(a);return this._doFinalize()},blockSize:16,_createHelper:function(a){return function(c,d){return(new a.init(d)).finalize(c)}},_createHmacHelper:function(a){return function(c,d){return(new t.HMAC.init(a,
  d)).finalize(c)}}});var t=f.algo={};return f}(Math);
  (function(h){for(var s=CryptoJS,f=s.lib,g=f.WordArray,q=f.Hasher,f=s.algo,m=[],r=[],l=function(a){return 4294967296*(a-(a|0))|0},k=2,n=0;64>n;){var j;a:{j=k;for(var u=h.sqrt(j),t=2;t<=u;t++)if(!(j%t)){j=!1;break a}j=!0}j&&(8>n&&(m[n]=l(h.pow(k,0.5))),r[n]=l(h.pow(k,1/3)),n++);k++}var a=[],f=f.SHA256=q.extend({_doReset:function(){this._hash=new g.init(m.slice(0))},_doProcessBlock:function(c,d){for(var b=this._hash.words,e=b[0],f=b[1],g=b[2],j=b[3],h=b[4],m=b[5],n=b[6],q=b[7],p=0;64>p;p++){if(16>p)a[p]=
  c[d+p]|0;else{var k=a[p-15],l=a[p-2];a[p]=((k<<25|k>>>7)^(k<<14|k>>>18)^k>>>3)+a[p-7]+((l<<15|l>>>17)^(l<<13|l>>>19)^l>>>10)+a[p-16]}k=q+((h<<26|h>>>6)^(h<<21|h>>>11)^(h<<7|h>>>25))+(h&m^~h&n)+r[p]+a[p];l=((e<<30|e>>>2)^(e<<19|e>>>13)^(e<<10|e>>>22))+(e&f^e&g^f&g);q=n;n=m;m=h;h=j+k|0;j=g;g=f;f=e;e=k+l|0}b[0]=b[0]+e|0;b[1]=b[1]+f|0;b[2]=b[2]+g|0;b[3]=b[3]+j|0;b[4]=b[4]+h|0;b[5]=b[5]+m|0;b[6]=b[6]+n|0;b[7]=b[7]+q|0},_doFinalize:function(){var a=this._data,d=a.words,b=8*this._nDataBytes,e=8*a.sigBytes;
  d[e>>>5]|=128<<24-e%32;d[(e+64>>>9<<4)+14]=h.floor(b/4294967296);d[(e+64>>>9<<4)+15]=b;a.sigBytes=4*d.length;this._process();return this._hash},clone:function(){var a=q.clone.call(this);a._hash=this._hash.clone();return a}});s.SHA256=q._createHelper(f);s.HmacSHA256=q._createHmacHelper(f)})(Math);
  (function(){var h=CryptoJS,s=h.enc.Utf8;h.algo.HMAC=h.lib.Base.extend({init:function(f,g){f=this._hasher=new f.init;"string"==typeof g&&(g=s.parse(g));var h=f.blockSize,m=4*h;g.sigBytes>m&&(g=f.finalize(g));g.clamp();for(var r=this._oKey=g.clone(),l=this._iKey=g.clone(),k=r.words,n=l.words,j=0;j<h;j++)k[j]^=1549556828,n[j]^=909522486;r.sigBytes=l.sigBytes=m;this.reset()},reset:function(){var f=this._hasher;f.reset();f.update(this._iKey)},update:function(f){this._hasher.update(f);return this},finalize:function(f){var g=
  this._hasher;f=g.finalize(f);g.reset();return g.finalize(this._oKey.clone().concat(f))}})})();

  /**
   * @namespace mtopee
   */

  /**
   * @member config
   * @property {String} mtopDomain mtop请求地址，例如：api.m.taobao.com
   */
  var globalConfig = {};
  var middlewares = [];

  var ERROR_TYPE = {
    NETWORK_ERROR: 'NetworkError',
    GATEWAY_ERROR: 'GatewayError',
    CUSTOM_ERROR: 'CustomError',
  };

  var ERROR_CODE = {
    TIMEOUT: 'timeout',
    ANALYSE_ERROR: 'analyseError',
    REQUEST_ERROR: 'requestError'
  };

  var DEFAULT_SUCCESS_RETCODE = 'SUCCESS';
  var GATEWAY_ERROR_PREFIX = 'FAIL_SYS_';

  /**
   * @typedef {Object} requestParams
   * @property {String} appKey - 应用appKey
   * @property {String} api - 请求api的名称
   * @property {String} v - 请求api的版本
   * @property {String} endpoint - 网关地址
   * @property {Object} [headers] - 请求头
   * @property {Object} [bizParams] - 请求api的参数
   * @property {Object} [body] - 请求api的数据
   * @property {String} [method=GET] - 请求方法，GET/POST
   * @property {String} [timeout=20000] - 请求的超时时间
   */
  /**
   * Mtop类
   * @param {requestParams} params 请求参数
   */
  var mtopInc = 0;

  /**
   * 每发送一个网关请求，都会创建一个Mtop对象
   * @param {*} params 
   */
  function Mtop(params) {
    this.id = ++mtopInc;

    this.params = defaults(params || {}, {
      api: '',
      v: '*',
      appKey: '',
      method: 'get',
      headers: {},
      bizParams: {},
      body: null,
      timeout: 20000  // 默认超时时间是20秒
    });

    this.params.method = this.params.method.toLowerCase();

    this.middlewares = middlewares.slice(0);
  }

  Mtop.prototype.use = function(middleware) {
    if (!middleware) {
      throw new Error('middleware is undefined');
    }
    this.middlewares.push(middleware);
    return this;
  };

  Mtop.prototype.__processParams = function(next) {
    var params = this.params;
    var method = params.method;
    var bizParams = params.bizParams;
    var body = params.body;
    var headers = params.headers;

    // bizParams
    if (bizParams && typeof bizParams === 'string') {
      bizParams = JSON.parse(bizParams);
      params.bizParams = bizParams;
    }

    // body
    if (method === 'post') {
      if (body) {
        params.postBody = body;
        if (typeof body === 'object') {
          params.postBody = JSON.stringify(body);
        }
      } else if (bizParams) {
        if (typeof bizParams === 'object') {
          var queryArr = [];
          var queryString;
          Object.keys(bizParams).forEach(function(key) {
            queryArr.push(encodeURIComponent(key) + '=' + encodeURIComponent(bizParams[key]));
          });
          if (queryArr.length > 0) {
            queryString = queryArr.join('&');
          }
          params.postBody = queryString;
        }
      }
    }

    // headers
    if (headers && typeof headers === 'string') {
      headers = JSON.parse(headers);
      params.headers = headers;
    }

    next();
  }

  Mtop.prototype.__processRequestUrl = function(next) {
    var params = this.params;
    var options = this.options;

    var api = params.api;
    var v = params.v;
    var path = '//' + (params.endpoint || options.mtopDomain) + '/h5/' + api + '/' + v;

    var bizParams = params.bizParams;
    var queryString;

    // GET请求 || POST透传请求
    if (params.method === 'get' || (params.method === 'post' && params.body)) {
      var queryArr = [];
      Object.keys(bizParams).forEach(function(key) {
        queryArr.push(encodeURIComponent(key) + '=' + encodeURIComponent(bizParams[key]));
      });
      if (queryArr.length > 0) {
        queryString = queryArr.join('&');
      }

      if (queryString && queryString.length > 0) {
        path = path + '?' + queryString;
      }
    }
    options.path = path;
    next();
  }

  Mtop.prototype._processHeaders = function(next) {
    var params = this.params;
    var options = this.options;
    var gwHeaders = {};
    var appKey = params.appKey;
    var timestamp = Math.round(Date.now() / 1000);

    gwHeaders['x-emas-gw-appkey'] = appKey;
    gwHeaders['x-emas-gw-pv'] = '6.1';
    gwHeaders['x-emas-gw-t'] = timestamp;

    options.headers = gwHeaders;
    
    var hmacSHA256 = CryptoJS.HmacSHA256;
    var Hex = CryptoJS.enc.Hex;
    var bizParams = this.params.bizParams;

    var api = params.api;
    var v = params.v;
    var bizParams = this.params.bizParams;
    var postBody = this.params.postBody;
    var method = this.params.method;
    var body = this.params.body;

    var arr = [];
    Object.keys(bizParams).forEach(function(key) {
      arr.push(key + "=" + bizParams[key]);
    });
    arr.sort();
    var kvStr = arr.join('&');

    // 注意：GET请求无需处理postBody
    if (method === 'post' && body && postBody && postBody.length > 0) {
      kvStr = postBody + '&' + kvStr;
    }

    var md5Sum = '';
    if (kvStr.length > 0) {
      md5Sum = md5(kvStr);
    }
    var baseStr = '&&&' + appKey + '&' + md5Sum + '&' + timestamp + '&' + api + '&' + v + '&&&&&';
    var sign = Hex.stringify(hmacSHA256(baseStr, "emasgatewayh5"));
    gwHeaders['x-emas-gw-sign'] = sign;

    Object.keys(gwHeaders).forEach(function(key){
      if(key.indexOf('-emas-gw-') > 0) {
        gwHeaders[key] = encodeURIComponent(gwHeaders[key])
      }
    })
    next();
  }

  Mtop.prototype.__sendRequest = function(throwError) {
    var deferred = defer();
    var params = this.params;
    var options = this.options;

    var xhr = new win.XMLHttpRequest();

    function cleanup(type) {
      if (timeoutid) {
        clearTimeout(timeoutid);
      }
      if (type === 'TIMEOUT') {
        xhr.abort();
      }
    }

    function makeSuccResponse(status, headers, data) {
      options.response = {
        success: true,
        status: status,
        headers: headers,
        data: data
      };
      deferred.resolve();
    }

    function makeErrResponse(status, headers, errType, errCode, errMsg) {
      options.response = {
        success: false,
        status: status,
        headers: headers,
        error: {
          errType: errType,
          errCode: errCode,
          errMsg: decodeURIComponent(errMsg)
        }
      }
      deferred.resolve();
    }

    var timeout = params.timeout;
    var timeoutid = setTimeout(function() {
      makeErrResponse(null, ERROR_TYPE.NETWORK_ERROR, ERROR_CODE.TIMEOUT, 'request timeout');
      cleanup('TIMEOUT');
    }, timeout);

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var status = xhr.status;
        var result;
        var headers;
        if ((status >= 200 && status < 300) || status == 304) {
          cleanup();
          result = xhr.responseText;
          headers = xhr.getAllResponseHeaders() || '';

          if (result && typeof result === 'string') {
            result = JSON.parse(result);
          }

          try {
            var arr = headers.trim().split(/[\r\n]+/);
            var headerMap = {};
            arr.forEach(function(line) {
              var parts = line.split(': ');
              var header = parts.shift().toLocaleLowerCase();
              var value = parts.join(': ');
              headerMap[header] = value;
            });
            var retCode = headerMap['x-emas-gw-retcode'];
            var retMsg = headerMap['x-emas-gw-retmsg'];

            if (retCode === DEFAULT_SUCCESS_RETCODE) {
              makeSuccResponse(status, headerMap, result);
            } else {
              var errType;
              if (retCode.indexOf(GATEWAY_ERROR_PREFIX) >= 0) {
                errType = ERROR_TYPE.GATEWAY_ERROR;
              } else {
                errType = ERROR_TYPE.CUSTOM_ERROR;
              }
              makeErrResponse(status, headers, errType, retCode, retMsg);
            }

            deferred.resolve();
          } catch (e) {
            makeErrResponse(status, null, ERROR_TYPE.NETWORK_ERROR, ERROR_CODE.ANALYSE_ERROR, 'analyse response error');
          }
        } else {  
          cleanup('ABORT');
          // 网络请求超时时，会先走到这里，通过setTimeout调用保持时序
          setTimeout(function() {
            makeErrResponse(status, null, ERROR_TYPE.NETWORK_ERROR, ERROR_CODE.REQUEST_ERROR, 'request error'); 
          });
        }
      }
    };

    var curl = options.path;
    var method = params.method;

    xhr.open(method, curl, true);
    xhr.withCredentials = true;
    xhr.setRequestHeader('Accept', 'application/json');
    if (method === 'post' && params.body) {
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    } else {
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }

    if (params.headers) {
      for (var key in params.headers) {
        xhr.setRequestHeader(key, params.headers[key]);
      }
    }

    if (options.headers) {
      for (var key in options.headers) {
        xhr.setRequestHeader(key, options.headers[key]);
      }
    }

    var postBody = params.postBody;
    if (postBody) {
      xhr.send(postBody);
    } else {
      xhr.send();
    }

    return deferred.promise;
  };

  Mtop.prototype.__processRequest = function(next, throwError) {
    var that = this;
    var params = this.params;
    var method = params.method;
    return ready
      .then(function() {
        if (method === 'get' || method === 'post') {
          return that.__sendRequest(throwError);
        } else {
          throw new Error('UNEXCEPT_REQUEST::错误的请求类型');
        }
      })
      .then(next());
  };

  Mtop.prototype.__sequence = function(fnArray) {
    var that = this;
    var preProcessor = [];
    var postProcessor = [];

    function add(fn) {
      if (fn instanceof Array) {
        fn.forEach(add);
      } else {
        var pre = defer();
        var post = defer();
        var next;

        preProcessor.push(function() {
          pre = defer();

          next = fn.call(
            that,
            function(result) {
              pre.resolve(result);
              return post.promise;
            },
            function(errMsg) {
              pre.reject(errMsg);
              return post.promise;
            }
          );

          if (next) {
            next = next['catch'](function(e) {
              pre.reject(e);
            });
          }

          return pre.promise;
        });

        postProcessor.push(function(result) {
          post.resolve(result);
          return next;
        });
      }
    }

    fnArray.forEach(add);

    var promise = ready;
    var processor;

    while (!!(processor = preProcessor.shift())) {
      promise = promise.then(processor);
    }

    while (!!(processor = postProcessor.pop())) {
      promise = promise.then(processor);
    }

    return promise;
  };

  var startPoint = function(next) {
    next();
  };

  var endPoint = function(next) {
    next();
  };

  /**
   * 在浏览器中，会通过Ajax方式发起请求（H5）。在手淘和天猫客户端中，会通过客户端原生接口发起请求（MtopPlugin）。
   * @method request
   * @return {Promise}  Promise实例
   * @memberOf Mtop
   * @instance
   */
  Mtop.prototype.request = function(options) {
    var that = this;

    this.options = defaults(options || {}, globalConfig);

    var promise = Promise.resolve([startPoint, endPoint])
      .then(function(ret) {
        var __processStart = ret[0];
        var __processEnd = ret[1];

        return that.__sequence([
          __processStart,
          that.__processParams,
          that.__processRequestUrl,
          that._processHeaders,
          that.__processRequest,
          __processEnd
        ]);
      })
      .then(function() {
        var response = options.response;
        if (response.success) {
          return Promise.resolve(response);
        } else {
          return Promise.reject(response);
        }
      });

    return promise;
  };

  mtopee = function(params) {
    return new Mtop(params);
  };

  /**
   * 网关请求入口
   * 在浏览器中，会通过Ajax方式发起请求（H5）
   * @deprecated 请使用new Mtop(params).request();
   * @method request
   * @param {requestParams} params - 请求参数
   * @param {Function} [successCallback] 成功回调
   * @param {Function} [failureCallback] 失败回调
   * @return {Promise} Promise对象实例
   * @memberof win.mtopee
   */
  mtopee.request = function(params, successCallback, failureCallback) {
    var options = {
      successCallback: successCallback,
      failureCallback: failureCallback || successCallback
    };

    return new Mtop(params).request(options);
  };

  mtopee.middlewares = middlewares;
  mtopee.config = globalConfig;
  mtopee.CLASS = Mtop;
  return mtopee;
});
