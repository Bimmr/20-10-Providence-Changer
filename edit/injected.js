var isEditing = false;
window.devHelper = true;

$(function() {
  $("body").append(
    "<style>" +
    '.active-page-tab{background:rgba(31, 233, 174, 0.5);}' +
    '.active-page-tab ol {background:#F6F6F7;}' +
    '.active-page-tab ol li:first-of-type {background:rgba(31, 233, 174, 0.5);}' +
    '.rejection-completed{position: absolute; top: 3.75rem; right:3rem;}' +
    // "#app-wrapper > #header{z-index: 10 !important;}"+
    // "#app-wrapper > #page-settings-overlay{top: 60px !important;}"+
    "</style>");

  var sidebarLoaded = setInterval(function() {
    if (!$('.sidebar').hasClass("loading")) {
      // Stop looping
      clearInterval(sidebarLoaded);

      colorPageTab($("#previewIframe")[0].src);

      $(".browser").find(".title").bind("DOMSubtreeModified", function() {
        colorPageTab($("#previewIframe")[0].src);
      });
      $("#previewIframe").on("load", function() {
        colorPageTab($("#previewIframe")[0].src);
      });
    }
  }, 500);

  function colorPageTab(frameURL) {
    let frameURLSplit = frameURL.split("/");

    if (frameURLSplit.length == 4 && (frameURLSplit[3].length == 0 || frameURLSplit[3] == "home"))
      frameURL = "";
    else if (frameURLSplit.length > 4)
      frameURL = frameURLSplit[3] + "/" + frameURLSplit[4]
    else
      frameURL = frameURLSplit[3];

    $("#pagesWrapper").find(".active-page-tab").removeClass("active-page-tab");
    $("#pagesWrapper").find('.title[data-url="' + frameURL + '"]').parent().addClass("active-page-tab");
  }

  function editAll(){
    editPages(()=>editMembers(()=>editPosts()));
  }


  if(localStorage.getItem('IsSiteForward') == "true"){
    $(document).on('keypress mousedown', function(){
      if(isEditing)
        stopEditing();
    });
    async function stopEditing(){ isEditing = false; console.log("Stopping Auto Edit"); }

    $(".browser-bar--right").append('<div class="tot_dropdown" style="margin-left:.5em;"> <a href="#" class="popout-preview">Mark As Edited</a> <div class="tot_droplist is-far-right"> <ul> <li><a href="#" class="edit-pages-pages" data-size="desktop">Edit Pages</a></li> <li><a href="#" class="edit-pages-members" data-size="tablet">Edit Members</a></li> <li><a href="#" class="edit-pages-posts" data-size="mobile">Edit Posts</a></li> <li><a href="#" class="edit-pages-all">Edit All</a></li> </ul> </div> </div>');

    $(".edit-pages-pages").on("click", editPages);
    $(".edit-pages-members").on("click", editMembers);
    $(".edit-pages-posts").on("click", editPosts);
    $(".edit-pages-all").on("click", ()=> editPages(()=>editMembers(()=>editPosts())));
  }

  //When the chat opens
  $(".open-chat, #open-chat").on("click", () => {
    //Wait for the chat to initialize
    setTimeout(() => {

      let rejections = updateRejections('rejections-' + window.loggedInUser);
      rejections.forEach(e => {
        $('.rejection-notice[data-id=' + e.id + ']').find(".rejected-item").each(function() {
          let title = getOnlyText($(this).find(".rejected-title"));
          let rejection = e.rejections.find(e2 => {
            return title == e2.title;
          });
          let isCompleted = rejection.completed;
          $(this).prepend('<input class="rejection-completed"' + (isCompleted ? 'checked=true' : '') + ' type="checkbox">');
        });
      });
      $(".rejection-completed").on('change', function() {
        let id = $(this).parent().parent().parent().parent().data("id"),
          title = getOnlyText($(this).parent().find(".rejected-title"));
        rejections.find(function(e) {
          if (e.id == id)
            return e.rejections.find(e2 => {
              if (e2.title == title) {
                e2.completed = !e2.completed;
                return true;
              }
            });
        });
        localStorage.setItem('rejections-' + window.loggedInUser, JSON.stringify(rejections));
      });

      //When the chat gets opened, display saved message
      if (localStorage.getItem('savedChatMsg') && localStorage.getItem('savedChatMsg') != 'null' && localStorage.getItem('savedChatMsg') != 'undefined') {
        $($("#chatMessage").find(".fr-wrapper")).removeClass("show-placeholder");
        $($("#chatMessage").find(".fr-element")).html(localStorage.getItem('savedChatMsg'));
      }

      //When the chat gets closed, save the message
      $(".close-chat").on("click", () => {
        localStorage.setItem('savedChatMsg', $($("#chatMessage").find(".fr-element")).html());
      });

      //When message is sent remove from saved message
      $(".chat-tools").find(".send-message").on('click', () => {
        localStorage.setItem('savedChatMsg', null);
        $("#loadLastMessage").hide();
      });
    }, 2000);
  });
});

function updateRejections(key) {
  let savedRejections = JSON.parse(localStorage.getItem(key));
  if (!savedRejections)
    savedRejections = [];
  var rejections = [];

  $(".rejection-notice").each(function(notice) {
    let rejected = {
      id: $(this).data("id"),
      rejections: []
    };

    $(this).find(".rejected-item").each(function(item) {
      let rejection = {
        title: getOnlyText($(this).find(".rejected-title")),
        message: $(this).find(".note-content p").text(),
        completed: false
      };
      rejected.rejections.push(rejection);
    });
    rejections.push(rejected);
  });

  rejections.forEach((e, i) => {
    if (!savedRejections.some(e2 => {
        return e.id == e2.id;
      })) {
      savedRejections.push(e);
    }
  });
  localStorage.setItem(key, JSON.stringify(savedRejections));
  return savedRejections;
}

function getOnlyText(e) {
  return e.clone() //clone the element
    .children() //select all the children
    .remove() //remove all the children
    .end() //again go back to selected element
    .text();
}

function getItemById(c, id) {
  var v = $("." + c + "[data-id=" + id + "]");
  return v
}
function editPages(callback){
    isEditing = true;
    var $overlay = $("#page-settings-overlay");
    var pagesArray = $(".page-settings").map((i, e) => $(e).data("id")).get();
    var pageIndex = -1;

    touchPages(callback);

    function touchPages(callback) {
      pageIndex += 1;
      var page = pagesArray[pageIndex];
      if (page && isEditing)
        touchPage(page, () => touchPages(callback));
      else if (callback)
        callback();
    }

    function touchPage(page, callback) {
      page = getItemById("page-settings", page);
      if (page) {

        page.click();
        waitForStyle(true, $overlay, "display", "block", function() {
          waitForClass(true, $overlay, "ready", function() {
            $overlay.find(".save").click();
            waitForClass(false, $("body"), "overlay-active", function() {
              waitForStyle(true, $overlay, "display", "none", function() {
                if (callback)
                  callback();
              });
            });
          });
        });
      }
    }

}
function editMembers(callback){

    isEditing = true;
    var $overlay = $("#page-settings-overlay");
      var membersArray = $(".manage-members").map((i, e) => $(e).data("id")).get();
    var memberIndex = -1;

    touchMembers(callback);

    function touchMembers(callback) {
      memberIndex += 1;
      var page = membersArray[memberIndex];
      if (page && isEditing)
        touchMember(page, () => touchMembers(callback));
      else if (callback)
        callback();
    }


    function touchMember(page, callback) {
      page = getItemById("manage-members", page);
      if (page) {
        page.click();
        waitForStyle(true, $overlay, "display", "block", function() {
          waitForClass(true, $overlay, "ready", function() {

            var i = -1;
            var singleMembersArray = $(".member").map((i, e) => $(e).data("id")).get();

            function touchAllMembers(callback2) {
              i += 1;
              var member = singleMembersArray[i];
              if (member && isEditing)
                touchSingleMember(member, () => touchAllMembers(callback2));
              else
                callback2();
            }


            function touchSingleMember(member, callback) {
              member = getItemById("member", member);
              if (member) {
                member.click();
                waitForClass(false, $(".edit-post-pane"), "velocity-animating", function() {
                  waitForStyle(true, $(".edit-member-pane"), "display", "block", function() {
                    setTimeout(function(){
                      $(".edit-member-pane").find(".save").click();
                      waitForClass(false, $(".edit-post-pane"), "velocity-animating", function() {
                        waitForStyle(true, $(".edit-member-pane"), "display", "none", function() {
                          if (callback)
                            callback();
                        });
                      });
                    }, 2000);
                  });
                });
              }
            }

            touchAllMembers(function() {
              //Edit members
              $overlay.find(".cancel").click();
              waitForClass(false, $("body"), "overlay-active", function() {
                waitForStyle(true, $overlay, "display", "none", function() {

                  if (callback)
                    callback();
                });
              });
            });
          });
        });
      }
    }
}
function editPosts(callback){
    isEditing = true;

    var $overlay = $("#page-settings-overlay");
    var postsArray = $(".manage-posts").map((i, e) => $(e).data("id")).get();
    var postIndex = -1;

    touchPosts(callback);

    function touchPosts(callback) {
      postIndex += 1;
      var page = postsArray[postIndex];
      if (page && isEditing)
        touchPost(page, () => touchPosts(callback));
      else if (callback)
        callback();
    }

    function touchPost(page, callback) {
      page = getItemById("manage-posts", page);
      if (page) {
        page.click();
        waitForStyle(true, $overlay, "display", "block", function() {
          waitForClass(true, $overlay, "ready", function() {

            var i = -1;
            var singlePostArray = $(".post").map((i, e) => $(e).data("id")).get();

            function touchAllPosts(callback2) {
              i += 1;

              var post = singlePostArray[i];
              if (post && isEditing)
                touchSinglePost(post, () => touchAllPosts(callback2));
              else
                callback2();
            }


            function touchSinglePost(post, callback) {
              post = getItemById("post", post);
              if (post) {
                post.click();
                waitForClass(false, $(".edit-post-pane"), "velocity-animating", function() {
                  waitForStyle(true, $(".edit-post-pane"), "display", "block", function() {
                    setTimeout(function(){
                      $(".edit-post-pane").find(".save").click();
                      waitForClass(false, $(".edit-post-pane"), "velocity-animating", function() {
                        waitForStyle(true, $(".edit-post-pane"), "display", "none", function() {
                          if (callback)
                            callback();
                        });
                      });
                    }, 2000);
                  });
                });
              }
            }

            touchAllPosts(function() {
              //Edit posts
              $overlay.find(".cancel").click();
              waitForClass(false, $("body"), "overlay-active", function() {
                waitForStyle(true, $overlay, "display", "none", function() {

                  if (callback)
                    callback();
                });
              });
            });
          });
        });
      }
    }
}

function waitForClass(b, e, c, callback) {
  var timer = setInterval(function() {
    if (b ? e.hasClass(c) : !e.hasClass(c)) {
      clearInterval(timer);
      callback();
    }
  }, 100);
}

function waitForStyle(b, e, s, v, callback) {
  var timer = setInterval(function() {
    if (b ? e.css(s) == v : e.css(s) != v) {
      clearInterval(timer);
      callback();
    }
  }, 100);
}
