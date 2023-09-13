export function formatParams(data: Record<string, any>) {
  let arr = []
  for (let name in data) {
    arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]))
  }
  arr.push(('v=' + Math.random()).replace('.', ''))
  return arr.join('&')
}

export function ajax(options) {
  options = options || {}
  options.method = (options.method || 'GET').toUpperCase()
  options.dataType = options.dataType || 'json'
  options.timeout = options.timeout || 30000
  let params = formatParams(options.data)
  let xhr = new XMLHttpRequest()

  if (options.method == 'GET') {
    xhr.open('get', options.url + '?' + params, true)
    xhr.send(null)
  } else if (options.method == 'POST') {
    xhr.open('post', options.url, true)
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
    xhr.send(params)
  }

  // 设置有效时间
  setTimeout(function () {
    if (xhr.readyState != 4) {
      xhr.abort()
    }
  }, options.timeout)
  /*
    接收
    options.success成功之后的回调函数  options.error失败后的回调函数
    xhr.responseText,xhr.responseXML  获得字符串形式的响应数据或者XML形式的响应数据
  */
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      let status = xhr.status
      if ((status >= 200 && status < 300) || status == 304) {
        options.success && options.success(xhr.responseText, xhr.responseXML)
      } else {
        options.error && options.error(status)
      }
    }
  }
}
