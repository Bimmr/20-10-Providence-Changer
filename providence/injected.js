let advisorInfo = [];

$(function() {

   if (localStorage.getItem("cardInfom") == null)
      localStorage.setItem("cardInform", true);

   $("head").append('<style>' +

      //Float the page navigation
      '.dataTables_paginate,.table-length{position: sticky;bottom: 0; padding: 10px;left: 0;right: 0;}' +
      '.dataTables_paginate{width: 750px;margin: 0 auto;} ' +
      '.table-length{height:72px;background-color: #2d2d2dad;} ' +
      '.dataTables_info{color:#dcdcde} ' +
      '#advisorsList_wrapper .dataTables_paginate,  #advisorsList_wrapper .table-length{bottom: -2rem;}' +

      //Pending Review Count
      '.filter-cards{color: rgba(220,220,222,0.8);}' +
      '.filter-cards:hover{color: #fafafa;} ' +
      '.filter-cards.active{color: #fff;}' +

      //Fix long filter list
      '.filter-dropdown--options.is-open{overflow-y: scroll; height: 75vh}' +

      //Add inform styles
      '.advisor-card .card-action{padding: 1.5rem; display: flex;} ' +
      '.providence-pending--list:not(.inform) .card-tags,.providence-pending--list:not(.inform) .card-tier{display:none}' +
      '.providence-pending--list.inform .card-tier{position: absolute;top: 5px;right: 10px;} ' +
      '.providence-pending--list .card-title{padding:1.5em;padding-bottom:0} ' +
      '.providence-pending--list.inform .card-title{display: flex;align-items:center; border-top: none; padding-bottom: 1em;border-bottom: 1px solid #2d2d2d} ' +
      '.providence-pending--list.inform .card-title .advisor-profile{flex-basis: 25%; margin: 0;} ' +
      '.providence-pending--list.inform .card-title h4{flex-basis: 75%;text-align: left;padding-left:10px;margin: 0;} ' +
      '.providence-pending--list .card-content{padding-top: 1rem;} ' +
      '.providence-pending--list.inform .card-status{display: flex; align-items: center;justify-content: space-evenly;}' +

      //Format rejection box
      '.rejection-completed{position: absolute; top: 3.75rem; right:3rem;}' +
      '</style>');

   //Chat changes
   $(".open-chat").on("click", function() {

      //Wait for the chat to initialize (2s)
      setTimeout(() => {

         //When the chat gets opened, display saved message
         if (localStorage.getItem('savedChatMsg') && localStorage.getItem('savedChatMsg') != 'null' && localStorage.getItem('savedChatMsg') != 'undefined') {
            $($("#chatMessage").find(".fr-wrapper")).removeClass("show-placeholder");
            $($("#chatMessage").find(".fr-element")).html(localStorage.getItem('savedChatMsg'));
         }

         //When the chat gets closed, save the message
         $(".close-chat").on("click", function() {
            localStorage.setItem('savedChatMsg', $($("#chatMessage").find(".fr-element")).html());
         });

         //When message is sent remove from saved message
         $(".chat-tools").find(".send-message").on('click', function() {
            localStorage.setItem('savedChatMsg', null);
            $("#loadLastMessage").hide();
         });

         //Get currently opened chat's advisor id, and add the icon
         var advisorId = $(".recent-chats").find("li.active a").first().attr("data-advisor_id");
         $(".chat-wrapper .tot_tip").after('<a target="_blank" href="/manage/advisor/' + advisorId + '" class="tot_tip bottom view-profile-chat" data-content="View Profile" style="position: absolute;top: 0;right: 60px;height: 20px;width: 20px;margin: 25px 20px;z-index: 1;color: #909090;font-size: 1.1em;"><i class="fas fa-user"></i></a>');

         // IF the chat is changed, grab the new advisor id and update the icon's link
         $(".recent-chats, .all-chats").find("li").off().on("click", function(e) {
            var advisorClickedId = $(this).find("a").first().attr("data-advisor_id");
            $(".view-profile-chat")[0].href = '/manage/advisor/' + advisorClickedId;
            setTimeout(() => {

               manageChatRejections();

            }, 1000);
         });

         //Wait for the chat to initialize
         setTimeout(() => {
            manageChatRejections();
         }, 1000);
      }, 2000);
   });

   function manageChatRejections() {
      var advisorId = $(".recent-chats").find("li.active a").first().attr("data-advisor_id");
      let rejections = updateRejections('rejections-' + advisorId);
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
      $(".rejection-completed").off().on('change', function() {
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
         localStorage.setItem('rejections-' + advisorId, JSON.stringify(rejections));
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
   }
   //Get the URL Parts
   let urlParts = window.location.href.split("/");

   //If currently reviewing
   if ((urlParts.length > 4 && urlParts[4] === "advisor") || (urlParts.length > 4 && urlParts[4] === "advisor#")) {

      //Add p on side for Advisor Tags
      $($(".details-wrapper").find("header")).append('<p class="secondary center advisor-tags" style="font-size: .8em"></p>');
      let advisorId = urlParts[urlParts.length - 1];
      if (advisorId[advisorId.length - 1] == '#')
         advisorId = advisorId.substr(0, advisorId.length - 1);

      //Load advisor list from storage
      var list = JSON.parse(localStorage.getItem('advisorList'));
      advisorInfo = list;

      if (isSiteForward(window.loggedInUser))
         localStorage.setItem('IsSiteForward', true);

      //Get advisor
      let advisor = getAdvisorInfoByID(advisorId);

      //Create string with tags
      let tags = "";
      if (advisor && advisor.settings && advisor.settings.broker_tags)
         advisor.settings.broker_tags.forEach(function(e) {
            tags += "<br>" + e.name;
         });

      //Add tags
      $(".advisor-tags").html(tags.substr(4, tags.length));
      if (advisor && advisor.email)
         $(".advisor-quick-links").append('<a href="/manage/revisions?email=' + encodeURIComponent(advisor.email) + '" class="btn pill bordered secondary">View Revisions</a>');


      if (localStorage.getItem('IsSiteForward') == "true") {
         $(".changes-header .btn-group").append('<a href="#" class="btn pill primary" onclick="approveAll()">Approve All</a><a href="#" class="btn pill bordered" onclick="addNoteToAll()">Add Note to All</a>');
      }

      //When archives are opened
      $(".open-archives").on("click", function() {

         //Wait 2 seconds
         setTimeout(() => {

            // For each archive item adjust the styling
            $(".archive-item").each(function() {
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
               return new Promise(function(resolve) {

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

      // For all approved/rejected items get the review information
      $(".review-item").each(async function(i, e) {
         let $e = $(e);
         let reviewId = $e.find(".review-actions").find(".approve-item").data("id");

         //If a review id was found, get the review
         if (reviewId) {
            displayReviewer('https://twentyoverten.com/manage/revisions/' + advisorId + '/' + reviewId, $e, function() {
               if (!$e.hasClass("approved-status") && !$e.hasClass("rejected-status"))
                  $e.find(".review-item-preview").find(".approvedByNote").text("");
            });
         }
      });

      //For each review item check if it's a link
      $(".review-item").each(function(i, e) {
         if ($(e).find(".review-actions a")[0].innerHTML == "Review Link") {
            let link = $(e).find(".review-url").text();

            //Indicate if the link is External or Internal
            if (link.indexOf("http") >= 0)
               $(e).find(".review-actions a")[0].innerHTML = "Visit External Link";
            else
               $(e).find(".review-actions a")[0].innerHTML = "Visit Internal Link";
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
         var prefix = "digitaladvisorprogram+";
         if (email.indexOf(prefix) == 0)
            email = email.substr(prefix.length, email.length);

         // Wait 2 seconds after the page loads to ensure the revisions load
         setTimeout(() => {

            //Search the table, and re-drawn it
            $("#revisions-list").DataTable().search(email).draw();
         }, 2000);
      }

      $(".providence--page-title").after('<a class="btn primary fancy" id="reportorize-btn" style="    position: fixed; z-index:100; bottom: 20px;  right: 20px;">Reportorize It</a>');
      $("#reportorize-btn").on("click", function() {
         $("#revisions-list_filter, .table-length, .dataTables_paginate").hide();
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
         } else if (this.text == "Loading...") {} else {
            let $tableHeader = $(".dataTable").find("thead");
            $($tableHeader.find("th")[0]).after('<th>Email</th>');
            $($tableHeader.find("th")[1]).after('<th>Domain</th>');
            $($tableHeader.find("th")[3]).after('<th style="min-width:250px">Page Title</th>');
            $($tableHeader.find("th")[4]).after('<th style="min-width:500px">Note</th>');
            $($tableHeader.find("th")[5]).after('<th style="min-width:500px">Rejections</th>');
            $($tableHeader.find("th")[10]).remove();

            $(".dataTable").find("tbody").find("tr").each(function(i) {
               let $row = $(this);
               let $columns = $row.find("td");
               let data = $(".dataTable").DataTable().row(i).data();
               let advisorId = data.advisor._id,
                  reviewId = data._id;

               let email = $row.find(".advisor-tags")
               if (email.length < 1)
                  email = $('<p></p>');

               let pageTitle = $row.find(".advisor-tags");
               if (pageTitle.length < 2)
                  pageTitle = $('<p></p>');
               else
                  pageTitle = $(pageTitle[1]);

               let notes = $row.find(".show-email p");
               if (notes.length < 1)
                  notes = $('<p></p>');
               $($columns[1]).after('<td>' + pageTitle[0].outerHTML + '</td>')
               $($columns[0]).after('<td>' + data.site.settings.domains[0] + '</td>').after('<td>' + email[0].outerHTML + '</td>');

               displayComments('https://twentyoverten.com/manage/revisions/' + advisorId + '/' + reviewId, function(comments) {
                  $($columns[2])
                     .before('<td style="white-space:normal"><p style="font-size: 11px; margin: 0">' + comments[0] + '</p></td>')
                     .before('<td style="white-space:normal"><p style="font-size: 11px; margin: 0">' + comments[1] + '</p></td>');

               });
               email.remove();
               pageTitle.remove();
               notes.remove();
               $columns.last().remove();
            });

            async function displayComments(url, cb) {
               var comments = await getComments(url);
               cb(comments);

               async function getComments(url) {
                  return new Promise(function(resolve) {
                     $.get(url).done(data => {
                        let $data = $(data);
                        let comment = [];
                        let $note = $data.find('.is-compliance-notes');
                        let $rejection = $data.find('.is-rejection-notes');
                        let notes = "",
                           rejections = "";
                        if ($note[0] && $note[0].children.length > 0) {
                           for (let e of $note[0].children) {
                              if (e.innerHTML)
                                 notes += e.innerHTML + "<br>";
                           };
                        }

                        comment.push(notes.length > 0 ? notes : "-");

                        if ($rejection[0] && $rejection[0].children.length > 0) {
                           for (let e of $rejection[0].children) {
                              if (e.innerHTML)
                                 rejections += e.innerHTML + "<br>";
                           };
                        }
                        comment.push(rejections.length > 0 ? rejections : "-");

                        resolve(comment);
                     });
                  });
               }
            }
            $(".advisor-profile").remove();
            $(".wrapper").css("width", "100%").css("max-width", "unset").css("margin", "5px");
            $($(".dataTable").find("thead").find("th")[3]).css("min-width", "150px");
            var delay = $(".dataTable").DataTable().rows()[0].length * 20;
            var btn = this;
            btn.text = "Loading...";
            setTimeout(function() {
               btn.text = "Copy Table";
            }, delay);
         }
      });
      $("#revisions-list_length").find("option").last().after('<option value="500">500</option><option value="1000">1000</option><option value="999999">All</option>');

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
         $(".review-tools").append('<a href="' + window.location.href.replace('review', 'revisions') + '" class="btn pill secondary btn-sm" target="_blank">View Revision</a>');
         displayReviewer('https://twentyoverten.com/manage/revisions/' + advisorId + '/' + reviewId, $(".review-title"));
      }


      // //Is blog post
      // if($(".title .meta").length > 0){
      //   var title = $(".title")[0].childNodes[1].nodeValue;
      //
      //   $.get('https://twentyoverten.com/manage/content/custom', function(){
      //      $(".dataTable").DataTable().rows(function(idx,data,node){
      //        if(data.title == title){
      //          var id = findID;
      //          $.get('https://twentyoverten.com/api/content/compliance/'+id, function(){
      //
      //          });
      //        }
      //   });
      // });


      $($(".details-wrapper").find("header")).append('<p class="secondary center advisor-tags"></p>');
      //Load advisor list from storage
      var list = JSON.parse(localStorage.getItem('advisorList'));
      advisorInfo = list;

      //Get advisor
      let advisor = getAdvisorInfoByID(advisorId);

      //Create string with tags
      let tags = "";
      if (advisor && advisor.settings && advisor.settings.broker_tags)
         advisor.settings.broker_tags.forEach(function(e) {
            tags += "<br>" + e.name;
         });

      //Add tags
      $(".advisor-tags").html(tags.substr(4, tags.length));
      if (advisor && advisor.email)
         $(".advisor-quick-links").append('<a href="/manage/revisions?email=' + encodeURIComponent(advisor.email) + '" class="btn pill bordered secondary">View Revisions</a>');
   }

   //Content Assist page
   else if (urlParts.length > 4 && urlParts[4].indexOf("content") == 0) {
      $("#content-list_wrapper, #custom-content-list_wrapper").prepend(
         '<div class="search-bar" style=" display: flex; flex-flow: row wrap; margin-bottom: .5rem">' +
         '<div class="text-control" aria-required="true" style=" margin: 10px 0 0 0; flex-basis: 80%; padding-right: 15px"> ' +
         '<input type="text" id="search-content" name="search-content" class="form-control" title="Search"> <label for="search-content">Search ( Make sure to set entries to all )</label> ' +
         '<div style="position: absolute; top: 12px; right: 25px; width: 20px; height: 20px; border-radius: 50%; background: #6b6b6b; z-index: 100; line-height: 20px; text-align: center; opacity: .9;" data-content="Search by Name, Email, Tags or Status &nbsp; &nbsp; - &nbsp; &nbsp; [! = Not] &nbsp; &nbsp; [, = And] &nbsp; &nbsp; [| = Or]" class="tot_tip top">?</div>' +
         '</div>' +
         '<div class="btn-control" aria-required="true" style=" margin: 0;flex-basis:20%"> ' +
         '<input type="button" style="height:100%;width:100%" class="btn primary fancy" value="Search" id="search-content-btn" data-cover="Search for Content">' +
         '</div>' +
         '<table class="table" style="margin: .5rem 0;"></table>' +
         '</div>');
      $("#custom-content-list_length, #content-list_length").find("option").last().after('<option value="200">200</option><option value="500">500</option><option value="999999">All</option>');


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
         $("#content-list, #custom-content-list").hide();

         //Get all nodes that match the search
         let nodes = getNodes(searchTerm);

         //Inform if no nodes are found
         if (nodes.length === 0) {
            table.append('<tr><td>No results found</td></tr>');
         }
         //Display only the number of results
         else if (onlyNumber) {
            table.append('<tr><td>Results: (' + nodes.length + ')</td></tr>');
         }
         //Display nodes if under 100 results
         else if (showAll || nodes.length <= 100) {

            //Add nodes to table
            table.append(nodes);
            nodes.forEach(function(e, i) {
               let row = $(table.find("tr")[i]);
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
            rows.forEach(function(rowItem) {
               function matches(item, search, invert) {
                  let match = item.data().title.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
                     item.data()._id.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
                     (item.data().categories && hasCategory(search.toLowerCase(), item.data()));

                  function hasCategory(tag, item) {
                     if (item && item.categories)
                        return item ? item.categories.some(e => {
                           return e.name.toLowerCase().indexOf(tag.toLowerCase()) >= 0;
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

               searchTerms.forEach(function(term) {
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
         $('.dataTable').DataTable().rows().every(function() {
            rows.push(this);
         });
         //Apply filter to current rows(recursion.... sort of...)
         searchList.forEach(function(e) {
            let search = e.trim();

            //Apply filter/search
            rows = filter(rows, search);
         });

         //Turn filtered rows into nodes, clone, and remove useless column
         let nodes = [];
         rows.forEach(e => {
            let node = e.node().cloneNode(true);

            node.deleteCell(4);
            nodes.push(node);
         });
         return nodes;
      }
   }

   //Home Page
   else {

      //Sort on page load
      sort();

      //Auto open all advisors
      if ($("#showAllAdvisors").length > 0)
         $("#showAllAdvisors").click();

      if (!$(".cardInformToggle").length) {
         $("#header .tot_dropdown .tot_droplist ul").first().prepend('<li class="cardInformToggle"><a href="#">Toggle Informative Cards</a></li>');
         $(".cardInformToggle").on('click', function() {
            if ($(".providence-pending--list").hasClass("inform")) {
               $(".providence-pending--list").removeClass("inform");
               localStorage.setItem("cardInform", false);
            } else {
               $(".providence-pending--list").addClass("inform");
               localStorage.setItem("cardInform", true);
            }
         });
      }
      if (localStorage.getItem("cardInform") == 'true') {
         $(".providence-pending--list").addClass("inform");
      }


      // $("#showMyAdvisors").after('<a href="#" id="showMyTeam">My Team</a>');
      // $(".providence-overview--nav a").on('click', function(){
      //   $("#advisorsList_wrapper, .search-bar, .providence-overview--filter").show();
      //   $(".providence-overview--nav .active").removeClass("active");
      //   $(this).addClass("active");
      // })
      // $("#showMyTeam").on('click', function(){
      //     $("#advisorsList_wrapper, .search-bar, .providence-overview--filter").hide();
      //     $("#showAllAdvisors").click();
      //     $(this).addClass("active");
      // });
      $(".providence-overview--nav a").on('click', function() {
         if ($("#search-advisor").length && $("#search-advisor-btn").length) {
            $('#search-advisor').val("");
            $(".search-bar table").empty();
            $("#advisorsList_wrapper").show();
         }
      });

      //Add search
      $(".providence-overview--list").prepend(
         '<div class="search-bar" style=" display: flex; flex-flow: row wrap; margin-bottom: .5rem">' +
         '<div class="text-control" aria-required="true" style=" margin: 10px 0 0 0; flex-basis: 80%; padding-right: 15px"> ' +
         '<input type="text" id="search-advisor" name="search-advisor" class="form-control" title="Search"> <label for="search-advisor">Search</label> ' +
         '<div style="position: absolute; top: 12px; right: 25px; width: 20px; height: 20px; border-radius: 50%; background: #6b6b6b; z-index: 100; line-height: 20px; text-align: center; opacity: .9;" data-content="Search for &quot;?&quot; for assistance." class="tot_tip top">?</div>' +
         '</div>' +
         '<div class="btn-control" aria-required="true" style=" margin: 0;flex-basis:20%"> ' +
         '<input type="button" style="height:100%;width:100%" class="btn primary fancy" value="Search" id="search-advisor-btn" data-cover="Search for Advisor">' +
         '</div>' +
         '<table class="table" style="margin: .5rem 0;"></table>' +
         '</div>');

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

            //Get all nodes that match the search
            let nodes = getNodes(searchTerm);

            //Inform if no nodes are found
            if (searchTerm.toLowerCase() == "?") {
               table.append('<tr><td><h1>Searching can be done by Name, Email, Tags, Status, or Officer.</h1> <table style="width: 100%"><tr><th>Expressions</th><th>Results</th><th>Example</th></tr> <tr><td>|</td><td>OR</td><td>Published|Submitted</td></tr> <tr><td>,</td><td>AND</td><td>Published|SiteForward</td></tr> <tr><td>!</td><td>NOT</td><td>!Published</td></tr></table><h1>There are some extra searching as well</h1><table style="width: 100%"><tr><th>Search</th><th>Results</th><th>Example</th></tr> <tr><td>published</td><td>Shows all published sites</td><td></td></tr> <tr><td>submitted</td><td>Shows all submitted sites</td><td></td></tr> <tr><td>created_at:&lt;year&gt;/[month]/[day]</td><td>Shows sites created at that time</td><td>created_at:2019/08</td></tr> <tr><td>updated_at:&lt;year&gt;/[month]/[day]</td><td>Shows sites updated at that time</td><td>created_at:2019/08/01</td></tr> <tr><td>published_at:&lt;year&gt;/[month]/[day]</td><td>Shows sites published at that time</td><td>created_at:2020</td></tr> <tr><td>submitted_at:&lt;year&gt;/[month]/[day]</td><td>Shows sites submitted at that time</td><td>created_at:2020/01</td></tr><tr><td>#<search></td><td>Shows the number of sites that match</td><td>#Published</td></tr><tr><td>*<search></td><td>Shows all sites that match regardless of number</td><td>*Published</td></tr></table></td></tr>');
            } else if (nodes.length === 0) {
               table.append('<tr><td>No results found</td></tr>');
            }
            //Display only the number of results
            else if (onlyNumber) {
               table.append('<tr><td>Results: (' + nodes.length + ')</td></tr>');
            }
            //Display nodes if under 100 results
            else if (showAll || nodes.length <= 100) {

               //Add nodes to table
               table.append(nodes);
               nodes.forEach(function(e, i) {
                  let row = $(table.find("tr")[i]);
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
               table.append('<tr><td>To many results (' + nodes.length + ')</td></tr>');
            }
         } else {
            $("#advisorsList_wrapper").show();
         }
      });

      //When DataTable gets drawn
      $('#advisorsList').on("draw.dt", delay(e => {
         updateAdvisorInfo();
         updateSlider();
         sort();
         updateList();
         updateCustomEvents();
         updateOfficerList();

         if ($(".filter-warning").length)
            $(".filter-warning").remove();

         if ($(".filter-dropdown--options input:checked").length && !$(".filter-warning").length)
            $("header").prepend('<div class="filter-warning" style="background-color: #522626;width: 100%;text-align: center;display: block; position: fixed; border-radius:0 0 50% 50%;">Caution: You have a filter enabled</div>');


      }, 750));

      //Get the node results
      function getNodes(searchString) {

         //Apply filter to rows and return new array of rows
         function filter(rows, search) {
            let newRows = [];

            //Perform filter
            rows.forEach(function(rowItem) {
               function matches(item, search, invert) {
                  search = search.replace("&", "&amp;");
                  let match = item.data().display_name.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
                     item.data().email.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
                     item.data()._id.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
                     ("published".indexOf(search.toLowerCase()) >= 0 && item.data().published_date != "NA") ||
                     ("submitted".indexOf(search.toLowerCase()) >= 0 && item.data().submitted_date != "NA") ||
                     ("not published".indexOf(search.toLowerCase()) >= 0 && notPublished(item.data())) ||
                     (search.indexOf("created_at:".toLowerCase()) >= 0 && matchesDate(search.toLowerCase().substring(search.indexOf(":") + 1), "created_at", item.data())) ||
                     (search.indexOf("updated_at:".toLowerCase()) >= 0 && matchesDate(search.toLowerCase().substring(search.indexOf(":") + 1), "updated_at", item.data())) ||
                     (search.indexOf("published_at:".toLowerCase()) >= 0 && matchesDate(search.toLowerCase().substring(search.indexOf(":") + 1), "published_at", item.data())) ||
                     (search.indexOf("submitted_at:".toLowerCase()) >= 0 && matchesDate(search.toLowerCase().substring(search.indexOf(":") + 1), "submitted_at", item.data())) ||
                     hasTag(search.toLowerCase(), item.data()) ||
                     hasStatus(search.toLowerCase(), item.data()) ||
                     getOfficerName(item.data().officer_id).toLowerCase().indexOf(search.toLowerCase()) >= 0;

                  if (invert && !match)
                     return true;
                  else if (!invert && match)
                     return true;
                  else
                     return false;
               }

               function isRandysList(item) {
                  return (isCompliance(item.officer_id) && hasStatus("editing", item)) ||
                     (isCompliance(item.officer_id) && hasStatus("review completed", item)) ||
                     (isOnHold(item.officer_id) && hasStatus("editing", item));
               }

               let searchTerms = search.split("|");
               let match = false;
               if (search.indexOf(".") == 0 && search.length == 1)
                  match = isRandysList(rowItem.data());
               else {

                  searchTerms.forEach(function(term) {
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
         $('#advisorsList').DataTable().rows().every(function() {
            rows.push(this);
         });

         //Apply filter to current rows(recursion.... sort of...)
         searchList.forEach(function(e) {
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
            //Hours (2 Hours/an few hours)
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

               //Get current times for both cards in minutes
               let timeA = getTime(a.find(".submitted").text()),
                  timeB = getTime(b.find(".submitted").text());

               //Compare time
               return (timeA < timeB) ? 1 : (timeA > timeB) ? -1 : 0;
            })

            //Add each element back in the new order
            .each(function() {
               $(".providence-pending--list").append(this)
            });

      }

      //Add OptGroups to officer select
      function updateOfficerList() {
         $(".form-item--control.assigned_officer").each(function(fi, fe) {
            if (!$(fe).hasClass("optGroupsAdded")) {
               let officers = {
                  'SiteForward': [],
                  'MLS Sales Communication': [],
                  'Market Conduct Compliance': [],
                  'Miscellaneous': []
               };
               $(fe).find("option").each(function(i, e) {

                  let id = e.value.substr(e.value.indexOf('|') + 1);

                  if (isSiteForward(id)) {
                     officers['SiteForward'].push($(this));
                  } else if (isMLSCompliance(id)) {
                     officers['MLS Sales Communication'].push($(this));
                  } else if (isInsuranceCompliance(id)) {
                     officers['Market Conduct Compliance'].push($(this));
                  } else if (isMiscellaneous(id)) {
                     officers['Miscellaneous'].push($(this));
                  }
               });
               for (let [key, value] of Object.entries(officers)) {
                  let group = '<optgroup style="padding-top: 4px;" label="' + key + '">';
                  value.forEach(function(item) {
                     group += item[0].outerHTML;
                     item.remove();
                  });
                  $(this).append(group);
               }
               $(fe).addClass("optGroupsAdded");
               if (!$(fe).find("option:selected").length)
                  $(fe).find('option[value$="all"]').attr('selected', 'true');
            }
         });
      }
   }
});

function approveAll() {
   $(".approve-item").click();
}

function addNoteToAll() {
   var notes = $(".revision-note");
   noteIndex = -1;
   var note = prompt("Add your note", );
   addNote(function() {
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
      waitForStyle(true, overlay, "display", "block", function() {
         waitForClass(false, overlay, "velocity-animating", function() {
            setTimeout(function() {
               overlay.find(".fr-element.fr-view").html(note);
               overlay.find(".save").click();
               waitForClass(true, overlay, "velocity-animating", function() {
                  waitForClass(false, overlay, "velocity-animating", function() {
                     waitForStyle(true, overlay, "display", "none", function() {
                        cb();
                     });
                  });
               });
            }, 500);
         });
      });
   }
}

function matchesDate(date, key, advisor) {
   let isList = date.indexOf('/') > 0;
   date = isList ? date.split("/") : date;
   let day = date.length == 3 && isList ? date[0] : null,
      month = date.length == 3 && isList ? date[1] : date.length == 2 && isList ? date[0] : null,
      year = date.length == 3 && isList ? date[2] : date.length == 2 && isList ? date[1] : date;

   if (day) day = parseInt(day) - 1;
   if (month) month = parseInt(month) - 1;

   let created = new Date(Date.parse(advisor.site[key]));
   let match = (year == created.getFullYear()) && (month ? created.getMonth() == month : true) && (day ? created.getDate() == day : true);
   return match;
}

//Update list of advisor info, allows being able to see full list when not showing in table
function updateAdvisorInfo() {
   $('#advisorsList').DataTable().rows().data().each((e, i) => {
      if (!advisorInfo.some(function(e2) {
            return e._id === e2._id;
         })) {
         advisorInfo.push(e);
      } else {
         advisorInfo[i - 1] = e;
      }
   });
   localStorage.setItem("advisorList", JSON.stringify(advisorInfo));
}

//Get current advisor info from displayName(Exact match)
function getAdvisorInfo(displayName) {
   return advisorInfo.find(function(e) {
      return displayName === e.display_name;
   });
}

//Get current advisor info from id(Exact match)
function getAdvisorInfoByID(id) {
   return advisorInfo.find(function(e) {
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

function hasStatus(status, advisor) {
   status = status.toLowerCase();
   if (advisor && advisor.display_state) {
      let advisorStatus = advisor.display_state.toLowerCase();
      if (advisor.site.status === 'taken_down') {
         advisorStatus = "taken Down";
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

function notPublished(advisor) {
   if (hasStatus("approved", advisor)) {
      let dateA = Date.parse(advisor.site.published_at),
         dateB = Date.parse(advisor.site.submitted_at);
      return dateA < dateB;
   }
   return false;
}

async function addLiveURLToDroplist(list, advisor) {
   let id = advisor._id;
   let url = await getLiveDomain(id);

   if (url)
      list.append('<li><a href="' + url + '" class="liveWebsiteURL" target="_blank" data-advisor_id="' + id + '">View Live Website</a></li>');
}

function getLiveDomain(id) {
   return new Promise(function(resolve) {
      $.get("https://twentyoverten.com/manage/advisor/" + id).done(data => {
         let $data = $(data);
         let a = $data.find('a[data-content="View Live Site"]');
         let link = a && a.length > 0 ? a[0].href : null;
         resolve(link);
      });
   });
}


async function displayReviewer(url, container, cb) {
   let review = await getReviewer(url);
   if (review && review[0]) {
      let reviewText = '<div class="review-item-preview" style="display:flex"><div style="width:50%;display:inline-block">';
      reviewText += '<p class="approvedByNote" style="margin:5px 40px 0;text-align: left;font-size: 12px;color: rgba(220,220,222,0.8);">' + review[2] + ' By: ' + review[1] + ' - ' + review[0] + '</p>';
      reviewText += '</div>';
      reviewText += '<div style="width:50%;display:inline-block">';
      reviewText += '<p class="approvalNote" style="margin:5px 25px 0;text-align: right;font-size: 12px;color: rgba(220,220,222,0.8);">' + review[3] + '</p>';
      reviewText += '</div></div>';
      container.append(reviewText);
      if (cb) cb();
   }
   async function getReviewer(url) {
      return new Promise(function(resolve) {
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
               msgText += '<strong>Notes:</strong><br>';
               getChildren($msg);
            }

            //Get Rejection Notes
            $msg = $data.find('.is-rejection-notes')[0];
            if ($msg) {
               msgText += (msgText.length > 0 ? '<br>' : '') + '<strong>Rejections:</strong><br>';
               getChildren($msg);
            }

            function getChildren(node) {
               if ((!node.children || node.children.length < 1) && node.innerHTML) {
                  msgText += node.innerHTML + "<br>";
               }
               node = node.firstChild;
               while (node) {
                  getChildren(node);
                  node = node.nextSibling;
               }
            }

            if (msgText.length > 500)
               msgText = msgText.substr(0, 500) + "...";

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

   var reviewers = [
      ["Total In Review", 0, 0, 0]
   ];
   $(".advisor-card").each((i, e) => {
      var reviewName = $(e).data("officer");
      var found = 0;
      reviewers.forEach((e, i) => {
         if (e[0] == reviewName) {
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
   reviewersText += '<thead style="border-bottom: 1px dotted rgba(88, 88, 88, 0.8);"><th>Reviewer</th><th>Sites </th><th> Items</th></thead>';
   reviewers.forEach((e, i) => {
      reviewersText += '<tr>';
      reviewersText += '<td><a href="#" class="filter-cards">' + e[0] + '</a></td><td>' + e[1] + '</td><td> ' + e[2] + '</td>';

      reviewersText += '</tr>';
   });
   reviewersText += '</table>';
   $(".providence-pending--title").html('Pending Review <div style="font-size: .65em;border-top: 1px solid rgba(98,98,98,0.5);color: rgba(220,220,222,0.8);padding-top: .5rem;">' + reviewersText + '</div>');

   $(".filter-cards").off().on("click", function() {
      var filterName = this.innerHTML;
      if (filterName == "Total In Review") {
         $(".advisor-card").show();
         $(".filter-cards.active").removeClass("active");
         $(this).addClass("active");
      } else {
         $(".filter-cards.active").removeClass("active");
         $(this).addClass("active");
         $(".advisor-card").hide();
         $(".advisor-card").filter(function() {
            return $(this).data("officer").indexOf(filterName) >= 0;
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
         return new Promise(function(resolve) {
            $.get("https://twentyoverten.com/manage/advisor/" + id).done(data => {
               let $data = $(data);
               let approved = $data.find(".review-item.approved-status").length,
                  rejected = $data.find(".review-item.rejected-status").length,
                  reviews = $data.find(".review-item").length - approved - rejected;

               resolve([approved, rejected, reviews]);
            });
         });
      }
   }

   $(".advisor-card").each(function(i) {

      //Find the card's name and row in table
      let name = $(this).find(".card-title h4").text();
      let info = getAdvisorInfo(name);
      if (!$(this).find(".card-tags").length)
         $(this).find(".card-content").append('<div class="card-tags"></p>');

      if (!$(this).find(".card-tier").length)
         $(this).find(".card-content").append('<div class="card-tier"></p>');

      if (!$(this).find(".card-changes").length)
         $(this).find(".submitted").after('<div class="card-changes"><span style="font-size: 12px;color: rgba(220,220,222,0.8);"><span class="cardApprovals" style="color:green"></span> - <span class="cardPending"></span> - <span class="cardRejections" style="color:red"></span></div>')

      if (!$(this).find(".card-extras").length)
         $(this).find(".card-content").append('<div class="card-extras" style="font-size: 14px;padding: 15px;margin-top: 15px;background-color: #333; border-radius: 10px"><p class="cardOfficer" style="margin: 0"></p><p class="cardImportantTags" style="line-height: 1; margin: 0"></p></div>');


      //Find who's assigned to the current card
      let assigned = info ? getOfficerName(info.officer_id) : "";

      //Check if the site is migrating or new
      let isMigrating = hasTag("Migrating", info),
         isNew = hasTag("Brand New", info),
         isNotOnProgram = hasTag("Not On Program", info),
         isFullReview = hasTag("Full Site Review", info);
      let iTagString = (isMigrating ? "Migrating As Is | " : "") +
         (isNew ? "Brand New | " : "") +
         (isFullReview ? "- Full Review - | " : "") +
         (isNotOnProgram ? "NOT ON PROGRAM | " : "");
      if (iTagString.length > 0)
         iTagString = iTagString.substr(0, iTagString.length - 3);

      let tags = "";
      let tier = "";
      if (info && info.settings && info.settings.broker_tags) {
         info.settings.broker_tags.forEach(function(i) {
            if (i.name.toLowerCase().indexOf("tier") >= 0) {
               tier = "Tier: " + i.name.substr(5);
            } else if (i.name.toLowerCase().indexOf("migrating") == -1 && i.name.toLowerCase().indexOf("brand new") == -1 && i.name.toLowerCase().indexOf("not on program") == -1 && i.name.toLowerCase().indexOf("full site review") == -1)
               tags += i.name + ", ";
         });

         tags = tags.substr(0, tags.length - 2);
      }


      //Check if the person assigned to the advisor is found
      if (assigned.length > 0) {
         name = name.replace('&amp;', '&');
         $(this).find(".card-title h4").text(name);

         $(this).attr("data-name", name);
         $(this).attr("data-officer", assigned);
         $(this).attr("data-importantTags", iTagString);
         $(this).attr("data-id", info._id);

         $(this).find(".cardOfficer").html('<span style="color: ' + (info && window.loggedInUser === info.officer_id ? '#fff' : 'rgba(220,220,222,0.8)') + '">' + assigned + '</span>');
         $(this).find(".cardImportantTags").html('<span style="font-size: 12px; color: #00A758">' + iTagString.replace("|", "<br>") + '</span>');
         $(this).find(".card-tags").html('<span style="font-size: .7em;color: rgba(220,220,222,0.8);">' + tags + '</span>');
         $(this).find(".card-tier").html('<span style="font-size: .6em;color: yellow">' + tier + '</span>');

         //Add the Open chat button to the card
         if (!$(this).find(".open-chat-extension").length) {
            $(this).find(".card-action").append('<a href="#messages" style="margin-left: 5px;flex-grow:1" class="btn pill primary open-chat-extension" data-advisor_id="' + info._id + '" data-cover="Open Chat">Open Chat</a>');
         }

         updateRevisions($(this), info._id, function() {
            delay(updateSlideCardCount(), 1000)
         });

      }
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
   });
}

function updateCustomEvents() {
   //Add the Open Chat button click listener
   $(".open-chat-extension").off().on('click', function() {
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
   $(container).find(".tot_droplist").each(function() {
      let list = $($(this).find("ul"));

      //Only add if not already added
      if (list.children().length < 6) {

         //Get ID
         let id = list.children(":first").find("a")[0].href;
         id = id.split("/")[id.split("/").length - 1];

         list.find('a').first().prop("target", "_blank");
         list.append('<li><a href="#messages" class="open-chat-extension" data-advisor_id="' + id + '">Open Chat</a></li>');

         //Add link to view website without needing to login/view profile
         let info = getAdvisorInfoByID(id);
         if (info && info.email)
            list.append('<li><a href="/manage/revisions?email=' + encodeURIComponent(info.email) + '" target="_blank" class="" data-advisor_id="' + id + '">View Revisions</a></li>');
         if (info && info.site)
            list.append('<li><a href="https://' + info.site.settings.subdomain + '.twentyoverten.com" class="" target="_blank" data-advisor_id="' + id + '">View Preview Website</a></li>');
         if (info)
            addLiveURLToDroplist(list, info);

         //Add a "Not Published" status if the site is approved/editing but not published
         if (notPublished(info)) {
            let state = list.parent().parent().parent().parent().find(".has-state");
            state.append('<p style="font-size: .75em;color: #1fe9ae;text-align: center;margin: 5px 0 0 0; font-family: \'Anonymous Pro\', Courier, monospace;">Not Published</p>');
         }
         //   //Add a note saying when it was reviwed
         //- Not sure if theres a way to get the time of it's last rejection. I can get the rejection ID from the chat, or the revisions page. but I cna't get a list of them
         //   if (hasStatus("review completed", info)) {
         //     let state = list.parent().parent().parent().parent().find(".has-state");
         //     let reviewDate = new Date(Date.parse(info.site.updated_at));
         //     reviewDate = reviewDate.toString().substring(0, reviewDate.toString().indexOf(':')-3);
         //     state.append('<p style="font-size: .75em;color: #1fe9ae;text-align: center;margin: 5px 0 0 0; font-family: \'Anonymous Pro\', Courier, monospace;">Reviewed: '+ reviewDate+'</p>');
         //   }
      }
   });
}
