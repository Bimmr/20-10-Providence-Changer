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
  $("body").append(
    "<style>" +
    //Show active tab
    '.active-page-tab{background:rgba(31, 233, 174, 0.5);}' +
    '.active-page-tab ol {background:#F6F6F7;}' +
    '.active-page-tab ol li:first-of-type {background:rgba(31, 233, 174, 0.5);}' +

    //Checkbox for rejections
    '.rejection-completed{position: absolute; top: 3.75rem; right:3rem;}' +

    //Fix font weight of page title badges
    'ol.pages li .title span.page-type, .dd-list li .title span.page-type{font-weight: 400;background: #999;}'+

    // "#app-wrapper > #header{z-index: 10 !important;}"+
    // "#app-wrapper > #page-settings-overlay{top: 60px !important;}"+
    'body.app.nightMode h1, body.app.nightMode h2, body.app.nightMode  h3, body.app.nightMode  h4, body.app.nightMode .account-nav__my-account .display-name, body.app.nightMode .account-nav__chat .chat-name {color: #fff;}'+
    'body.app.nightMode #header{background-color:  #2a2a2a; color: #fff;}'+
    'body.app.nightMode #header .logo{filter: grayscale(1) invert(1);}'+
    'body.app.nightMode #header .logo:before{display: none}'+
    'body.app.nightMode .sidebar, body.app.nightMode #app-wrapper{background-color: #2d2d2d}'+
    'body.app.nightMode .pages-pane > .scroller{overflow-x:hidden}'+
    'body.app.nightMode .active-page-tab { border-radius: 13px;}'+
    'body.app.nightMode .dd-item button, body.app.nightMode ol.pages li .drag:hover+.title {background-color: #212121; color: #efefef}'+
    'body.app.nightMode .dd-item button:hover {background-color: #333; }'+
    'body.app.nightMode .active-page-tab ol { background: #2d2d2d;}'+
    'body.app.nightMode ol.pages li .page-tools{background-color: #212121;}'+
    'body.app.nightMode .dd-list li .page-tools ol.pages li .title:hover+.page-tools, body.app.nightMode .dd-list li .title:hover+.page-tools, body.app.nightMode .dd-list li .drag:hover+.title {background-color: #333;}'+
    'body.app.nightMode ol.pages li .page-tools a:hover, body.app.nightMode .dd-list li .page-tools a:hover {color: #aaa}'+
    'body.app.nightMode .fade-top.night, body.app.nightMode .fade-bottom.night {opacity: 1;}'+
    'body.app.nightMode .fade-top.day, body.app.nightMode .fade-bottom.day {opacity: 0;}'+
    'body.app.nightMode ol.pages li .title span.page-type, body.app.nightMode .dd-list li .title span.page-type {background: #484848;}'+
    'body.app.nightMode a.btn--outlined:not(:hover) {color:#aaa;border-color: #aaa}'+
    'body.app.nightMode .btn-text, body.app.nightMode .is-text {color: #888}'+
    'body.app.nightMode .btn-text:hover, body.app.nightMode .is-text:hover {color: #ccc;}'+
    'body.app.nightMode .styles--tab-toggle.is-active {color: #ccc}'+
    'body.app.nightMode .color-picker, body.app.nightMode .select-control.font-picker::before, body.app.nightMode .select-control.weight-picker::before {color: #ccc; background-color: #333}'+
    'body.app.nightMode .select-control .selected {color: #ccc;}'+
    'body.app.nightMode .form-item.is-select::after{color:#888}'+
    'body.app.nightMode .select-control ul.dropdown-options li span, body.app.nightMode .select-control ul.dropdown-options button span {color: #fafafa}'+

    'body.app.nightMode .noUi-tooltip{background: #2d2d2d;color: #efefef;}'+
    'body.app.nightMode .noUi-handle {background-color: #efefef;}'+
    'body.app.nightMode .vex-content {background-color: #2d2d2d;}'+
    'body.app.nightMode .vex-content p{color: #efefef;}'+
    'body.app.nightMode .friendship{background-color: #212121; border-color: #4c4c4c;}'+
    'body.app.nightMode .friendship .friendship-title small {color: #a7a7a7cc}'+

    'body.app.nightMode article.post:hover::after, body.app.nightMode li.member:hover::after {border-color: #efefef;}'+

    'body.app.nightMode .styles--tab-toggle.is-active, body.app.nightMode .styles--tab-toggle.is-active::before {border-color: #ccc}'+
    'body.app.nightMode .styles--tab-toggle.is-active::after{border-top-color: #ccc}'+

    'body.app.nightMode ul.domain_list li .title {background-color: #212121; color: #efefef}'+
    'body.app.nightMode ul.domain_list li .title:hover {background-color: #333; }'+
    'body.app.nightMode ul.domain_list li .domain-tools:hover {background-color: #212121;}'+
    'body.app.nightMode ul.domain_list li .title:hover+.domain-tools {background-color: #333;}'+
    'body.app.nightMode ul.domain_list li .domain-tools a:hover span.icon{color: #aaa;}'+
    'body.app.nightMode .form--note {color: #efefef;}'+

    'body.app.nightMode .integration-actions {background: linear-gradient(to right, #2c2c2c00 0%, #2c2c2c63 10%, #2c2c2cbf 20%, #2c2c2c 100%);}'+
    'body.app.nightMode .integration-details .integration-title, body.app.nightMode .integration-details p  { color: #efefef}'+

    'body.app.nightMode #site-preview {box-shadow: 0 0 2rem 0 rgb(255 255 255 / 10%);}'+
    'body.app.nightMode #site-preview .browser .browser-bar {background-color: #212121}'+
    'body.app.nightMode #site-preview .browser .browser-bar .title {color: #ccc}'+
    'body.app.nightMode .btn.secondary{background-color: #414141; color: #efefef}'+
    'body.app.nightMode .btn.secondary:hover{background-color: #333;}'+

    'body.app.nightMode .settings-wrapper, body.app.nightMode #brokercheck-overlay, body.app.nightMode #account-settings-overlay, body.app.nightMode #redirects-overlay, body.app.nightMode #dns-settings-overlay, body.app.nightMode #integrations-overlay {background-color: #2d2d2d}'+
    'body.app.nightMode .settings-wrapper .settings-header, body.app.nightMode .settings-wrapper .settings-footer {background-color: #212121;}'+
    'body.app.nightMode .settings-wrapper .settings-header h2, body.app.nightMode .settings-wrapper .settings-header h1, body.app.nightMode .settings-wrapper .settings-footer h2{color: #efefef; }'+

    'body.app.nightMode .styles--component-toggle button, body.app.nightMode .styles--section-toggle, body.app.nightMode .styles--tab-toggle.is-active, body.app.nightMode .form-item--label{color: #efefef;}'+
    'body.app.nightMode .form-item--helper, body.app.nightMode .sidebar p.is-desc {color: #aaa} '+
    'body.app.nightMode .form-item--control{background-color: #212121; color: #efefef}'+
    'body.app.nightMode .form-item.is-textarea::before {background-color: #272727}'+
    'body.app.nightMode .styles--tab {background-color: #4c4c4c;}'+

    'body.app.nightMode #uploads-library {background-color: #2d2d2d}'+
    'body.app.nightMode .library-wrapper .library-sidebar {background: #21212180;}'+
    'body.app.nightMode .filter-uploads li.active a { background: #3a3a3a; color: #efefef; }'+
    'body.app.nightMode .filter-uploads a:hover {color: #efefef;}'+
    'body.app.nightMode .assisted-overlay{background-color: #2d2d2d;}'+
    'body.app.nightMode .checkbox-group{background: #272727;}'+

    'body.app.nightMode a.download-chat:hover span , body.app.nightMode .close-chat:hover span, body.app.nightMode .close-library:hover span, body.app.nightMode .close-archives:hover span, .close-diff:hover span { background: #efefef;}'+
    'body.app.nightMode .chat-wrapper, body.app.nightMode .chat-footer{background-color: #2d2d2d;}'+
    'body.app.nightMode .chat-wrapper .chat-header .chat-title::after {background-image: linear-gradient(to right, rgba(255,255,255,0) 0%, #2d2d2d 30%, #2d2d2d 100%);}'+
    'body.app.nightMode .fr-box.fr-basic .fr-wrapper, body.app.nightMode .fr-toolbar {background-color: #2d2d2d}'+
    'body.app.nightMode .basic p {color: #efefef}'+

    'body.app.nightMode .fr-toolbar{color: #efefef}'+
    'body.app.nightMode .fr-command.fr-btn+.fr-dropdown-menu{ background: #2d2d2d}'+
    'body.app.nightMode .fr-command.fr-btn+.fr-dropdown-menu .fr-dropdown-wrapper .fr-dropdown-content ul.fr-dropdown-list li a.fr-active{background: #3a3a3a}'+
    'body.app.nightMode .fr-toolbar .fr-command.fr-btn {color: #efefef}'+
    'body.app.nightMode .fr-toolbar .fr-command.fr-btn.fr-dropdown.fr-active, body.app.nightMode .fr-popup .fr-command.fr-btn.fr-dropdown.fr-active, body.app.nightMode .fr-modal .fr-command.fr-btn.fr-dropdown.fr-active{background: #3a3a3a}'+
    'body.app.nightMode .fr-desktop .fr-command:hover:not(.fr-table-cell), body.app.nightMode .fr-desktop .fr-command:focus:not(.fr-table-cell), body.app.nightMode .fr-desktop .fr-command.fr-btn-hover:not(.fr-table-cell), body.app.nightMode .fr-desktop .fr-command.fr-expanded:not(.fr-table-cell){background: #3a3a3a}'+
    'body.app.nightMode .fr-toolbar .fr-command.fr-btn.fr-dropdown:after, body.app.nightMode .fr-popup .fr-command.fr-btn.fr-dropdown:after, body.app.nightMode .fr-modal .fr-command.fr-btn.fr-dropdown:after{border-left: 4px solid transparent; border-right: 4px solid transparent; border-top: 4px solid #efefef;}'+
    'body.app.nightMode .fr-toolbar .fr-command.fr-btn.fr-dropdown.fr-active:after, body.app.nightMode .fr-popup .fr-command.fr-btn.fr-dropdown.fr-active:after, body.app.nightMode .fr-modal .fr-command.fr-btn.fr-dropdown.fr-active:after{border-top: 0; border-bottom: 4px solid #efefef;}'+
    'body.app.nightMode .profile-photo-form {background-color: #212121}'+
    'body.app.nightMode #brokercheck-overlay .tab-nav a.active, body.app.nightMode #account-settings-overlay .tab-nav a{color: #888}'+
    'body.app.nightMode #brokercheck-overlay .tab-nav a.active, body.app.nightMode #account-settings-overlay .tab-nav a.active{color: #efefef}'+
    'body.app.nightMode #payment-section{color: #efefef}'+
    'body.app.nightMode #archives-overlay {background-color: #212121}'+

    'body.app.nightMode p a.inline{color: #aaa}'+
    'body.app.nightMode .settings-content, body.app.nightMode p.secondary{color: #efefef}'+
    'body.app.nightMode .chat-content .chat-messages .message {background-color: #4c4c4c;}'+
    'body.app.nightMode .fr-box.fr-basic .fr-element{color: #efefef}'+
    'body.app.nightMode .chat-content .chat-messages .message.broker, body.app.nightMode .chat-content .chat-messages .message.rejection-notice.broker .message-content .rejection-wrapper {background-color: #efefef}'+
    'body.app.nightMode .chat-content .chat-messages .message.rejection-notice.broker .message-content .rejection-wrapper{border: 2px solid #efefef}'+

    'body.app.nightMode .basic h1, body.app.nightMode .basic h2, body.app.nightMode .basic h3, body.app.nightMode .basic h4, body.app.nightMode .basic h5, body.app.nightMode .basic h6 { color: #efefef !important;}'+
    'body.app.nightMode .content-item .article-categories {color: rgba(255,255,255,0.8);}'+
    'body.app.nightMode .content-wrapper .content-header h1 .ca-title {filter: brightness(3)}'+
    'body.app.nightMode #content-library .content-wrapper .content-sidebar {background: #212121;}'+
    'body.app.nightMode #content-library {background: #2d2d2d;}'+

    "</style>");

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
