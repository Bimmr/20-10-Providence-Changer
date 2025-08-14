function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    th.appendChild(s);
}
function injectModule(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'module');
    s.setAttribute('src', file);
    th.appendChild(s);
}

function injectStylesheet(file, node) {
  var th = document.getElementsByTagName(node)[0];
  var s = document.createElement('link');
  s.setAttribute('rel', 'stylesheet');
  s.setAttribute('type', 'text/css');
  s.setAttribute('href', file);
  th.appendChild(s);
}
injectStylesheet(chrome.runtime.getURL('/providence/styles.css'), 'head');
injectScript( chrome.runtime.getURL('/js/aws-sdk-2.892.0.min.js'), 'body');
injectScript( chrome.runtime.getURL('/js/utils.js'), 'body');
injectScript( chrome.runtime.getURL('/js/keys.js'), 'body');
injectScript( chrome.runtime.getURL('/js/db.js'), 'body');
injectScript( chrome.runtime.getURL('/providence/injected.js'), 'body');
