let baseUrl = "https://app.twentyoverten.com/"
//"https://staging-app.twentyoverten.com/"

let advisorInfo = [];
let tableData;

$(function () {

   //Load advisor list from storage
   if (localStorage.getItem("advisorList") != null)
      advisorInfo = JSON.parse(localStorage.getItem('advisorList'));

   if (isSiteForward(window.loggedInUser))
      localStorage.setItem('IsSiteForward', true);

   $("head").append('<style>' +

      // Float the page navigation
      '.dataTables_paginate,.table-length {position: sticky;bottom: 0; padding: 10px;left: 0;right: 0;}' +
      '.dataTables_paginate {width: 750px;margin: 0 auto; z-index:3}' +
      '.table-length {height:72px;background-color: rgba(3,24,46,0.9); z-index: 2}' +
      '.dataTables_info {color:#dcdcde}' +
      'body.providence .dataTables_paginate {padding: 10px}' +
      'body.providence .dataTables_info, body.providence .dataTables_length {color:#fff}' +
      'body.providence .dataTables_info select, body.providence .dataTables_length select {color: #03182e}' +
      '#advisorsList_wrapper .dataTables_paginate,  #advisorsList_wrapper .table-length {bottom: -2rem;}' +

      // Table details
      'body.providence .table .show-email {font-size: 0.9em}' +
      'body.providence .table span.advisor-tags {font-size: 0.75em}' +

      'body.providence .table .chip--approved{ background: #bdffe9 !important}' +

      //Pending Review Count
      '.review-filter{font-size: .6em;border-top: 1px solid rgba(98,98,98,0.5); color: rgba(140,140,140,0.8); padding-top: .5rem; font-family: "CircularXXWeb-Book",Helvetica,Arial,sans-serif;}' +
      '.review-filter th, .review-filter .active{color: #626262;}' +
      '.review-filter .seperator{border-top: 1px dashed rgba(88,88,88,0.53);}' +
      '.review-filter .active .filter-cards {color: #08aeea;}' +
      '.filter-cards{color: #737373;}' +
      '.filter-cards:hover{color: #08aeea;}' +
      '.providence-pending--title{padding: 1em;}' +


      // Cards
      '.card-extras{font-size: 14px;padding: 15px;margin-top: 15px;background-color: #fafafa; border-radius: 10px;}' +
      '.card-extras p{color:#2d2d2d}' +
      '.card-changes{font-size: 12px;color: #737373;}' +
      '.card-extras p.cardImportantTags{font-size: 12px; color: #08aeea;}' +
      '.card-tags, .card-tier{color: #08aeea}' +
      '.card-tags{font-size: .7em;}' +
      '.card-tier{font-size: .6em;}' +
      '.cardApprovals{ color: #007750}' +
      '.cardRejections{ color: #C20000}' +


      // Add inform styles
      '.advisor-card .card-action{padding: 1.5rem; display: flex;} ' +
      '.providence-pending--list .card-tier{position: absolute;top: 5px;right: 10px;} ' +
      '.providence-pending--list .card-title{padding:1.5em;padding-bottom:0} ' +
      '.providence-pending--list .card-title{display: flex;align-items:center; border-top: none; padding-bottom: 1em;border-bottom: 1px solid #2d2d2d} ' +
      '.providence-pending--list .card-title .advisor-profile{flex-basis: 25%; margin: 0;} ' +
      '.providence-pending--list .card-title h4{flex-basis: 75%;text-align: left;padding-left:10px;margin: 0; font-size: 1em;} ' +
      '.providence-pending--list .card-content{padding-top: 1rem;} ' +
      '.providence-pending--list .card-status{display: flex; align-items: center;justify-content: space-evenly;}' +
      '.providence-pending--list .card-action .btn{padding:0.5em 0.25em;}' +

      // Format rejection box
      '.rejection-completed{position: absolute; top: 3.75rem; right:3rem;}' +

      //Format review notes'
      '.review-item-preview .note p{margin-bottom: 3px}'+
      '.review-item-preview .note ul{list-style: inside}'+
      '.review-item-note-rejection{color:#c2001e;}' +
      '.review-item-note{color:#007750;}' +
      '.review-item-note-rejection h4, .review-item-note h4{position: relative}' +
      '.review-item-note-rejection h4::after{content: ""; position: absolute; bottom: 0; left: 0; height: 1px; width: 65px; background: #c2001e;}' +
      '.review-item-note h4::after{content: ""; position: absolute; bottom: 0; left: 0; height: 1px; width: 40px; background: #007750;}' +
      '.review-item.approved-status .review-item__status{background-color: #E8F8F3; border-radius: 14px 0 0 14px;}' +
      '.review-item.rejected-status .review-item__status{background-color: #F8E5E5; border-radius: 14px 0 0 14px;}' +
      'body.providence .review-submission .approved-count.pending-count span.active {color: #717171}' +

      //Filter warning
      '.filter-warning{background-color: #522626; width: 100%; text-align: center; display: block; position: fixed; color: #fff;}' +

      //Team filters
      '.providence-overview--list:not(.loadedAll) .team-filter-row{display: none}' +
      '.team-filter-row {margin-bottom: 10px;}' +
      '.team-filter {padding: 5px 10px; color: #626262;transition: all 0.15s linear;}' +
      '.team-filter.active { border-bottom: 1px solid #08aeea;}' +
      '.team-filter.active,.team-filter:hover{color: #2d2d2d}' +

      // Search bar
      '.search-bar{display: flex; flex-flow: row wrap; margin-bottom: .5rem}' +
      '.search-bar .form-control{border: 2px solid rgba(98,98,98,0.5); border-radius: 6px;}' +
      '.search-help{position: absolute;top: 12px;right: 25px;width: 20px;height: 20px;border-radius: 50%;background: #cccccc;z-index: 1;line-height: 20px;text-align: center;opacity: .9;}' +
      '.search-bar .form-control:valid+label{color: #626262;transform: translate3d(3px, -28px, 0) scale3d(0.7, 0.7, 1);}' +
      'body.providence .search-bar table.table{border-radius: 14px;}' +
      'body.providence #providence-wrapper .search-bar table.table thead th{font-family: "CircularXXWeb-Medium",Helvetica,Arial,sans-serif;background: #fff;padding: 2rem 27px 2rem 15px;vertical-align: middle;border: none; border-left: 2px solid #e6e6e6; border-bottom: 2px solid #e6e6e6;}' +
      'body.providence #providence-wrapper .search-bar table.table thead th:first-child{border-left: none;border-radius: 8px 0 0 0;}' +
      'body.providence #providence-wrapper .search-bar table.table thead th:last-child{border-radius: 0 8px 0 0;}' +

      'body.providence #providence-wrapper .search-bar table.table td{vertical-align:middle;}' +

      //Providence list quick links
      'body.providence #advisor-details .advisor-quick-links > a{margin: 5px 15px;}' +

      //Revision table - Reportorize
      'body.providence #revisions-list.reportorized td .advisor-profile{display: none}' +
      'body.providence #revisions-list.reportorized td .advisor-profile+span{padding-left: 0; overflow-hidden}' +
      'body.providence #revisions-list.reportorized td.revisions-page .revisions-page-title{font-size: .75em;}' +
      'body.providence #revisions-list.reportorized td.revisions-page .revisions-page-title{font-size: .75em;}' +
      'body.providence #revisions-list.reportorized td.revisions-email, body.providence #revisions-list.reportorized td.revisions-tags, body.providence #revisions-list.reportorized td.revisions-domains, body.providence #revisions-list.reportorized td.revisions-page{font-size: 1em}' +
      'body.providence #revisions-list.reportorized td.revisions-notes{font-size: .85em}' +
      'body.providence #revisions-list.reportorized td.revisions-page .revisions-page-title, body.providence #revisions-list.reportorized td.revisions-tags .revisions-tags-tag, body.providence #revisions-list.reportorized td.revisions-notes .revisions-notes-note{display: block}' +
      'body.providence #revisions-list.reportorized td.revisions-notes, body.providence #revisions-list.reportorized td.revisions-page{max-width: 500px;word-break: break-word;white-space: normal;}' +

      '.details-wrapper{max-height: calc(100% - 50px); overflow-y: auto;}' +

      //Advisor notes
      '#advisor-details{overflow: unset !important}' +
      '.sidebar-module, .sidebar-module *{ transition: 0.5s top, 0.5s right, 0.5s width, 0.5s height}' +
      '.sidebar-module{cursor: pointer; overflow: hidden; position: absolute; top: 0px; right: -25px; background: #f9f9f9; width: 25px; height: 90px; box-shadow: 1px 1px 1px #bdbdbd; color: #9c9c9c; border-radius: 0 5px 5px 0;}' +
      '.sidebar-module:is(:focus, :focus-within){cursor: auto;right: -300px; width: 300px; height: 100%;}' +
      '.sidebar-module .sidebar-module-icon{top: -5px; position: absolute; left: 12px; opacity: 1; transform: rotate(90deg); transform-origin: left; display: flex; width: 150px;}' +
      '.sidebar-module .sidebar-module-icon span{left: 10px; position: relative;}' +
      '.sidebar-module .sidebar-module-icon i{top: 4px; position: relative;}' +
      '.sidebar-module:is(:focus, :focus-within) .sidebar-module-icon{left: -50px; opacity: 0}' +
      '.sidebar-module .sidebar-module-wrapper{position: absolute; top: 0;left:0; opacity: 0; width: 100%; display: flex; flex-flow: column;height: 100%;}' +
      '.sidebar-module:is(:focus, :focus-within) .sidebar-module-wrapper{opacity: 1;}' +
      '.sidebar-module-header{font-size: 1.5em; text-align: center; padding: 10px; background: rgba(210,210,210,0.5); width: 100%; box-shadow: 0px 5px 10px 0px rgb(0 0 0 / 20%); border-bottom: 1px solid #cecece; color: #4d4d4d;}' +
      '.sidebar-module-body{flex: 1; overflow: auto;}' +
      '.sidebar-module-message{ margin: 15px 10px; position: relative; overflow: hidden;}' +
      '.sidebar-module-message-info{ display: flex; align-items: center;justify-content: space-between;background: #4d4d4d;padding: 5px;border-radius: 5px 5px 0 0;}' +
      '.sidebar-module-message-info span{ font-size: .6875em;line-height: 1;color: rgba(255,255,255,0.6);}' +
      '.sidebar-module-message-content{color: #2d2d2d; background: #fefefe;padding: 5px;border-radius: 0 0 5px 5px;word-break: break-word;font-size: .8em; white-space: pre-wrap}' +
      '.sidebar-module-footer{background: rgba(255,255,255,0.5);padding: 5px;box-shadow: 0 -5px 10px 0px rgb(0 0 0 / 18%);}' +
      '.sidebar-module-footer input{font-size: .8em; margin-top: 0px; margin-bottom: 0px; height: 24px; width: 80%; position: relative;padding-left: 2px;}' +

      '.sidebar-module.advisor-notes:is(:focus, :focus-within){z-index: 1;}' +
      '.sidebar-module.advisor-statuses{top: 90px;}' +
      '.sidebar-module.advisor-statuses:is(:focus, :focus-within){top: 0; z-index: 1;}' +
      '.sidebar-module.advisor-statuses .sidebar-module-message .sidebar-module-message-icon {position: absolute; width: 20px; height: 20px; bottom: 1px; right: -50px; color: #111; opacity: 0; transition: .3s all ease-in-out;  font-size: .85em; cursor: pointer;}' +
      '.sidebar-module.advisor-statuses .sidebar-module-message:is(:hover) .sidebar-module-message-icon {opacity: .5; right: -4px;}' +
      '.sidebar-module.advisor-statuses .addStatus-input{width: 100%; padding: 5px;font-size: .9em;}' +
      '.sidebar-module.advisor-statuses .addStatus-button{width: 100%;}' +

      '.sidebar-module.advisor-notes .sidebar-module-message{height: calc(100% - 30px)}' +
      '.sidebar-module.advisor-notes .sidebar-module-message-content{height: 100%;}' +
      '.sidebar-module.advisor-notes .sidebar-module-message-content textarea{ color: #2b2b2b}' +
      '.sidebar-module.advisor-notes .updateNotes-button{width: 100%}' +

      //Chat
      '.chat-search{ position: absolute; top: 4px; right: 4px; }'+
      '.chat-search-icon{ color: #626262; font-size: 0.75em; position: relative; }'+
      '.chat-search-input-wrapper{transition: all 0.3s; position: absolute; top: -50px; right: 0px; width: 250px; background: white; padding: 10px; border-radius: 10px; border: 1px solid #cccccc; box-shadow: 1px 1px 1px #3a3a3a; z-index: 99; }'+
      '.chat-search:focus-within .chat-search-input-wrapper{ top: 0px; }'+
      '.chat-search-input-wrapper input{ width: 200px; }'+
      '.chat-search-input-search { position: absolute; top: 0; right: 0; width: 30px; height: 100%; background: rgba(0,0,0,0.3); font-size: 1.3em; border-radius: 1px 10px 10px 1px; display: flex; flex-flow: column nowrap; justify-content: center; align-items: center;}'+
      '.chat-search-input-search:hover{ cursor: pointer; }'+
      '.chat-search-input-search i { color: #6c6c6c; }'+
      '.chat-search-results{font-size: 0.5em; color: #c20000}'+


      //Night Themed
      'body.providence.nightMode h1{color: #efefef}' +
      'body.providence.nightMode .settings-wrapper h1, body.providence.nightMode .archives-wrapper .archives-header h1{color: #2d2d2d}' +

      'body.providence.nightMode .search-help{background-color: #4c4c4c}' +

      'body.providence.nightMode #providence-wrapper{background-color: #2d2d2d; color: #efefef}' +
      'body.providence.nightMode .review-title .title span.meta {color: #efefef; }' +
      'body.providence.nightMode #killswitch, body.providence.nightMode .review-submission.showing{border-top: 2px solid #4c4c4c;}' +
      'body.providence.nightMode .providence-pending--title, body.providence.nightMode .providence-pending, body.providence.nightMode .providence-overview--toolbar, body.providence.nightMode .advisor-card .card-action {border-color: #424242;}' +
      'body.providence.nightMode #advisors-list th, body.providence.nightMode #advisorsList th, body.providence.nightMode #content-list th, body.providence.nightMode #content-list-admin th, body.providence.nightMode #revisions-list th, body.providence.nightMode #custom-content-list th, body.providence.nightMode #officerReports th {background: #03182e;}' +
      'body.providence.nightMode .providence-overview--nav a.active, body.providence.nightMode .providence-overview--nav a:hover {color: #efefef;}' +
      'body.providence.nightMode .review-filter th, .review-filter .active {color: #afafaf;}' +
      'body.providence.nightMode #providence-wrapper .search-bar table.table thead th{font-family: "CircularXXWeb-Medium",Helvetica,Arial,sans-serif;background: #03182e;padding: 2rem 27px 2rem 15px;vertical-align: middle;border: none; border-left: 2px solid #2d2d2d; border-bottom: 2px solid #2d2d2d;}' +


      'body.providence.nightMode .table{background-color: #212121;}' +
      'body.providence.nightMode .table tbody tr{background-color: #212121}' +
      'body.providence.nightMode #advisors-list tbody>tr:hover, body.providence.nightMode #advisorsList tbody>tr:hover, body.providence.nightMode .search-bar tr:hover, body.providence.nightMode #content-list tbody>tr:hover, body.providence.nightMode #content-list-admin tbody>tr:hover, body.providence.nightMode #revisions-list tbody>tr:hover, body.providence.nightMode #custom-content-list tbody>tr:hover, body.providence.nightMode #officerReports tbody>tr:hover {background-color: #333333;}' +
      'body.providence.nightMode .table span.advisor-tags, body.providence.nightMode .table td.has-date {color: #ddd;}' +
      'body.providence.nightMode .table td, body.providence #advisors-list th, body.providence.nightMode #advisorsList th, body.providence.nightMode #content-list th, body.providence.nightMode #content-list-admin th, body.providence.nightMode #revisions-list th, body.providence.nightMode #custom-content-list th, body.providence #officerReports th { border-color: #2d2d2d!important;}' +
      'body.providence.nightMode th.sorting_desc, body.providence.nightMode th.sorting_asc { color: #08aeea !important;}' +
      'body.providence.nightMode .table td.has-assignment .is-select .form-item--control {background-color: #2d2d2d; color: #efefef;}' +
      'body.providence.nightMode .table .chip--editing {color: #888 !important;background-color: #444 !important;}' +

      'body.providence.nightMode .advisor-card{background-color: #212121; box-shadow: none}' +
      'body.providence.nightMode .advisor-card h4, body.providence.nightMode .advisor-card span.submitted, body.providence.nightMode .advisor-card .card-extras p:not(.cardImportantTags) {color: #efefef}' +
      'body.providence.nightMode .advisor-card .card-extras {background-color: #2d2d2d}' +
      'body.providence.nightMode tr:not(.active) .filter-cards, body.providence.nightMode tr:not(::hover) .filter-cards, body.providence.nightMode .review-filter th { color: rgb(140 140 140 / 80%);}' +
      'body.providence.nightMode .providence-overview--filter .filter-dropdown--title {background-color: #03172f}' +

      'body.providence.nightMode #advisor-details, body.providence.nightMode #killswitch, body.providence.nightMode .providence--page-title {background-color: #212121;box-shadow: none;}' +
      'body.providence.nightMode .dataTables_filter input, body.providence.nightMode .form-control, body.providence.nightMode .reports-toolbar .form .form-item.is-darker .form-item--control{background-color: #212121; color: #efefef;}' +

      'body.providence.nightMode .changes-header{background-color: #212121;}' +
      'body.providence.nightMode .changes-header{background-color: #414141;box-shadow: none}' +

      'body.providence.nightMode .review-item .title-wrapper .title, body.providence.nightMode .changes-list h3 {color: #efefef !important}' +
      'body.providence.nightMode .review-item {background-color: #414141; border-color: #494949;}' +
      'body.providence.nightMode .review-item .title-wrapper a.review-url, body.providence.nightMode .review-item .title-wrapper span.description {color: #bdbdbd}' +
      'body.providence.nightMode .review-submission {background-color: #2d2d2d}' +
      'body.providence.nightMode .review-submission .rejected-count, body.providence.nightMode .review-submission .pending-count, body.providence.nightMode .review-submission .approved-count{color: #aaa}' +
      'body.providence.nightMode .review-title, body.providence.nightMode .review-title .go-back{ background-color: #2d2d2d; border-color: #4c4c4c;}' +
      'body.providence.nightMode .review-title .go-back a{color: #efefef;}' +
      'body.providence.nightMode .review-title .go-back span::after {border-color: #efefef;}' +
      'body.providence.nightMode .review-item__status {border-color: #4c4c4c;}' +
      'body.providence.nightMode .review-item-note-rejection span, body.providence.nightMode .review-item-note span{color: #888888}' +
      'body.providence.nightMode .toggle-group p {color: #888;}' +

      'body.providence.nightMode .sidebar-module{background: #414141; box-shadow: 1px 1px 1px #656565; color: #fff}' +
      'body.providence.nightMode .sidebar-module-message-info{ background: #4d4d4d;}' +
      'body.providence.nightMode .sidebar-module-message-info span{ color: rgba(255,255,255,0.6);}' +
      'body.providence.nightMode .sidebar-module-header{background: rgba(0,0,0,0.5); width: 100%; box-shadow: 0px 5px 10px 0px rgb(0 0 0 / 20%); border-bottom: 1px solid #2d2d2d;color: #fff;}' +
      'body.providence.nightMode .sidebar-module-message-content{color: #2d2d2d; background: #fefefe;}' +
      'body.providence.nightMode .sidebar-module-footer{background: rgba(0,0,0,0.5);}' +

      //TODO: Add Dark mode for chat?

      '</style>');


   if (localStorage.getItem("nightMode") == "true")
      $(".providence").addClass("nightMode");

   $("#header .tot_dropdown .tot_droplist ul").first().prepend('<li class="nightModeToggle"><a href="#">Toggle Night Mode</a></li>');
   $(".nightModeToggle").on('click', function () {
      $(".providence").toggleClass("nightMode");
      localStorage.setItem('nightMode', $(".providence").hasClass("nightMode"));
   });

   //Chat changes
   $(".open-chat").on("click", function () {

      //Wait for the chat to initialize (2s)
      setTimeout(() => {

         var advisorId = $(".recent-chats").find("li.active a").first().attr("data-advisor_id") || $("#open-chat").data("advisor_id");

         //When the chat gets opened, display saved message
         if (localStorage.getItem('savedChatMsg') && localStorage.getItem('savedChatMsg') != 'null' && localStorage.getItem('savedChatMsg') != 'undefined') {
            $($("#chatMessage").find(".fr-wrapper")).removeClass("show-placeholder");
            $($("#chatMessage").find(".fr-element")).html(localStorage.getItem('savedChatMsg'));
         }

         //When the chat gets closed, save the message
         $(".close-chat").on("click", function () {
            localStorage.setItem('savedChatMsg', $($("#chatMessage").find(".fr-element")).html());
         });

         //When message is sent remove from saved message
         $(".chat-tools").find(".send-message").on('click', function () {
            localStorage.setItem('savedChatMsg', null);
            $("#loadLastMessage").hide();
         });

         //Get currently opened chat's advisor id, and add the icon
         $(".chat-wrapper .tot_tip").after('<a target="_blank" href="/manage/advisor/' + advisorId + '" class="tot_tip bottom view-profile-chat" data-content="View Profile" style="position: absolute;top: 0;right: 60px;height: 20px;width: 20px;margin: 25px 20px;z-index: 1;color: #909090;font-size: 1.1em;"><i class="fas fa-user"></i></a>');

         // If the chat is changed, grab the new advisor id and update the icon's link
         $(".recent-chats, .all-chats").find("li").off().on("click", function (e) {
            var advisorClickedId = $(this).find("a").first().attr("data-advisor_id");
            $(".view-profile-chat")[0].href = '/manage/advisor/' + advisorClickedId;
            setTimeout(() => {
               manageChatRejections(advisorClickedId);
            }, 1000);
         });

         //Wait for the chat to initialize
         setTimeout(() => {
            manageChatRejections(advisorId);
         }, 1000);


         // Add search icon
         $(".chat-users-list-wrapper").append('<a href="#" class="chat-search" > <i class="fas fa-search chat-search-icon"></i> <div class="chat-search-input-wrapper"> <input type="text" placeholder="Search Name"> <div class="chat-search-input-search"> <i class="fas fa-search"></i><div class="chat-search-results"></div> </div> </div> </a>')
         $(".chat-search-input-wrapper input").off().on("keyup", delay(e=>{
            let searchName = $(".chat-search-input-wrapper input").val()
            if(searchName.length >= 3)
               $(".chat-search-input-search i").click()
            else
               $(".chat-search-results").html("")
               
         }, 500))
         $(".chat-search-input-search i").off().on("click", function(){
            let searchName = $(".chat-search-input-wrapper input").val().toLowerCase()
            let results = $(".chat-users-list-wrapper .user").filter((i,el) => el.getAttribute("data-content").toLowerCase().indexOf(searchName) >=0)
            if(results.length == 1)
               results.find("a").first().click()
            
            $(".chat-search-results").html(results.length)
            if(searchName.length == 0 || results.length == 1)
               $(".chat-search-results").html("")
         })

      }, 3000);
   });

   //Get the URL Parts
   let urlParts = window.location.href.split("/");

   //If currently reviewing
   if ((urlParts.length > 4 && urlParts[4] === "advisor") || (urlParts.length > 4 && urlParts[4] === "advisor#")) {

      //Add p on side for Advisor Tags
      $($(".details-wrapper").find("header")).append('<p class="secondary center advisor-tags" style="font-size: .8em"></p>');
      let advisorId = urlParts[urlParts.length - 1];
      if (advisorId[advisorId.length - 1] == '#')
         advisorId = advisorId.substr(0, advisorId.length - 1);

      //Get advisor
      let advisor = getAdvisorInfoByID(advisorId);

      //Create string with tags
      let tags = "";
      if (advisor && advisor.settings && advisor.settings.broker_tags)
         advisor.settings.broker_tags.forEach(function (e) {
            tags += "<br>" + e.name;
         });

      //Add tags
      $(".advisor-tags").html(tags.substr(4, tags.length));
      if (advisor && advisor.email)
         $(".advisor-quick-links").append('<a href="/manage/revisions?email=' + encodeURIComponent(advisor.email) + '" class="btn pill secondary btn--action-default" style="max-width: unset">View Revisions</a>');

      $(".advisor-actions").append('<li><a href="https://' + advisor?.site?.settings?.subdomain + '.app.twentyoverten.com" class="tot_tip top center" data-content="View Preview Website"><svg id="icon-preview-website" viewBox="0 0 24 24" class="action-icon"> <path d="M8.617,12.682H5.9a6.149,6.149,0,0,0,4.544,5.258,12.465,12.465,0,0,1-1.207-2.378A9.792,9.792,0,0,1,8.617,12.682Z"> </path> <path d="M10.444,6.062A6.147,6.147,0,0,0,5.9,11.318H8.617A10.69,10.69,0,0,1,10.444,6.062Z"></path> <path d="M9.981,11.32h4.038A8.453,8.453,0,0,0,13.8,9.956a9.382,9.382,0,0,0-.376-1.207,10.325,10.325,0,0,0-.479-1.036q-0.271-.511-0.49-0.841T12,6.237q-0.235.3-.45,0.637t-0.49.844a9.048,9.048,0,0,0-.858,2.24A8.275,8.275,0,0,0,9.981,11.32Z"> </path> <path d="M12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0Zm7.242,13.947a7.416,7.416,0,0,1-1.843,3.26,7.431,7.431,0,0,1-1.457,1.18,7.514,7.514,0,0,1-1.728.781,7.408,7.408,0,0,1-1.925.327Q12.192,19.5,12,19.5t-0.288-.005a7.514,7.514,0,0,1-6.235-3.787,7.6,7.6,0,0,1-.719-1.76,7.461,7.461,0,0,1,0-3.893A7.416,7.416,0,0,1,6.6,6.794a7.431,7.431,0,0,1,1.457-1.18,7.514,7.514,0,0,1,1.728-.781,7.408,7.408,0,0,1,1.925-.327Q11.808,4.5,12,4.5t0.288,0.005a7.514,7.514,0,0,1,6.235,3.787,7.6,7.6,0,0,1,.719,1.76A7.461,7.461,0,0,1,19.242,13.947Z"> </path> <path d="M13.556,6.061h0a10.792,10.792,0,0,1,1.833,5.258H18.1A6.149,6.149,0,0,0,13.556,6.061Z"></path> <path d="M13.555,17.94A6.15,6.15,0,0,0,18.1,12.682H15.387A10.782,10.782,0,0,1,13.555,17.94Z"></path> <path d="M14.019,12.682H9.981a8.453,8.453,0,0,0,.221,1.364,9.381,9.381,0,0,0,.376,1.207,10.312,10.312,0,0,0,.479,1.036q0.271,0.511.49,0.841T12,17.765q0.235-.3.453-0.637t0.49-.844a10.017,10.017,0,0,0,.479-1.036,9.631,9.631,0,0,0,.376-1.2A8.274,8.274,0,0,0,14.019,12.682Z"> </path> </svg></a></li>');

      //Load Notes
      let notesLoaded = false;
      $("#advisor-details").prepend('<div class="sidebar-module advisor-notes" tabindex="0" ><div class="sidebar-module-icon"><i class="far fa-pencil-alt"></i><span>Notes</span></div><div class="sidebar-module-wrapper"><div class="sidebar-module-header">Website Notes</div><div class="sidebar-module-body"><div class="sidebar-module-message"><div class="sidebar-module-message-content" style="color: #9a9a9a; border-radius: 10px; "><textarea style="width: 100%;height: 100%;padding: 5px;" class="updateNotes-textarea" placeholder="Loading Notes..."></textarea></div></div></div><div class="sidebar-module-footer"><button class="btn updateNotes-button" style="display: none">Save</button></div></div></div>')
      $(".advisor-notes").on('click', function () { loadNotes() });
      $(".updateNotes-textarea").on("keyup", delay(() => $(".updateNotes-button").show(), 1000));

      let statusesLoaded = false;
      $("#advisor-details").prepend('<div class="sidebar-module advisor-statuses" tabindex="0" ><div class="sidebar-module-icon"><i class="far fa-comments-alt"></i><span>Status</span></div><div class="sidebar-module-wrapper"><div class="sidebar-module-header">Website Status</div><div class="sidebar-module-body"><div class="sidebar-module-message statusPlaceholder"><div class="sidebar-module-message-content" style=" padding: 20px; color: #9a9a9a; border-radius: 10px; text-align:center">Loading Statuses...</div></div></div><div class="sidebar-module-footer"><textarea class="addStatus-input" type="text" placeholder="Add a status"></textarea><button class="btn addStatus-button">Send</button></div></div></div>')
      $(".advisor-statuses").on('click', function () { loadStatuses() });

      //Notes
      $(".updateNotes-button").on('click', function (event) {
         $(".updateNotes-button").text("Updating Notes...");
         updateNotes(advisorId, $(".updateNotes-textarea").val())
            .then(data => {
               $(".updateNotes-button").text("Notes Updated!");
               setTimeout(function () {
                  $(".updateNotes-button").text("Save");
                  $(".updateNotes-button").hide();
               }, 1500);
            })
            .catch(err => {
               $(".updateNotes-button").text("Unable to update notes!");
               setTimeout(function () {
                  $(".updateNotes-button").text("Save");
               }, 1500);
            });
      });

      function loadNotes() {
         if (notesLoaded)
            return;

         getNotes(advisorId)
            .then(notes => {
               notesLoaded = true;
               $(".updateNotes-textarea")[0].placeholder = "There are no notes for this website.\nClick here to add some.";
               if (notes)
                  $(".updateNotes-textarea").val(notes.message)
            })
            .catch(err => {
               $(".updateNotes-textarea")[0].placeholder = "Unable to load notes.";
            });
      }

      // Statuses
      // $(".addStatus-input").on('keyup', function(event){
      //   if((event.keyCode ? event.keyCode : event.which) == '13')
      //       $(".addStatus-button").click();
      // });

      $(".addStatus-button").on('click', function (event) {
         let officer = $("#header").find(".display-name + small").text();
         let message = $(".addStatus-input").val();
         let now = new Date();
         addStatus(advisorId, officer, message)
            .then(data => {
               $(".statusPlaceholder").remove();
               $(".addStatus-input").val("");
               let date = now;
               let term = date.getHours() >= 12 ? 'pm' : 'am';
               date = date.getMonth() + '/' + date.getDate() + '/' + date.getFullYear() + ' - ' + ((date.getHours() % 12) || 12) + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + term;
               $(".sidebar-module.advisor-statuses .sidebar-module-body").append('<div class="sidebar-module-message"><div class="sidebar-module-message-icon"><i class="fas fa-trash-alt"></i></div><div class="sidebar-module-message-info"><span class="sidebar-module-message-name">' + officer + '</span><span class="sidebar-module-message-time" data-time="' + now.getTime() + '">' + date + '</span></div><div class="sidebar-module-message-content">' + message + '</div></div>');
               $(".sidebar-module.advisor-statuses .sidebar-module-body").scrollTop(function () { return this.scrollHeight; });
               $(".sidebar-module-message-icon").off().on('click', function (e) {
                  let confirmation = confirm("Are you sure you want to delete this status?");
                  if (confirmation == true) {
                     let messageModule = $(this).parent();
                     let timeStamp = messageModule.find("[data-time]").data("time");
                     delStatus(advisorId, timeStamp)
                        .then(data => {
                           messageModule.remove();
                        })
                        .catch(err => {
                           alert("Unable to delete status.");
                        })
                  }
               });
            }).catch(err => {
               alert("Unable to add Status")
            });
      });

      function loadStatuses() {
         if (statusesLoaded) {
            $(".sidebar-module.advisor-statuses .sidebar-module-body").scrollTop(function () { return this.scrollHeight; });
            return;
         }

         getStatuses(advisorId)
            .then(statuses => {
               statusesLoaded = true;
               if (statuses.length > 0) {
                  $(".sidebar-module.advisor-statuses .sidebar-module-body").empty();
                  statuses.sort(function (i1, i2) {
                     if (i1.timestamp > i2) return -1;
                     else return 1;
                  }).forEach(item => {
                     let date = new Date(item.timestamp);
                     let term = date.getHours() >= 12 ? 'pm' : 'am';
                     date = date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear() + ' - ' + ((date.getHours() % 12) || 12) + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() + term;
                     $(".sidebar-module.advisor-statuses .sidebar-module-body").append('<div class="sidebar-module-message"><div class="sidebar-module-message-icon"><i class="fas fa-trash-alt"></i></div><div class="sidebar-module-message-info"><span class="sidebar-module-message-name">' + item.officer + '</span><span class="sidebar-module-message-time" data-time="' + item.timestamp + '">' + date + '</span></div><div class="sidebar-module-message-content">' + item.message + '</div></div>');
                  });
                  $(".sidebar-module.advisor-statuses .sidebar-module-body").scrollTop(function () { return this.scrollHeight; });
                  $(".sidebar-module-message-icon").off().on('click', function (e) {
                     let confirmation = confirm("Are you sure you want to delete this status?");
                     if (confirmation == true) {
                        let messageModule = $(this).parent();
                        let timeStamp = messageModule.find("[data-time]").data("time");
                        delStatus(advisorId, timeStamp)
                           .then(data => {
                              messageModule.remove();
                           })
                           .catch(err => {
                              alert("Unable to delete status.");
                           })
                     }
                  });
               } else
                  $(".sidebar-module.advisor-statuses .sidebar-module-message-content").html("There are no statuses for this website.");
            });
      }

      //Scroll down if needed
      setTimeout(function () {

         if (localStorage.getItem("lastReviewed")) {
            let lastReviewed = JSON.parse(localStorage.getItem("lastReviewed"));
            if (lastReviewed && lastReviewed.id == advisorId) {
               // $(".changes-header").append('<a class="backToLastBtn btn btn--action-default-outlined" style="background-color: rgba(0,0,0,0);color: #888">Back to last item</a>');
               // $(".backToLastBtn").on('click', function(){
               localStorage.setItem("lastReviewed", null);
               $([document.documentElement, document.body]).animate({
                  scrollTop: $(".title:contains(" + lastReviewed.title + ")").offset().top - 120
               }, 1000);
               // });
            } else
               localStorage.setItem("lastReviewed", null);
         }
      }, 2000);

      if (localStorage.getItem('IsSiteForward') == "true") {
         $(".changes-header .btn-group").append('<a href="#" class="btn pill btn--action-approve" onclick="approveAll()">Approve All</a><a href="#" class="btn pill btn--action-review" onclick="addNoteToAll()">Add Note to All</a>');
      }

      if($(".changes-list")[0].children.length == 0){
         $("body.providence .review-submission").css("bottom", "100px")
         $(".changes-list").append("<h3>Something was put into draft mode</h3><p>This is a bug in the platform and shouldn't have come in for review.</p>")
      }

      //Add pending review count
      $(".approved-count").after('<div class="approved-count pending-count"><span class="active">' + $(".review-item:not(.approved-status):not(.rejected-status)").length + '</span> Pending Changes</div>');

      //Update pending review count on approve/reject click
      $('.btn--action-approve, .btn--action-reject').on('click', function () {
         $(".pending-count span").html($(".review-item:not(.approved-status):not(.rejected-status)").length);
      })

      $('.btn--action-default.revision-note, .btn--action-reject').on('click', function () {
         let scrollBackTo = $(this);

         setTimeout(delay(e => {

            //Add notes & scroll back down when save is clicked
            $('.settings-wrapper .btn.primary.btn-lg.save, .settings-wrapper .btn.btn-text.cancel').on("click", function () {

               //Wait 2 seconds
               setTimeout(delay(e => {
                  updateAllReviewItemNotes();
                  $([document.documentElement, document.body]).animate({
                     scrollTop: scrollBackTo.offset().top - 120
                  }, 1000);
               }), 1500);
            });
         }), 2000);
      });

      //When archives are opened
      $(".open-archives").on("click", function () {

         //Wait 2 seconds
         setTimeout(() => {

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
         }, 2000);
      });


      updateAllReviewItemNotes();

      function updateAllReviewItemNotes() {
         // For all approved/rejected items get the review information
         $(".review-item").each(async function (i, e) {
            let $e = $(e);
            let reviewId = $e.find(".review-actions").find(".revision-note").data("id");

            //If a review id was found, get the review
            if (reviewId) {
               displayReviewer(baseUrl + 'manage/revisions/' + advisorId + '/' + reviewId, $e, function () {
                  if (!$e.hasClass("approved-status") && !$e.hasClass("rejected-status"))
                     $e.find(".review-item-preview").find(".approvedByNote").text("");
               });
            }
         });
      }

      //For each review item check if it's a link
      $(".review-item").each(function (i, e) {
         if ($(e).find(".review-actions a")[0].innerHTML == "View Link" || $(e).find(".review-actions a")[0].innerHTML == "Review Link") {
            let link = $(e).find(".review-url").text();
            let review = $(e).find(".review-actions a")[0];

            //Indicate if the link is External or Internal
            if (link.indexOf("http") >= 0)
               review.innerHTML = "Visit External Link";
            else if (link.indexOf("#") >= 0) {
               review.innerHTML = "Visit Section Link";
               review.href = review.href.replace('twentyoverten.com/manage/advisor/', '');
            }
            else {
               review.innerHTML = "Navigation Link";
               review.removeAttribute("href");
               review.style = "cursor: no-drop";
               review.classList.add("approve-item");
               review.classList.add("active");
               review.title = "Just a navigation link, has no content.";
            }
         }
      });
   }

   // Revisions Page
   else if ((urlParts.length > 4 && urlParts[4].indexOf("revisions") == 0) || (urlParts.length > 4 && urlParts[4].indexOf("revisions#") == 0)) {

      // Check if an email was provided in the URL
      var email = null;
      var urlParams = new URLSearchParams(window.location.search);
      email = urlParams.get('email');

      //If an email was provided, force a search of the revisions table
      if (email) {
         var prefixs = ["siteforwardprogram+", "digitaladvisorprogram+"];
         prefixs.forEach(prefix => {
            if (email.indexOf(prefix) == 0)
               email = email.substr(prefix.length, email.length);
         });

         // Wait 2 seconds after the page loads to ensure the revisions load
         setTimeout(() => {

            //Search the table, and re-drawn it
            $("#revisions-list").DataTable().search(email).draw();
         }, 2000);
      }

      $(".providence--page-title").after('<a class="btn primary btn--action-review" id="reportorize-btn" style="    position: fixed; z-index:100; bottom: 20px;  right: 20px;">Reportorize It</a>');

      //When DataTable gets drawn
      $('#revisions-list').on("page.dt", function () {
         $("#reportorize-btn")[0].text = "Reportorize It";
      });

      $("#reportorize-btn").on("click", function () {
         $("#revisions-list_filter").hide();
         $(".reports-toolbar").hide();
         if (this.text == "Copy Table") {

            selectElementContents($(".table")[0]);
            document.execCommand('copy');

            function selectElementContents(el) {
               let body = document.body,
                  range, sel;
               if (document.createRange && window.getSelection) {
                  range = document.createRange();
                  sel = window.getSelection();
                  sel.removeAllRanges();
                  range.selectNode(el);
                  sel.addRange(range);

               } else if (body.createTextRange) {
                  range = body.createTextRange();
                  range.moveToElementText(el);
                  range.select();
               }
            }
         } else if (this.text == "Loading...") { }
         else {
            let $tableHeader = $(".dataTable").find("thead");
            if ($tableHeader.find("th:contains(Email)").length == 0) {
               $($tableHeader.find("th")[0]).after('<th>Email</th>');
               $($tableHeader.find("th")[1]).after('<th>Tags</th>');
               $($tableHeader.find("th")[2]).after('<th>Domain</th>');
               $($tableHeader.find("th")[4]).after('<th style="min-width:250px">Page Title</th>');
               $($tableHeader.find("th")[5]).after('<th style="min-width:500px">Note</th>');
               $($tableHeader.find("th")[6]).after('<th style="min-width:500px">Rejections</th>');
               $($tableHeader.find("th")[11]).remove();
            }

            $(".dataTable").find("tbody").find("tr").each(function (i) {
               let $row = $(this);
               let $columns = $row.find("td");
               let data = $(".dataTable").DataTable().row(i).data();

               let advisorId = data.advisor._id,
                  reviewId = data._id,
                  email = data.advisor.email,
                  domain = data.site.settings.domains[0],
                  pageTitle = data.meta && data.meta.name ? data.meta.name + (data.title ? '<span class="revisions-page-title"> (' + data.title + ')</span>' : '') : data.title ? data.title : '',
                  notes = data.internal_notes ? data.internal_notes.replace(/<\/[^>]*>?/gm, '</span>').replace(/<[^>]*>?/gm, '<span class="revisions-notes-note">') : '',
                  rejections = data.notes ? data.notes.replace(/<\/[^>]*>?/gm, '</span>').replace(/<[^>]*>?/gm, '<span class="revisions-notes-note">') : '';

               let allTags = "";
               data.advisor.settings.broker_tags.forEach(i => allTags += "<span class='revisions-tags-tag'>" + i.name + ", </span>");
               allTags = allTags.substr(0, allTags.length - 2);

               $($row.find("td")[0]).after('<td class="revisions-email">' + email + '</td>');
               $($row.find("td")[1]).after('<td class="revisions-tags">' + allTags + '</td>');
               $($row.find("td")[2]).after('<td class="revisions-domains">' + domain + '</td>');
               $($row.find("td")[4]).after('<td class="revisions-page">' + pageTitle + '</td>');
               $($row.find("td")[5]).after('<td class="revisions-notes">' + notes + '</td>');
               $($row.find("td")[6]).after('<td class="revisions-notes">' + rejections + '</td>');
               $row.find(".advisor-tags").remove();
               $row.find("td")[11].remove();

            });

            $(".wrapper").css("width", "100%").css("max-width", "unset").css("margin", "5px");

            $(".dataTable").addClass("reportorized");
            $(".dataTable").css("font-size", ".75em");
            $($(".dataTable").find("thead").find("th")[3]).css("min-width", "150px");

            var btn = this;
            btn.text = "Loading...";
            setTimeout(function () {
               btn.text = "Copy Table";
            }, 1000);
         }
      });
      $("#revisions-list_length").find("option").last().after('<option value="500">500</option><option value="1000">1000</option><option value="2000">2000</option><option value="999999">All</option>');

   }

   // Revieing a review item page
   else if (urlParts.length > 4 && urlParts[4].indexOf("review") == 0) {
      let advisorId = urlParts[urlParts.length - 2];
      let reviewId = urlParts[urlParts.length - 1];

      //Remove any trailing parts of the URL
      if (reviewId[reviewId.length - 1] == '#')
         reviewId = reviewId.substr(0, reviewId.length - 1);

      //Add "View Revision" button and revision notes to the review tools navigation
      if ($(".review-tools").find('a[href="#approve"].active').length > 0 || $(".review-tools").find('a[href="#reject"].active').length > 0) {
         $(".review-tools").append('<a href="' + window.location.href.replace('review', 'revisions') + '" class="btn pill secondary btn-sm primary btn--action-review" target="_blank">View Revision</a>');

         // Doesn't fit nicely
         // displayReviewer(baseUrl+'manage/revisions/' + advisorId + '/' + reviewId, $(".review-title"));
      }
      localStorage.setItem("lastReviewed", JSON.stringify({ id: advisorId, title: $(".title")[0].childNodes[1].nodeValue.trim() }));


      // //Is blog post
      // if($(".title .meta").length > 0){
      //   var title = $(".title")[0].childNodes[1].nodeValue;
      //
      //   $.get(baseUrl+'manage/content/custom', function(){
      //      $(".dataTable").DataTable().rows(function(idx,data,node){
      //        if(data.title == title){
      //          var id = findID;
      //          $.get(baseUrl+'api/content/compliance/'+id, function(){
      //
      //          });
      //        }
      //   });
      // });


      $($(".details-wrapper").find("header")).append('<p class="secondary center advisor-tags"></p>');

      //Get advisor
      let advisor = getAdvisorInfoByID(advisorId);

      //Create string with tags
      let tags = "";
      if (advisor && advisor.settings && advisor.settings.broker_tags)
         advisor.settings.broker_tags.forEach(function (e) {
            tags += "<br>" + e.name;
         });

      //Add tags
      $(".advisor-tags").html(tags.substr(4, tags.length));
      if (advisor && advisor.email)
         $(".advisor-quick-links").append('<a href="/manage/revisions?email=' + encodeURIComponent(advisor.email) + '" class="btn pill secondary btn--action-default" style="max-width: unset">View Revisions</a>');

   }

   //Content Assist page
   else if (urlParts.length > 4 && urlParts[4].indexOf("content") == 0) {
      $("#content-list_wrapper, #custom-content-list_wrapper").prepend(
         '<div class="search-bar">' +
         '<div class="text-control" aria-required="true" style=" margin: 10px 0 0 0; flex-basis: 80%; padding-right: 15px"> ' +
         '<input required type="text" id="search-content" name="search-content" class="form-control" title="Search"> <label for="search-content">Search ( Make sure to set entries to all )</label> ' +
         '<div data-content="Search by Name or Categories &nbsp; &nbsp; - &nbsp; &nbsp; [! = Not] &nbsp; &nbsp; [, = And] &nbsp; &nbsp; [| = Or]" class="tot_tip top  search-help">?</div>' +
         '</div>' +
         '<div class="btn-control" aria-required="true" style=" margin: 0;flex-basis:20%"> ' +
         '<input type="button" style="height:100%;width:100%" class="btn primary btn--action-review" value="Search" id="search-content-btn" data-cover="Search for Content">' +
         '</div>' +
         '<table class="table" style="margin: .5rem 0;  width: 100%"></table>' +
         '</div>');
      $(".add-custom-content").wrap('<div style="display: flex; flex-flow: column">').parent().prepend('<a href="../content" class="btn btn--action-default-outlined add-custom-content" style="margin-bottom: 10px;">Back to Content Assist</a>');
      $("#custom-content-list_length, #content-list_length").find("option").last().after('<option value="200">200</option><option value="500">500</option><option value="999999">All</option>');

      /* $(".providence--advisor-list-nav").append('<a href="#" class=" providence--advisor-list-title"> <span class="chip chip--taken-down content-contentAssist">Content Assist</span> </a>');
      $(".content-contentAssist").on('click', function(){
        $('#search-content').val("Content Assist");
        $("#search-content-btn")[0].click();
      });
      $(".content-leadPilot").on('click', function(){
        $('#search-content').val("Lead Pilot");
        $("#search-content-btn")[0].click();
      });*/


      //When enter is pressed when typing in search
      $('#search-content').on('keyup', delay(e => {
         let searchTerm = $('#search-content').val();
         if ((searchTerm.length > 2 && (searchTerm.indexOf("*") != 0 || searchTerm.indexOf("#") != 0) && getNodes(searchTerm).length < 50) || e.which === 13)
            $("#search-content-btn")[0].click();
         if (searchTerm.length <= 2 && e.which == 8) {
            let table = $(".search-bar table");
            table.empty();

            $("#content-list, #custom-content-list").show();
         }
      }, 500));

      //When search button is clicked
      $("#search-content-btn").on('click', () => {

         let searchTerm = $('#search-content').val();

         let showAll = searchTerm.indexOf("*") === 0;
         let onlyNumber = searchTerm.indexOf("#") === 0;
         if (showAll || onlyNumber)
            searchTerm = searchTerm.substr(1, searchTerm.length);

         //Empty current search results
         let table = $(".search-bar table");
         table.empty();
         table.append('<thead> <tr role="row"><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1">#</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Thumbnail</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Title</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Date Added</th><th class="has-state sorting" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Availability</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="" aria-sort="descending">Status</th><th class="" rowspan="1" colspan="1" aria-label="Actions">Actions</th></tr> </thead>');

         $("#content-list, #custom-content-list").hide();

         //Get all nodes that match the search
         let nodes = getNodes(searchTerm);

         //Inform if no nodes are found
         if (nodes.length === 0) {
            table.append('<tr><td colspan="7">No results found</td></tr>');
         }
         //Display only the number of results
         else if (onlyNumber) {
            table.append('<tr><td colspan="7">Results: (' + nodes.length + ')</td></tr>');
         }
         //Display nodes if under 100 results
         else if (showAll || nodes.length <= 100) {

            //Add nodes to table
            table.append(nodes);
            nodes.forEach(function (e, i) {
               let row = $(table.find("tr")[i + 1]);
               row.prepend('<td>' + (i + 1) + '.</td>');
            });
            table.find("td").css("border", "none");

         }

         //If more than 100 results are found
         else {
            table.append('<tr><td>To many results (' + nodes.length + ')</td></tr>');
         }
      });

      //Get the node results
      function getNodes(searchString) {

         //Apply filter to rows and return new array of rows
         function filter(rows, search) {
            let newRows = [];

            //Perform filter
            rows.forEach(function (rowItem) {
               function matches(item, search, invert) {
                  let match =
                     (item.data().title.toLowerCase().indexOf(search.toLowerCase()) >= 0) ||
                     (item.data()._id.toLowerCase().indexOf(search.toLowerCase()) >= 0) ||
                     (item.data().categories && hasCategory(search.toLowerCase(), item.data())) ||
                     (item.data().availability && item.data().availability.toLowerCase().indexOf(search.toLowerCase()) >= 0)
                     ;

                  function hasCategory(tag, item) {
                     if (item && item.categories)
                        return item ? item.categories.some(e => {
                           return e.name && e.name.toLowerCase().indexOf(tag.toLowerCase()) >= 0;
                        }) : false;
                     return false;
                  }


                  if (invert && !match)
                     return true;
                  else if (!invert && match)
                     return true;
                  else
                     return false;
               }

               let searchTerms = search.split("|");
               let match = false;

               searchTerms.forEach(function (term) {
                  term = term.trim();
                  let invert = term.indexOf("!") === 0;
                  if (invert)
                     term = term.substr(1, search.length);
                  if (matches(rowItem, term, invert))
                     match = true;
               });

               if (match)
                  newRows.push(rowItem);

            });
            return newRows;
         }

         //Split search at every ,
         let searchList = searchString.split(",");

         //Gather rows
         let rows = [];
         $('.dataTable').DataTable().rows().every(function () {
            rows.push(this);
         });
         //Apply filter to current rows(recursion.... sort of...)
         searchList.forEach(function (e) {
            let search = e.trim();

            //Apply filter/search
            rows = filter(rows, search);
         });

         //Turn filtered rows into nodes, clone, and remove useless column
         let nodes = [];
         rows.forEach(e => {
            let node = e.node().cloneNode(true);
            // let select = $(node).find("select");
            // let status = $(node).find("option:selected").text();
            // select.parent().removeClass("is-select");
            // select.parent().css("text-align", "center");
            // select.after(status == "Default" ? "---" : status);
            // select.remove();

            //node.deleteCell(4);
            nodes.push(node);
         });
         return nodes;
      }
   }

   //Home Page
   else {

      //Auto open all advisors
      setTimeout(function () {
         if (!$("#showAllAdvisors").hasClass("active")) {
            $("#showAllAdvisors").click();
            console.log("showing all");
         }
      }, 500);
      //
      // $("#showMyAdvisors").after('<a href="#" id="showMyTeam">My Team</a>');
      // $(".providence-overview--nav a").on('click', function(){
      //   $("#advisorsList_wrapper, .search-bar, .providence-overview--filter").show();
      //   $(".providence-overview--nav .active").removeClass("active");
      //   $(this).addClass("active");
      // })
      // $("#showMyTeam").on('click', function(){
      //     // $("#advisorsList_wrapper, .search-bar, .providence-overview--filter").hide();
      //     if($("#showMyAdvisors").hasClass("active")){
      //       $("#showAllAdvisors").click();
      //     }
      //
      //     $(".providence-overview--nav .active").removeClass("active");
      //     $(this).addClass("active");
      //
      //     let teamCheckFunction;
      //     if(isSiteForward(window.loggedInUser))
      //       teamCheckFunction = isSiteForward;
      //     if(isMLSSalesCompliance(window.loggedInUser))
      //       teamCheckFunction = isMLSSalesCompliance;
      //     if(isMarketConductCompliance(window.loggedInUser))
      //       teamCheckFunction = isMarketConductCompliance;
      //     $
      //     let table = $(".dataTable").DataTable();
      //     let data = table.rows().data().filter(function(e){return isSiteForward(e.officer_id)});
      //     table.clear();
      //     table.rows.add(data);
      //     table.draw();
      //
      // });

      $(".providence-overview--nav a").on('click', function () {
         if ($("#search-advisor").length && $("#search-advisor-btn").length) {
            $('#search-advisor').val("");
            $(".search-bar table").empty();
            $("#advisorsList_wrapper").show();
         }
      });

      //Add search
      $(".providence-overview--list").prepend(
         '<div class="search-bar">' +
         '<div class="text-control" aria-required="true" style=" margin: 10px 0 0 0; flex-basis: 80%; padding-right: 15px"> ' +
         '<input required type="text" id="search-advisor" name="search-advisor" class="form-control" title="Search"> <label for="search-advisor">Search</label> ' +
         '<div data-content="Search for &quot;?&quot; for assistance." class="tot_tip top search-help">?</div>' +
         '</div>' +
         '<div class="btn-control" aria-required="true" style=" margin: 0;flex-basis:20%"> ' +
         '<input type="button" style="height:100%;width:100%" class="btn primary btn--action-review" value="Search" id="search-advisor-btn" data-cover="Search for Advisor">' +
         '</div>' +
         '<table class="table" style="margin: .5rem 0; width: 100%"></table>' +
         '</div>');

      // //Add team filters
      // $(".providence-overview--list").prepend(
      //   '<div class="team-filter-row">'+
      //     '<a href="#" class="team-filter active" id="team-filter-all">All</a>'+
      //     '<a href="#" class="team-filter" id="team-filter-sf">SiteForward</a>'+
      //     '<a href="#" class="team-filter" id="team-filter-mls">MLS Compliance</a>'+
      //     '<a href="#" class="team-filter" id="team-filter-msi">MSI Compliance</a>'+
      //     '<a href="#" class="team-filter" id="team-filter-hold">On Hold</a>'+
      //   '</div>'
      // );

      $("#advisorsList_length").find("option").last().after('<option value="200">200</option><option value="500">500</option><option value="999999">All</option>');

      //When enter is pressed when typing in search
      $('#search-advisor').on('keyup', delay(e => {
         let searchTerm = $('#search-advisor').val();
         if (searchTerm.length > 2 || searchTerm == "?" || e.which === 13)
            $("#search-advisor-btn")[0].click();
         if (searchTerm.length <= 2 && e.which == 8) {
            let table = $(".search-bar table");
            table.empty();
            $("#advisorsList_wrapper").show();
         }
      }, 500));
      //
      // $(".providence-overview--nav a").on('click', function(){
      //   $(".providence-overview--list").removeClass("loadedAll");
      //   $(".team-filter").removeClass("active");
      //   $(".team-filter")[0].classList.add("active");
      // })
      // $(".team-filter").on('click', function(){
      //
      //   $(".team-filter.active").removeClass("active");
      //   $(this).addClass("active");
      //   $(".dataTable").DataTable().draw();
      //
      // });

      //When search button is clicked
      $("#search-advisor-btn").on('click', () => {

         let searchTerm = $('#search-advisor').val();
         if (searchTerm.length > 0) {

            let showAll = searchTerm.indexOf("*") === 0;
            let onlyNumber = searchTerm.indexOf("#") === 0;
            if (showAll || onlyNumber)
               searchTerm = searchTerm.substr(1, searchTerm.length);

            //Empty current search results
            let table = $(".search-bar table");
            $("#advisorsList_wrapper").hide();
            table.empty();
            table.append('<thead> <tr role="row"><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1">#</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Name</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Email</th><th class="has-state sorting" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Status</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="" aria-sort="descending">Last Submitted</th><th class="" rowspan="1" colspan="1" aria-label="Assigned">Assigned</th><th class="" rowspan="1" colspan="1" aria-label="Actions">Actions</th></tr> </thead>');

            //Get all nodes that match the search
            let nodes = getNodes(searchTerm);

            //Inform if no nodes are found
            if (searchTerm.toLowerCase() == "?") {
               table.empty();
               table.append('<tr><td><h1>Searching can be done by Name, Email, Tags, Status, or Officer.</h1> <table style="width: 100%"><tr><th>Expressions</th><th>Results</th><th>Example</th></tr> <tr><td>|</td><td>OR</td><td>Published|Submitted</td></tr> <tr><td>,</td><td>AND</td><td>Published,SiteForward</td></tr> <tr><td>!</td><td>NOT</td><td>!Published</td></tr></table><h1>There are some extra searching as well</h1><table style="width: 100%"><tr> <th>Search</th> <th>Results</th> <th>Example</th> </tr> <tr> <td>published</td> <td>Shows all published sites</td> <td></td> </tr> <tr> <td>submitted</td> <td>Shows all submitted sites</td> <td></td> </tr> <tr> <td>approved</td> <td>Shows all approved sites</td> <td></td> </tr> <tr> <td>pending review</td> <td>Shows all sites needing revisions</td> <td></td> </tr> <tr> <td>revisions needed</td> <td>Shows all published sites</td> <td></td> </tr> <tr> <td>rejected</td> <td>Shows all rejected sites</td> <td></td> </tr> <tr> <td colspan="3"></td> </tr> <tr> <td>is_siteforward</td> <td>Shows all sites assigned to SiteForward</td> <td></td> </tr> <tr> <td>is_compliance</td> <td>Shows all sites assigned to Compliance</td> <td></td> </tr> <tr> <td>is_mlssalescompliance</td> <td>Shows all sites assigned to MLS Sales Communication</td> <td></td> </tr> <tr> <td>is_marketconductcompliance</td> <td>Shows all sites assigned to Market Conduct</td> <td></td> </tr> <tr> <td>is_onhold</td> <td>Shows all sites on hold</td> <td></td> </tr> <tr> <td colspan="3"></td> </tr> <tr> <td>created_at:&lt;year&gt;/[month]/[day]</td> <td>Shows sites created at that time</td> <td>created_at:2019/08</td> </tr> <tr> <td>updated_at:&lt;year&gt;/[month]/[day]</td> <td>Shows sites updated at that time</td> <td>created_at:2019/08/01</td> </tr> <tr> <td>published_at:&lt;year&gt;/[month]/[day]</td> <td>Shows sites published at that time</td> <td>created_at:2020</td> </tr> <tr> <td>submitted_at:&lt;year&gt;/[month]/[day]</td> <td>Shows sites submitted at that time</td> <td>created_at:2020/01</td> </tr> <tr> <td colspan="3"></td> </tr> <tr> <td>#</td> <td>Shows the number of sites that match</td> <td>#Published</td> </tr> <tr> <td>*</td> <td>Shows all sites that match regardless of number</td> <td>*Published</td> </tr>');
            } else if (nodes.length === 0) {
               table.append('<tr><td colspan="7">No results found</td></tr>');
            }
            //Display only the number of results
            else if (onlyNumber) {
               table.append('<tr><td colspan="7">Results: (' + nodes.length + ')</td></tr>');
            }
            //Display nodes if under 100 results
            else if (showAll || nodes.length <= 100) {

               //Add nodes to table
               let tbody = $("<tbody></tbody>")
               tbody.append(nodes)
               table.append(tbody);
               nodes.forEach(function (e, i) {
                  let row = $(table.find("tr")[i + 1]);
                  row.prepend('<td>' + (i + 1) + '.</td>');
               });
               table.find("td").css("border", "none");

               //Update action menu
               updateList(".search-bar");
               updateCustomEvents();
               updateOfficerList();
            }

            //If more than 100 results are found
            else {
               table.append('<tr><td colspan="7">To many results (' + nodes.length + ')</td></tr>');
            }
         } else {
            $("#advisorsList_wrapper").show();
         }
      });

      //When DataTable gets drawn
      $('#advisorsList').on("draw.dt", delay(e => {
         if (
            //$(".team-filter.active").text().indexOf("All") >= 0 &&
            $("#showAllAdvisors").hasClass("active")) {

            $(".providence-overview--list").addClass("loadedAll");

            updateAdvisorInfo();
            // tableData = $(".dataTable").DataTable().data();
         }

         updateList();
         updateCustomEvents();
         updateOfficerList();
         updateSlider();
         sort();
      }, 750));

      //Filter warning
      if ($(".filter-warning").length)
         $(".filter-warning").remove();

      if ($(".filter-dropdown--options input:checked").length && !$(".filter-warning").length)
         $("header").prepend('<div class="filter-warning">Caution: You have a filter enabled</div>');

      //Get the node results
      function getNodes(searchString) {

         //Apply filter to rows and return new array of rows
         function filter(rows, search) {
            let newRows = [];

            //Perform filter
            rows.forEach(function (rowItem) {
               function matches(item, search, invert) {
                  search = search.replace("&", "&amp;").toLowerCase();
                  let match = item.data().display_name.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
                     item.data().email.toLowerCase().indexOf(search) >= 0 ||
                     item.data()._id.toLowerCase().indexOf(search) >= 0 ||
                     ("published".indexOf(search) >= 0 && item.data().published_date != "NA") ||
                     ("submitted".indexOf(search) >= 0 && item.data().submitted_date != "NA") ||
                     ("not published".indexOf(search) >= 0 && notPublished(item.data())) ||
                     (search.indexOf("created_at:") >= 0 && matchesDate(search.toLowerCase().substring(search.indexOf(":") + 1), "created_at", item.data())) ||
                     (search.indexOf("updated_at:") >= 0 && matchesDate(search.toLowerCase().substring(search.indexOf(":") + 1), "updated_at", item.data())) ||
                     (search.indexOf("published_at:") >= 0 && matchesDate(search.toLowerCase().substring(search.indexOf(":") + 1), "published_at", item.data())) ||
                     (search.indexOf("submitted_at:") >= 0 && matchesDate(search.toLowerCase().substring(search.indexOf(":") + 1), "submitted_at", item.data())) ||
                     hasTag(search, item.data()) ||
                     hasStatus(search, item.data()) ||
                     ("advisor revisions needed".indexOf(search) >= 0 && hasStatus("review completed", item.data())) ||
                     getOfficerName(item.data().officer_id).toLowerCase().indexOf(search) >= 0 ||
                     ("is_siteforward".indexOf(search) >= 0 && isSiteForward(item.data().officer_id)) ||
                     ("is_compliance".indexOf(search) >= 0 && isCompliance(item.data().officer_id)) ||
                     ("is_mlssalescompliance".indexOf(search) >= 0 && isMLSSalesCompliance(item.data().officer_id)) ||
                     ("is_marketconductcompliance".indexOf(search) >= 0 && isMarketConductCompliance(item.data().officer_id)) ||
                     ("is_onhold".indexOf(search) >= 0 && isOnHold(item.data().officer_id));

                  if (invert && !match)
                     return true;
                  else if (!invert && match)
                     return true;
                  else
                     return false;
               }

               function isRandysList(item) {
                  return (
                     (isSiteForward(item.officer_id) && hasStatus("review completed", item))
                     || isCompliance(item.officer_id) && (hasStatus("editing", item)
                        || hasStatus("review completed", item)))
                     || isOnHold(item.officer_id);
               }

               let searchTerms = search.split("|");
               let match = false;
               if (search.indexOf(".") == 0 && search.length == 1)
                  match = isRandysList(rowItem.data());
               else {

                  searchTerms.forEach(function (term) {
                     term = term.trim();
                     let invert = term.indexOf("!") === 0;
                     if (invert)
                        term = term.substr(1, search.length);
                     if (matches(rowItem, term, invert))
                        match = true;
                  });
               }

               if (match)
                  newRows.push(rowItem);

            });
            return newRows;
         }

         //Split search at every ,
         let searchList = searchString.split(",");

         //Gather rows
         let rows = [];
         $('#advisorsList').DataTable().rows().every(function () {
            rows.push(this);
         });

         //Apply filter to current rows(recursion.... sort of...)
         searchList.forEach(function (e) {
            let search = e.trim();


            //Apply filter/search
            rows = filter(rows, search);
         });

         //Turn filtered rows into nodes, clone, and remove useless column
         let nodes = [];
         rows.forEach(e => {
            let node = e.node().cloneNode(true);

            // node.deleteCell(3);
            nodes.push(node);
         });
         return nodes;
      }

      //Apply sort to slider cards
      function sort() {

         // Get the time in minutes
         function getTime(time) {
            //months (2 months)
            if (time.indexOf("month") > 0) {
               if (time.split(" ")[0].indexOf("a") >= 0)
                  time = 1;
               else {
                  time = time.split(" ")[0];
               }
               time = parseInt(time) * 60 * 24 * 30;
            }
            //Days (2 Days/a few days)
            else if (time.indexOf("day") > 0) {
               if (time.split(" ")[0].indexOf("a") >= 0)
                  time = 1;
               else {
                  time = time.split(" ")[0];
               }
               time = parseInt(time) * 60 * 24;
            }
            //Hours (2 Hours/a few hours)
            else if (time.indexOf("hour") > 0) {
               if (time.split(" ")[0].indexOf("a") >= 0)
                  time = 1;
               else
                  time = time.split(" ")[0];
               time = parseInt(time) * 60;
            }
            //Minutes (2 minutes / a few minutes)
            else {
               if (time.split(" ")[0].indexOf("a") >= 0)
                  time = 1;
               else
                  time = parseInt(time);
            }
            return time;
         }

         //Sort advisor slide list
         $(".advisor-card").sort((a, b) => {
            a = $(a);
            b = $(b);

            //Get advisor name from cards
            let nameA = a.data("name"),
               nameB = b.data("name");

            //Load advisor info from DataTable
            let infoA = getAdvisorInfo(nameA),
               infoB = getAdvisorInfo(nameB);

            //Get current times for both cards in minutes
            let timeA = getTime(a.find(".submitted").text()),
               timeB = getTime(b.find(".submitted").text());

            // Check if either card is a construction page
            let isConstructionA = hasTag("Construction", infoA),
               isConstructionB = hasTag("Construction", infoB);

            //Construction Pages come first
            if (isConstructionA && !isConstructionB)
               return -1;
            else if (isConstructionB && !isConstructionA)
               return 1;

            //Compare time
            return (timeA < timeB) ? 1 : (timeA > timeB) ? -1 : 0;
            // return 0;

         })

            //Add each element back in the new order
            .each(function () {
               $(".providence-pending--list").append(this)
            });

      }

      //Add OptGroups to officer select
      function updateOfficerList() {
         $(".form-item--control.assigned_officer").each(function (fi, fe) {

            if (!$(fe).hasClass("optGroupsAdded")) {

               let officers = {
                  'Miscellaneous': [],
                  'SiteForward': [],
                  'MLS Sales Communication': [],
                  'Market Conduct Compliance': [],
                  'Other': []
               };
               $(fe).find("option").each(function (i, e) {

                  let id = e.value.substr(e.value.indexOf('|') + 1);

                  if (isSiteForward(id)) {
                     officers['SiteForward'].push($(this));
                  } else if (isMLSSalesCompliance(id)) {
                     officers['MLS Sales Communication'].push($(this));
                  } else if (isMarketConductCompliance(id)) {
                     officers['Market Conduct Compliance'].push($(this));
                  } else if (isMiscellaneous(id)) {
                     officers['Miscellaneous'].push($(this));
                  } else {
                     officers['Other'].push($(this));
                  }
               });
               for (let [key, value] of Object.entries(officers)) {
                  if (key != "Other" || (key == "Other" && officers["Other"].length > 0)) {
                     let group = '<optgroup style="padding-top: 4px;" label="' + key + '">';
                     value.forEach(function (item) {
                        let id = item[0].value.substr(item[0].value.indexOf('|') + 1);

                        if (isNotActive(id)){
                           item = item.css("color", "#888");
                           item[0].disabled = "true"
                        }

                        group += item[0].outerHTML;
                        item.remove();
                     });
                     $(this).append(group);
                  }
               }
               $(fe).addClass("optGroupsAdded");
            }
         });
      }
   }
});

function manageChatRejections(advisorId) {
   console.log(advisorId)
   getRejections(advisorId)
      .then(rejections => {
         $(".rejection-notice").each(function () {
            let rejectionItem = rejections.find(item => { return item.rejectionId == $(this).data("id") }) || []
            $(this).find(".rejected-item").each(function (i, rejectionWrapper) {
               console.log(rejectionItem);
               let isCompleted = rejectionItem?.rejection ? rejectionItem.rejection[i] : false;
               $(this).prepend('<input class="rejection-completed"' + (isCompleted ? 'checked=true' : '') + ' type="checkbox">');
            })
         });
         $(".rejection-completed").off().on("change", function () {
            let index = Array.prototype.indexOf.call(this.parentNode.parentNode.children, this.parentNode);
            let rejectionId = $(this).parent().parent().parent().parent().data("id");
            let rejectionArray = [];
            $(this).parent().parent().find(".rejected-item").each(function (e, item) {
               rejectionArray.push($(item).find(".rejection-completed")[0].checked ? true : false);
            });
            updateRejection(advisorId, rejectionId, rejectionArray);
         })
      })
      .catch(err => {
         console.log(err);
      });
}

function approveAll() {
   $(".approve-item").click();
}

function addNoteToAll() {
   var notes = $(".revision-note");
   noteIndex = -1;
   var note = prompt("Add your note",);
   if (note != null)
      addNote(function () {
         location.reload();
      });

   function addNote(cb) {
      noteIndex++;
      var note = notes[noteIndex];
      if (note)
         addNoteIn(notes[noteIndex], () => addNote(cb));
      else
         cb();
   }

   function addNoteIn(e, cb) {
      e.click();

      var overlay = $("#revision-note-overlay");
      waitForStyle(true, overlay, "display", "block", function () {
         waitForClass(false, overlay, "velocity-animating", function () {
            setTimeout(function () {
               overlay.find(".fr-element.fr-view").html(note);
               overlay.find(".save").click();
               waitForClass(true, overlay, "velocity-animating", function () {
                  waitForClass(false, overlay, "velocity-animating", function () {
                     waitForStyle(true, overlay, "display", "none", function () {
                        cb();
                     });
                  });
               });
            }, 1000);
         });
      });
   }
}

function matchesDate(date, key, advisor) {
   let isList = date.indexOf('/') > 0;
   date = isList ? date.split("/") : date;

   let year = isList ? date[0] : date,
      month = null,
      day = null;

   if (isList) {
      if (date.length >= 2)
         month = date[1];
      if (date.length == 3)
         day = date[2];
   }

   if (day) day = parseInt(day) - 1;
   if (month) month = parseInt(month) - 1;

   let created = new Date(Date.parse(advisor.site[key]));

   let yMatch = year ? year == created.getFullYear() : true;
   let mMatch = month ? created.getMonth() == month : true;
   let dMatch = day ? created.getDate() == day : true;
   let match = yMatch && mMatch && dMatch;
   return match;
}

//Update list of advisor info, allows being able to see full list when not showing in table
function updateAdvisorInfo() {
   advisorInfo = [];
   $('#advisorsList').DataTable().rows().data().each((e, i) => {
      // if (!advisorInfo.some(function(e2) {
      //       return e.display_name === e2.display_name;
      //    })) {
      advisorInfo.push(e);
      // } else {
      //    advisorInfo[i - 1] = e;
      // }
   });
   localStorage.setItem("advisorList", JSON.stringify(advisorInfo));
}

//Get current advisor info from displayName(Exact match)
function getAdvisorInfo(displayName) {
   return advisorInfo.find(function (e) {
      return displayName === e.display_name;
   });
}

//Get current advisor info from id(Exact match)
function getAdvisorInfoByID(id) {
   return advisorInfo.find(function (e) {
      return id === e._id;
   });
}

//Check if the tag exists in the advisor's tags(NOT Exact match)
function hasTag(tag, advisor) {
   if (advisor && advisor.settings && advisor.settings.broker_tags)
      return advisor ? advisor.settings.broker_tags.some(e => {
         return e.name.toLowerCase().indexOf(tag.toLowerCase()) >= 0;
      }) : false;
   return false;
}

// check if status matches the advisor's current status
function hasStatus(status, advisor) {
   status = status.toLowerCase();
   if (advisor && advisor.display_state) {
      let advisorStatus = advisor.display_state.toLowerCase();
      if (advisor.site.status === 'taken_down') {
         advisorStatus = "taken down";
      } else if (advisor.site.broker_reviewed && advisor.display_state === 'pending_review') {
         advisorStatus = "review completed";
      } else if (advisor.display_state === 'pending_review') {
         advisorStatus = "pending review";
      } else if (advisor.display_state === 'approved') {
         advisorStatus = "approved";
      } else if (advisor.display_state === 'editing') {
         advisorStatus = "editing";
      }
      return advisorStatus.indexOf(status) >= 0;
   } else
      return false;
}

// Check if advisor is published
function notPublished(advisor) {
   if (hasStatus("approved", advisor)) {
      let dateA = Date.parse(advisor.site.published_at),
         dateB = Date.parse(advisor.site.submitted_at);
      return dateA < dateB;
   }
   return false;
}

//Get their live domain
function getLiveDomain(id) {
   return new Promise(function (resolve) {
      $.get(baseUrl + "manage/advisor/" + id).done(data => {
         let $data = $(data);
         let a = $data.find('a[data-content="View Live Site"]');
         let link = a && a.length > 0 ? a[0].href : null;
         resolve(link);
      });
   });
}

//Add their live domain to the list
async function addLiveURLToDroplist(list, advisor) {
   let id = advisor._id;
   let url = await getLiveDomain(id);

   if (url)
      list.append('<li><a href="' + url + '" class="liveWebsiteURL" target="_blank" data-advisor_id="' + id + '">View Live Website</a></li>');
}

async function displayReviewer(url, container, cb) {
   let review = await getReviewer(url);
   if (review && review[0]) {
      let reviewText = '<div class="review-item-preview"><div >';
      reviewText += '<p class="approvedByNote" style="font-size: 12px;' + (review[2] == "Rejected" ? 'color: #c2001e;' : 'color: #007750;') + '">' + review[2] + ' By: ' + review[1] + ' - ' + review[0] + '</p>';
      reviewText += '</div>';
      reviewText += '<div>';
      reviewText += '<div class="note" style="font-size: 12px;">' + review[3] + '</div>';
      reviewText += '</div></div>';
      container.find(".review-item-preview").remove();
      container.append(reviewText);
      if (cb) cb();
   }
   async function getReviewer(url) {
      return new Promise(function (resolve) {
         $.get(url).done(data => {
            let $data = $(data);
            let review = [];
            review.push($($data.find('.print-timestamp-title + span')[0]).html());
            review.push($($data.find('.print-timestamp-title + span')[1]).html());
            review.push($($data.find('.print-timestamp-title + span')[2]).html());

            let msgText = '';
            let $msg = null;

            //Get Compliance Notes
            $msg = $data.find('.is-compliance-notes')[0];
            if ($msg) {
               msgText += '<div class="review-item-note">';
               msgText += '<h4><strong>Notes:</strong></h4>';
               Array.from($msg.children).forEach(i => msgText += i.outerHTML)
               msgText += '</div>';
            }

            //Get Rejection Notes
            $msg = $data.find('.is-rejection-notes')[0];
            if ($msg) {
               msgText += (msgText.length > 0 ? '<br>' : '');
               msgText += '<div class="review-item-note-rejection">';
               msgText += '<h4><strong>Rejections:</strong></h4>';
               Array.from($msg.children).forEach(i => msgText += i.outerHTML)
               msgText += '</div>';
            }

            review.push(msgText);

            resolve(review);
         });
      });
   }
}

//Get the officer name from their ID
function getOfficerName(id) {

   //If ID is null, it means it's assigned to "All Officers"
   if (!id)
      id = "all";

   //Get the officer
   let officer = $(".assigned_officer").first().find('option[value*="' + id + '"]');
   return $(officer).text();
}

function updateSlideCardCount() {
   console.log("Updating slider card count");

   //{Name, Items, Pending Changes, Total Changes}
   var reviewers = [
      ["All In Review", 0, 0, 0]
   ];
   var tags = [
      ["Normal Reviews", 0, '-'],
      ["Construction", 0, '-'],
      ["Migrating", 0, '-'],
      ["Brand New", 0, '-'],
      ["Redesign", 0, '-'],
      ["Post-Review", 0, '-']
   ];

   $(".advisor-card").each((i, e) => {
      var reviewName = $(e).data("officer");
      var isConstruction = $(e).data("importanttags").indexOf("Construction") >= 0;
      var isMigrating = $(e).data("importanttags").indexOf("Migrating") >= 0;
      var isBrandNew = $(e).data("importanttags").indexOf("Brand New") >= 0;
      var isRedesign = $(e).data("importanttags").indexOf("Redesign") >= 0;
      var isPostReview = $(e).data("importanttags").indexOf("Post-Review") >= 0;

      if (isConstruction)
         tags[1][1] = tags[1][1] + 1;
      else if (isMigrating)
         tags[2][1] = tags[2][1] + 1;
      else if (isBrandNew)
         tags[3][1] = tags[3][1] + 1;
      else if (isRedesign)
         tags[4][1] = tags[4][1] + 1;
      else
         tags[0][1] = tags[0][1] + 1;
      
      //Show duplicate in post-review (Post-Reviews will always be brand new as well)
      if (isPostReview)
         tags[5][1] = tags[5][1] + 1;

      var found = 0;
      reviewers.forEach((e, i) => {
         if (e[0].indexOf(reviewName) >= 0) {
            e[1] = e[1] + 1;
            found = i;
         }
      });
      if (found == 0) {
         reviewers.push([reviewName, 1, 0, 0]);
         found = reviewers.length - 1;
      }
      reviewers[0][1] = reviewers[0][1] + 1;

      if ($(e).find(".card-changes").length > 0) {
         var changes = $(e).data("pending");
         var approvals = $(e).data("approvals");
         var rejections = $(e).data("rejections");

         changes = parseInt(changes);
         approvals = parseInt(approvals);
         rejections = parseInt(rejections);
         reviewers[0][2] = reviewers[0][2] + changes;
         reviewers[0][3] = reviewers[0][3] + approvals + rejections + changes;
         reviewers[found][2] = reviewers[found][2] + changes;
         reviewers[found][3] = reviewers[found][3] + approvals + rejections + changes;
      }
   });
   var reviewersText = '<table style="width: 100%; text-align:left">';
   reviewersText += '<thead style="border-bottom: 1px solid rgba(88, 88, 88, 1);"><th>Filter by Officer/Status</th><th style="text-align:right">Sites </th><th style="text-align:right"> Items</th></thead>';
   reviewersText += '<tr><td colspan="3" style="padding-bottom: 5px"></td></tr>';

   reviewers.forEach((e, i) => {
      if (e[1] != 0) {
         reviewersText += '<tr '+( i == 0 ? 'class="active"' : '')+'><td><a href="#" class="filter-cards">' + e[0] + '</a></td><td style="text-align:right">' + e[1] + '</td><td style="text-align:right"> ' + e[2] + '</td></tr>';
         //Add underline to all in review line
         if (i == 0)
               reviewersText += '<tr><td colspan="3" style="padding-bottom: 5px"></td></tr><tr class="seperator"><td colspan="3" style="padding-bottom: 5px"></td></tr>';
      }
   });

   reviewersText += '<tr><td colspan="3" style="padding-bottom: 5px"></td></tr><tr class="seperator"><td colspan="3" style="padding-bottom: 5px"></td></tr>';
   tags.forEach((e, i) => {
      if (e[1] != 0) {
         reviewersText += '<tr>';
         reviewersText += '<td><a href="#" class="filter-cards">' + e[0] + '</a></td><td style="text-align:right">' + e[1] + '</td><td style="text-align:right"> ' + e[2] + '</td>';
      }
   });
   reviewersText += '</table>';
   $(".providence-pending--title").html('<h2>Pending Reviews</h2> <div class="review-filter">' + reviewersText + '</div>');

   $(".filter-cards").off().on("click", function () {
      var filterName = this.innerHTML;
      $(".review-filter .active").removeClass("active");
      $(this).parent().parent().addClass("active");

      if (filterName.indexOf(reviewers[0][0]) == 0) {
         $(".advisor-card").show();
         $(".review-filter .active").removeClass("active");
         $(this).parent().parent().addClass("active");
      } else {
         $(".advisor-card").hide();
         $(".advisor-card").filter(function () {
            return $(this).data("officer").indexOf(filterName) >= 0 || $(this).data("tags").indexOf(filterName) >= 0 ||
               (filterName == "Normal Reviews" &&
                  $(this).data("importanttags").indexOf('Brand New') == -1 &&
                  $(this).data("importanttags").indexOf('Migrating') == -1 &&
                  $(this).data("importanttags").indexOf('Construction') == -1 &&
                  $(this).data("importanttags").indexOf('Redesign') == -1 &&
                  $(this).data("importanttags").indexOf('PostReview') == -1
               );
         }).show();
      }
   })
}

//Update extra card information
function updateSlider() {

   //Async get the number of revisions and update the card
   async function updateRevisions(card, id, cb) {
      let revisions = await getRevisions(id);

      //If the chanages span doesn't exist, make a new one, otherwise update existing
      let approvals = revisions[0],
         rejections = revisions[1],
         pending = revisions[2];

      card.attr("data-approvals", approvals);
      card.attr("data-rejections", rejections);
      card.attr("data-pending", pending);

      card.find(".cardApprovals").html(approvals);
      card.find(".cardPending").html(pending);
      card.find(".cardRejections").html(rejections);

      if (cb) {
         cb();
      }

      //Get the HTML page and query for review items
      function getRevisions(id) {
         return new Promise(function (resolve) {
            $.get(baseUrl + "manage/advisor/" + id).done(data => {
               let $data = $(data);
               let approved = $data.find(".review-item.approved-status").length,
                  rejected = $data.find(".review-item.rejected-status").length,
                  reviews = $data.find(".review-item").length - approved - rejected;

               resolve([approved, rejected, reviews]);
            });
         });
      }
   }
   $(".advisor-card").each(function (i, card) {

      //Edit card
      if (!$(this).find('.card-status').length) {
         $(this).find('.card-content').prepend('<div class="card-status"></div>');
         $(this).find(".submitted").appendTo($(this).find('.card-status'));
         $(this).find(".card-changes").appendTo($(this).find('.card-status'));
      }
      if (!$(this).find('.card-title').length) {
         $(this).prepend('<div class="card-title" ></div>');
         $(this).find(".advisor-profile").appendTo($(this).find('.card-title'));
         $(this).find("h4").appendTo($(this).find('.card-title'));
      }

      //Find the card's name and row in table
      let name = $(this).find(".card-title h4").text();
      let info = getAdvisorInfo(name);
      if (!$(this).find(".card-tags").length)
         $(this).find(".card-content").append('<div class="card-tags"></p>');

      if (!$(this).find(".card-tier").length)
         $(this).find(".card-content").append('<div class="card-tier"></p>');

      if (!$(this).find(".card-changes").length)
         $(this).find(".submitted").after('<div class="card-changes"><span><span class="cardApprovals"></span> - <span class="cardPending"></span> - <span class="cardRejections"></span></div>')

      if (!$(this).find(".card-extras").length)
         $(this).find(".card-content").append('<div class="card-extras"><p class="cardOfficer" style="margin: 0"></p><p class="cardImportantTags" style="line-height: 1; margin: 0"></p></div>');


      //Find who's assigned to the current card
      let assigned = info ? getOfficerName(info.officer_id) : "";

      // Important Tags List
      let importantTagsList = [
         "Migrating",
         "Brand New",
         "Post-Review",
         "Redesign",
         "Construction",
         "Dealer OBA",
         "Not On Program",
         "Tier"
      ];

      let tier = "";
      let importantTagsString = "";
      let nonImportantTagsString = "";
      let allTagsString = "";

      if (info && info.settings && info.settings.broker_tags) {
         info.settings.broker_tags.forEach(allTag => {
            allTag = allTag.name
            if (allTag.indexOf("Tier") >= 0)
               tier = "Tier: " + allTag.substr(5);
            else if (importantTagsList.some(impTag => allTag.indexOf(impTag) >= 0))
               importantTagsString += allTag + ", "
            else if (!importantTagsList.some(impTag => allTag.indexOf(impTag) >= 0))
               nonImportantTagsString += allTag + ", "

            allTagsString += allTag + ", "
         })
      }

      if (importantTagsString.length > 0)
         importantTagsString = importantTagsString.substr(0, importantTagsString.length - 2);

      if (nonImportantTagsString.length > 0)
         nonImportantTagsString = nonImportantTagsString.substr(0, nonImportantTagsString.length - 2);

      //Check if the person assigned to the advisor is found
      if (assigned.length > 0) {
         name = name.replace('&amp;', '&');
         $(this).find(".card-title h4").text(name);

         $(this).attr("data-name", name);
         $(this).attr("data-officer", assigned);
         $(this).attr("data-importantTags", importantTagsString);
         $(this).attr("data-nonimportantTags", nonImportantTagsString);
         $(this).attr("data-tags", allTagsString);
         $(this).attr("data-id", info._id);

         $(this).find(".cardOfficer").html('<span>' + assigned + '</span>');
         $(this).find(".cardImportantTags").html('<span>' + importantTagsString.replace(/\, /g, "<br>") + '</span>');
         $(this).find(".card-tags").html('<span>' + allTagsString + '</span>');
         $(this).find(".card-tier").html('<span>' + tier + '</span>');

         //Add the Open chat button to the card
         if (!$(this).find(".open-chat-extension").length) {
            $(this).find(".card-action").find(".btn--action-review")[0].target = "_blank";
            $(this).find(".card-action").append('<a href="#messages" style="margin-left: 5px;flex-grow:1" class="btn pill primary btn--action-review open-chat-extension" data-advisor_id="' + info._id + '" data-cover="Open Chat">Open Chat</a>');
         }

         updateRevisions($(this), info._id, delay(e => updateSlideCardCount()), 1000);
      }
   });
}

function updateCustomEvents() {
   //Add the Open Chat button click listener
   $(".open-chat-extension").off().on('click', function () {
      let btn = this;

      //Open the chat sidebar
      $("#open-chat")[0].click();

      //Open the proper chat tab after 2 seconds(Gives time for chat window to open)
      setTimeout(() => {
         let chat = $('.chat-users-list-wrapper ul').find('[data-advisor_id="' + $(btn).data("advisor_id") + '"]');
         chat[0].click();
      }, 2000);
   });
}

function updateList(container) {
   if (!container)
      container = "#advisorsList";

   //Add "Open Chat" link to all rows
   $(container).find("tbody tr").each(function (i,e) {
      e = $(e);
      let list = $($(this).find("ul"));

      //Only add if not already added
      if (list.children().length < 6) {

         


         //Get ID
         id = list.children(":first").find("a")[0]?.href;
            id = id.split("/")[id.split("/").length - 1];

            list.find('a').first().prop("target", "_blank");
            list.append('<li><a href="#messages" class="open-chat-extension" data-advisor_id="' + id + '">Open Chat</a></li>');

            //Add link to view website without needing to login/view profile
            let info = getAdvisorInfoByID(id);
            if (info && info.email)
               list.append('<li><a href="/manage/revisions?email=' + encodeURIComponent(info.email) + '" target="_blank" class="" data-advisor_id="' + id + '">View Revisions</a></li>');
            if (info && info.site)
               list.append('<li><a href="https://' + info.site.settings.subdomain + '.app.twentyoverten.com" class="" target="_blank" data-advisor_id="' + id + '">View Preview Website</a></li>');
            if (info)
               addLiveURLToDroplist(list, info);
               
            //Add a "Not Published" status if the site is approved/editing but not published
            if (notPublished(info)) {
               let state = e.find(".has-state");
               state.append('<p style="font-size: .75em;color: #1fe9ae;text-align: center;margin: 5px 0 0 0; font-family: \'Anonymous Pro\', Courier, monospace;">Not Published</p>');
            }
            if (info && info.submitted_date){
               let date = e.find(".has-date")
               date[0].setAttribute("data-date", info.submitted_date)
            }

                     
            //   //Add a note saying when it was reviwed
            //- Not sure if theres a way to get the time of it's last rejection. I can get the rejection ID from the chat, or the revisions page. but I can't get a list of them
            //   if (hasStatus("review completed", info)) {
            //     let state = row.find(".has-state");
            //     let reviewDate = new Date(Date.parse(info.site.updated_at));
            //     reviewDate = reviewDate.toString().substring(0, reviewDate.toString().indexOf(':')-3);
            //     state.append('<p style="font-size: .75em;color: #1fe9ae;text-align: center;margin: 5px 0 0 0; font-family: \'Anonymous Pro\', Courier, monospace;">Reviewed: '+ reviewDate+'</p>');
            //   }
      }
   });
}
