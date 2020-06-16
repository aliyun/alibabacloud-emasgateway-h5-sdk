/**
 * lib-mtop Emoji 字符处理中间件 v0.1.0
 *
 * MTop 验签方式为 服务端 及 sdk 对比各自生成的签名是否一致。
 * 但目前 服务端 无法识别 Emoji 字符, 导致验签失败。需要对 Emoji 进行特殊处理。
 *
 *
 * Start: 2017-04-06
 */
(function(win, mtopee) {
  if (!mtopee) {
    return;
  }

  // 处理 data 中的 emoji 字符
  function processDataEmoji(next) {
    var that = this;
    var options = this.options;
    var params = this.params;
    var hasEmoji = false;

    // 字符串时,转换 Emoji 成 UTF16
    // http://stackoverflow.com/questions/36673959/how-to-convert-string-with-emoji-%EF%B8%8F-convert-emoji-to-string-like-this-url-wit
    function _process(data) {
      if (typeof data === 'object') {
        data = JSON.stringify(data);
      }
      if (typeof data === 'string') {
        ///(\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff])/g
        return data.replace(/([\ud83a-\ud83f][\u0000-\uffff])/g, function($) {
          hasEmoji = true;
          return '\\u' + $.charCodeAt(0).toString(16) + '\\u' + $.charCodeAt(1).toString(16);
        });
      } else {
        return data;
      }
    }

    params.data && (params.data = _process(params.data));
    // mtop-ee-js 的 data 处理
    that.sendData && (that.sendData = _process(that.sendData));

    return next().then(function() {
      var retJson = options.retJson;
      var ret = retJson.ret;

      // 验签失败时且含有 Emoji 时重试
      if (hasEmoji && ret.indexOf('FAIL_SYS_ILLEGAL_ACCESS') > -1) {
        // TODO retry
        return that.__sequence([
          that.__processToken,
          that.__processRequestUrl,
          that.__loginHook,
          that.middlewares,
          that.__processRequest
        ]);
      }
    });
  }

  mtopee.middlewares.push(processDataEmoji);
})(window, window.mtopee);
