var isEditing = false;
$(function() {

  let attempts = 0,
  loaded = setInterval(function(){
    if(attempts++>40){
       alert("Unable to load Extension, please reload the page to try enabling the extension again.")
       clearInterval(loaded)
    }
    
    if(typeof isSiteForward == "function"){
      clearInterval(loaded) 
      console.log("Providence Changer Loaded")
      ready()
    }
    else
       console.log(`Providence Changer Loading attempt ${attempts}`)
  }, 50)

})
function ready(){

   if (localStorage.getItem("nightMode-p") == "true")
     $("body.app").addClass("nightMode");

    $("#header .tot_dropdown .tot_droplist ul").first()
    .prepend('<li class="nightModeToggle"><a href="#">Toggle Night Mode</a></li>');
    $(".nightModeToggle").on('click', function(){
      $("body.app").toggleClass("nightMode");
      localStorage.setItem('nightMode-p', $("body.app").hasClass("nightMode"));
    });

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
    let waiting = setInterval(()=> {
      // Wait for chat to be ready
      if(document.querySelector(".chat-wrapper").classList.contains("loading"))
        return
       
      let advisorId = window.loggedInUser;
      getRejections(advisorId)
      .then(rejections => {
          $(".rejection-notice").each(function(){
            let rejectionItem = rejections.find(item => {return item.rejectionId == $(this).data("id")}) || []
            $(this).find(".rejected-item").each(function(i, rejectionWrapper) {
              let isCompleted = rejectionItem?.rejection ? rejectionItem.rejection[i] : false;
              $(this).prepend('<input class="rejection-completed"' + (isCompleted ? 'checked=true' : '') + ' type="checkbox">');
            })
          });
          $(".rejection-completed").off().on("change", function(){
            let index = Array.prototype.indexOf.call(this.parentNode.parentNode.children, this.parentNode);
            let rejectionId = $(this).parent().parent().parent().parent().data("id");
            let rejectionArray = [];
            $(this).parent().parent().find(".rejected-item").each(function(e, item){
              rejectionArray.push($(item).find(".rejection-completed")[0].checked ? true : false);
            });
            updateRejection(advisorId, rejectionId, rejectionArray);
          })
      })
      .catch(err =>{
        console.log(err);
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
      clearInterval(waiting)
    }, 5);
  });

  //When archives are opened
  $(".open-archives").on("click", function () {

    //Wait 2 seconds
    let waiting = setInterval(()=> {


       if(document.querySelector("#archives-overlay").classList.contains("loading"))
          return

       // For each archive item adjust the styling
       $(".archive-item").each(function () {
          $(this).css("flex-flow", "row wrap");
          $(this).find(".archive-actions")[0].style = 'position: absolute; top: 20px; right: 20px;';

          //Load the archive note
          let url = $(this).find(".btn-group").children().first()[0].href;
          updateNotes(this, url);
       });

       async function updateNotes(item, url) {

          //Get the notes
          let notes = await getNotes(url);

          //Add the notes, and the styling
          if (notes) {
             $(item).append('<div class="compliance-notes" style="font-size: 14px; width: 100%;">' + notes + '</div>');
             $(item).find("span.small").css("font-size", "12px");
          }
       }

       function getNotes(url) {
          return new Promise(function (resolve) {

             //Read the note from the page
             $.get(url).done(data => {
                let $data = $(data);

                //Try to get the notes
                let notes = $data.find(".is-compliance-notes").html();

                //Get the notes if it wasn't found the previous way
                if (!notes)
                   notes = '<span class="small">Approved By: ' + $($data.find('.print-timestamp-title + span')[2]).html() + '</span>';
                resolve(notes);
             });
          });
       }
       
    clearInterval(waiting)
    }, 50);
 });
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
