// Helper function to inject resources into the page
function injectResource(file, type) {
    const element = document.createElement(type === "style" ? "link" : "script")
    const target = document.getElementsByTagName(type === "style" ? "head" : "body")[0]

    Object.assign(element, {
        ...(type === "style"
            ? {
                  rel: "stylesheet",
                  type: "text/css",
                  href: chrome.runtime.getURL(file),
              }
            : {
                  type: type === "module" ? "module" : "text/javascript",
                  src: chrome.runtime.getURL(file),
              }),
    })

    target.appendChild(element)
}

// Define resources to be injected
const resources = [
    { file: "/edit/styles.css", type: "style" },
    { file: "/js/aws-sdk-2.892.0.min.js", type: "script" },
    { file: "/js/utils.js", type: "script" },
    { file: "/js/keys.js", type: "script" },
    { file: "/js/db.js", type: "script" },
    { file: "/edit/injected.js", type: "script" },
]

// Inject all resources
resources.forEach(({ file, type }) => injectResource(file, type))
