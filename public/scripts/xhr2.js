/**
 *
 * @param {string} method
 * @param {string} url
 * @param {*} data
 * @param {{requestHeaders: *; responseParser: *}} options
 */
function xhr(method, url, data, options) {
  const request = new XMLHttpRequest();
  if (options) {
    var { requestHeaders, responseParser } = options;
  }

  return new Promise((resolve, reject) => {
    request.onreadystatechange = () => {
      if (request.readyState == 4 && request.status == 200) {
        if (responseParser) {
          resolve(responseParser(request));
        } else {
          resolve(request.responseText);
        }
      }
    };

    request.open(method, url);

    if (requestHeaders) {
      for (const [k, v] of Object.entries(requestHeaders)) {
        request.setRequestHeader(k, v);
      }
    }

    request.send(data);
  });
}
