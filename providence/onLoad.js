function injectScript(file, node) {
    var th = document.getElementsByTagName(node)[0];
    var s = document.createElement('script');
    s.setAttribute('type', 'text/javascript');
    s.setAttribute('src', file);
    s.setAttribute("id", "injectedChromeExtension");
    th.appendChild(s);
}
  injectScript( chrome.extension.getURL('/js/utils.js'), 'body');
  injectScript( chrome.extension.getURL('/providence/injected.js'), 'body');
