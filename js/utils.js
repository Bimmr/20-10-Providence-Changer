let teamAccounts = [
  '5b6b0b38c7b3f042604e254c', // SiteForward
  '5b6b0812c7b3f042604e253c', // MLS Sales Communication
  '5b6b08c8fc61b959e4b69d79'  // Insurance Compliance
]
let sfAccounts = [
  '5b71d892138837295d1d88d5',  // Randy
  '63515d1ca14d730aa357ebeb',  // Kayla
  '6685700e7ab7518b2fdec363',  // Laurel Benzaquen
//'5fd3d2192456636b40e14528',  // Staging Officer Account
]
let mlsAccounts = [
  '5b7a252c87b3513edc0b86bb', // Debbie
  '6053855b7d9f5556ecc9e33b', // Julien
  '62fbcef1ad43191d020cc850', // Lorena
  '66b2337b018d3ef81ab93714', // Christina Bettencourt
  '666af5e9d0e2294ebf33556e', // Michael Esposito

  '65ea1ce732bf8ae915a5c326', // Katherine Garvida
  '65ea1c7d32bf8ae915a5c2ea', // Serena Xiao
  '66326c5dcd47b3d689ce8834', // Marvin Sanchez
  '66326c1fcd47b3d689ce87f2', // Sam Lenuel Jamen

  '66c342a60c1b4b313fb7bc25', // Mark Sebastian
  '66b2339f018d3ef81ab9373c', // Nasrin Hedayat
]
let msiAccounts = [
  '652804a80912586687b76f45', // Susie Rafael
  '66e853abcbfcb64e1c719b11',  //Navneet Kaur Sekhon
]
let miscAccounts = [
  '5dd2f8e3d3547e4c268d5c42', // SFP - On Hold
  '5e822faab7479c3245b2f75a', // Compliance Follow up
  '5c6efe623b265776d89b0638', // Under Construction
  'all' // Under Construction
]
let notAssignable = [
  '656f37c186f67a09a847f8e1', // GWAM Web Publishing Team
]
let notActive = [
  '5e82312ab7479c3245b2f88e', // Summer
  '5cab89722de8d2305492b333', // Kat
  '5b9490ea0420c067d6b37637', // Josee
  '5f7f00c82820196e420db6bc', // Paul - (Deleted)
  '5b7a254b87b3513edc0b86bc', // John - (Deleted)
  '5b44a4121ee2f32880ef9485', // Mandy
  '5ed534b953c1441f7930abfa', // Zain
  '5b7a258c87b3513edc0b86be', // Janet
  '5b7a25ac9f5388026d43d977', // Sandy
  '5e82314cb7479c3245b2f891', // Suzanne
  '5d1391aa7c86f50a97009f18', // Rachel
  '65ea1c6032bf8ae915a5c1e4', // Vivian N Li
]

let allAccountList = function(){
  return [...sfAccounts, ...teamAccounts, ...mlsAccounts, ...msiAccounts]
}

let isSiteForward = function(id){
  return sfAccounts.some( i => i == id);
}
let isTeam = function(id){
  return teamAccounts.some( i => i == id);
}
let isCompliance = function(id){
  return mlsAccounts.some( i => i == id) || msiAccounts.some( i => i == id);
}
let isMLSSalesCompliance = function(id){
  return mlsAccounts.some( i => i == id);
}
let isMSICompliance = function(id){
  return msiAccounts.some( i => i == id);
}
let isMiscellaneous = function(id){
  return miscAccounts.some( i => i == id);
}
let isOnHold = function(id){
  return id == miscAccounts[0] || id == miscAccounts[1];
}
let isNotAssignable = function(id){
    return notAssignable.some( i => i == id);
}
let isNotActive = function(id){
    return notActive.some( i => i == id);
}


// Wait for class to be added
let waitForClass = function(b, e, c, callback) {
  var timer = setInterval(function() {
    if (b ? e.hasClass(c) : !e.hasClass(c)) {
      clearInterval(timer);
      callback();
    }
  }, 100);
}

//Wait for style to be added
let waitForStyle = function(b, e, s, v, callback) {
  var timer = setInterval(function() {
    if (b ? e.css(s) == v : e.css(s) != v) {
      clearInterval(timer);
      callback();
    }
  }, 100);
}

//debounce and wait
function debounce(callback, ms) {
  let timeoutId;
  return function() {
    const context = this;
    const args = arguments;
    
    // Clear the previous timeout
    clearTimeout(timeoutId);
    
    // Set a new timeout
    timeoutId = setTimeout(function() {
      callback.apply(context, args);
    }, ms || 0);
  };
}

// =============================================================================
// Utility Functions
// =============================================================================
/**
 * Create a new HTML element.
 * @param {*} tag - The tag name of the element to create.
 * @param {*} options - The options to apply to the element.
 * @returns {HTMLElement} - The created element.
 */
function createElement(tag, options = {}) {
    const element = document.createElement(tag)
    Object.entries(options).forEach(([key, value]) => {
        if (key === "class") element.className = value
        else if (key === "html") element.innerHTML = value
        else if (key === "style" && typeof value === "object") Object.assign(element.style, value)
        else if (key.startsWith("on") && typeof value === "function") element.addEventListener(key.slice(2), value)
        else if (key === "checked") element.checked = value == true ? true : null
        else element.setAttribute(key, value)
    })
    return element
}

/**
 * Wait for a specific style change on an element.
 * @param {*} shouldBe - The expected state (true/false) of the style.
 * @param {*} element - The target element to observe.
 * @param {*} property - The CSS property to check.
 * @param {*} value - The expected value of the CSS property.
 * @returns {Promise} - A promise that resolves when the style change is detected.
 */
function waitForStyleAsync(shouldBe, element, property, value) {
    return new Promise((resolve) => {
        const check = () => {
            const style = window.getComputedStyle(element)
            if ((style[property] === value) === shouldBe) {
                resolve()
            } else {
                requestAnimationFrame(check)
            }
        }
        check()
    })
}

/**
 * Wait for a specific class change on an element.
 * @param {*} shouldHave - The expected state (true/false) of the class.
 * @param {*} element - The target element to observe.
 * @param {*} className - The class name to check.
 * @returns {Promise} - A promise that resolves when the class change is detected.
 */
function waitForClassAsync(shouldHave, element, className) {
    return new Promise((resolve) => {
        const check = () => {
            if (element.classList.contains(className) === shouldHave) {
                resolve()
            } else {
                requestAnimationFrame(check)
            }
        }
        check()
    })
}

/**
 * Get an item by its ID.
 * @param {*} c - The class name to search within.
 * @param {*} id - The ID of the item to retrieve.
 * @returns {HTMLElement|null} - The found element or null if not found.
 */
function getItemById(c, id) {
    return document.querySelector(`.${c}[data-id="${id}"]`)
}
