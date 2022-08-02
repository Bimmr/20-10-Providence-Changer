let sfAccounts = [
  '5b6b0b38c7b3f042604e254c',  // SiteForward
  '5b44a4121ee2f32880ef9485',  // Mandy
  '5b71d892138837295d1d88d5',  // Randy
  '5ed534b953c1441f7930abfa',  // Zain
//'5fd3d2192456636b40e14528',  // Staging Officer Account
];
let mlsAccounts = [
  '5b7a252c87b3513edc0b86bb', // Debbie
  '5d1391aa7c86f50a97009f18', // Rachel
  '5e82312ab7479c3245b2f88e', // Summer
  '5e82314cb7479c3245b2f891', // Suzanne
  '6053855b7d9f5556ecc9e33b', // Julien
  '5b6b0812c7b3f042604e253c'  // MLS Sales Communication
];
let msiAccounts = [
  '5b7a258c87b3513edc0b86be', // Janet
  '5b7a25ac9f5388026d43d977', // Sandy
  '5b6b08c8fc61b959e4b69d79'  // Market Conduct Compliance
];
let miscAccounts = [
  '5dd2f8e3d3547e4c268d5c42', // SFP - On Hold
  '5e822faab7479c3245b2f75a', // Compliance Follow up
  '5c6efe623b265776d89b0638', // Under Construction
  'all' // Under Construction
];
let notActive = [
  '5cab89722de8d2305492b333', // Kat
  '5b9490ea0420c067d6b37637', // Josee
  '5f7f00c82820196e420db6bc',  // Paul
  '5b7a254b87b3513edc0b86bc', // John
];

let isSiteForward = function(id){
  return sfAccounts.some( i => i == id);
}
let isCompliance = function(id){
  return mlsAccounts.some( i => i == id) || msiAccounts.some( i => i == id);
}
let isMLSSalesCompliance = function(id){
  return mlsAccounts.some( i => i == id);
}
let isMarketConductCompliance = function(id){
  return msiAccounts.some( i => i == id);
}
let isMiscellaneous = function(id){
  return miscAccounts.some( i => i == id);
}
let isOnHold = function(id){
  return id == miscAccounts[0] || id == miscAccounts[1];
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

//delay and wait when typing
function delay(callback, ms) {
  var timer = 0;
  return function () {
    var context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      callback.apply(context, args);
    }, ms || 0);
  };
}
