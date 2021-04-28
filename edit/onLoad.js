function injectScript(file, node) {
  var th = document.getElementsByTagName(node)[0];
  var s = document.createElement('script');
  s.setAttribute('type', 'text/javascript');
  s.setAttribute('src', file);
  th.appendChild(s);
}
injectScript( 'https://sdk.amazonaws.com/js/aws-sdk-2.892.0.min.js', 'body');
injectScript( chrome.extension.getURL('/js/utils.js'), 'body');
injectScript( chrome.extension.getURL('/js/db.js'), 'body');
injectScript( chrome.extension.getURL('/edit/injected.js'), 'body');
