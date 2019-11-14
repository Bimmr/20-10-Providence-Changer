let advisorInfo = [];

$(function () {

  //Float the page navigation
  $("head").append('<style id="floatingPages">.dataTables_paginate{position: sticky;bottom: 0; padding: 10px;left: 0;right: 0;background-color: #2d2d2dad;} #advisorsList_wrapper .dataTables_paginate{bottom: -2rem;}</style>');
  //Pending Review Count
  $("head").append('<style id="reviewCount">.filter-cards{color: rgba(220,220,222,0.8);}.filter-cards:hover{color: #fafafa;} .filter-cards.active{color: #fff;}</style>');

  //Get the URL Parts
  let urlParts = window.location.href.split("/");

  //If currently reviewing
  if ((urlParts.length > 4 && urlParts[4] === "advisor") || (urlParts.length > 4 && urlParts[4] === "advisor#")) {
    //Add p on side for Advisor Tags
    $($(".details-wrapper").find("header")).append('<p class="secondary center advisor-tags"></p>');
    let advisorId = urlParts[urlParts.length - 1];
    if (advisorId[advisorId.length - 1] == '#')
      advisorId = advisorId.substr(0, advisorId.length - 1);

    //Load advisor list from storage
    var list = JSON.parse(localStorage.getItem('advisorList'));
    advisorInfo = list;

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
      $(".advisor-quick-links").append('<a href="/manage/revisions?email=' + encodeURIComponent(advisor.email) + '" class="btn pill bordered secondary">View Revisions</a>');



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

    // For all approved/rejected items get the review information
    $(".review-item.approved-status, .review-item.rejected-status").each(async function (i, e) {
      let reviewId = $(e).find(".review-actions").find(".approve-item").data("id");

      //If a review id was found, get the review
      if (reviewId)
        displayReviewer('https://twentyoverten.com/manage/revisions/' + advisorId + '/' + reviewId, $(e));
    });

    //For each review item check if it's a link
    $(".review-item").each(function (i, e) {
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

    // When the revisions table is drown, get each revision
    $('#revisions-list').on("draw.dt", () => {
      $("#revisions-list").find("tr").each(function (i, e) {
        if ($(e).find(".actions a").length > 0) {

          //Find the information to create the revision's data link
          let link = $(e).find(".actions a")[0].href.split("/")
          let reviewId = link.pop();

          //Remove any trailing parts of the URL
          if (reviewId[reviewId.length - 1] == '#')
            reviewId = reviewId.substr(0, reviewId.length - 1);

          let advisorId = link.pop();

          //Display the revision notes
          displayNotes('https://twentyoverten.com/manage/revisions/' + advisorId + '/' + reviewId, $(e).find(".show-email"));


          async function displayNotes(url, container) {

            //Get the notes
            let review = await getNotes(url);

            //If the notes were found, add them to the given container
            if (review && review[0]) {
              let reviewText = '<p style="margin-top:10px;margin-bottom:0;font-size: 12px;color: rgba(220,220,222,0.8);">> ' + review[0] + '</p>';

              container.append(reviewText);
            }
          }
          async function getNotes(url) {
            return new Promise(function (resolve) {

              //Get the revision notes from the URL provided
              $.get(url).done(data => {
                let $data = $(data);
                let review = [];
                let $msg = $data.find('.is-compliance-notes')[0];
                let msgText = "";
                if ($msg && $msg.children.length > 0) {
                  for (let e of $msg.children) {
                    if (e.innerHTML)
                      msgText += e.innerHTML + "<br>";
                  };
                }

                review.push(msgText);

                resolve(review);
              });
            });
          }
        }
      });
    });
  } else if (urlParts.length > 4 && urlParts[4].indexOf("review") == 0) {
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


    $($(".details-wrapper").find("header")).append('<p class="secondary center advisor-tags"></p>');
    //Load advisor list from storage
    var list = JSON.parse(localStorage.getItem('advisorList'));
    advisorInfo = list;

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
      $(".advisor-quick-links").append('<a href="/manage/revisions?email=' + encodeURIComponent(advisor.email) + '" class="btn pill bordered secondary">View Revisions</a>');
  }
  //If not reviewing
  else {

    //Sort on page load
    sort();

    //Auto open all advisors
    if ($("#showAllAdvisors").length > 0)
      $("#showAllAdvisors").click();

    //Add search
    $(".providence-overview--list").prepend(
      '<div class="search-bar" style=" display: flex; flex-flow: row wrap; margin-bottom: .5rem">' +
      '<div class="text-control" aria-required="true" style=" margin: 0; flex-basis: 80%; padding-right: 15px"> ' +
      '<input type="text" id="search-advisor" name="search-advisor" class="form-control" title="Search"> <label for="search-advisor">Search</label> ' +
      '<div style="position: absolute; top: 12px; right: 25px; width: 20px; height: 20px; border-radius: 50%; background: #6b6b6b; z-index: 100; line-height: 20px; text-align: center; opacity: .9;" data-content="Search by Name, Email, Tags or Status &nbsp; &nbsp; - &nbsp; &nbsp; [! = Not] &nbsp; &nbsp; [, = And] &nbsp; &nbsp; [| = Or]" class="tot_tip top">?</div>' +
      '</div>' +
      '<div class="btn-control" aria-required="true" style=" margin: 0;flex-basis:20%"> ' +
      '<input type="button" style="height:100%;width:100%" class="btn primary fancy" value="Search" id="search-advisor-btn" data-cover="Search for Advisor">' +
      '</div>' +
      '<table class="table" style="margin: .5rem 0;"></table>' +
      '</div>');

    //When enter is pressed when typing in search
    $('#search-advisor').on('keyup', delay(e => {
      let searchTerm = $('#search-advisor').val();
      if ((searchTerm.length > 2 && searchTerm.indexOf("*") != 0 && getNodes(searchTerm).length < 50) || e.which === 13)
        $("#search-advisor-btn")[0].click();
      if (searchTerm.length <= 2 && e.which == 8) {
        let table = $(".search-bar table");
        table.empty();
      }
    }, 500));

    //When search button is clicked
    $("#search-advisor-btn").on('click', () => {

      let searchTerm = $('#search-advisor').val();

      let showAll = searchTerm.indexOf("*") === 0;
      if (showAll)
        searchTerm = searchTerm.substr(1, searchTerm.length);

      //Empty current search results
      let table = $(".search-bar table");
      table.empty();

      //Get all nodes that match the search
      let nodes = getNodes(searchTerm);

      //Inform if no nodes are found
      if (nodes.length === 0) {
        table.append('<tr><td>No results found</td></tr>');
      }

      //Display nodes if under 100 results
      else if (showAll || nodes.length <= 100) {

        //Add nodes to table
        nodes.forEach(function (e, i) {

          table.append(nodes);
          let row = $(table.find("tr")[i]);
          row.prepend('<td>' + (i + 1) + '.</td>');

        });
        table.find("td").css("border", "none");

        //Update action menu
        updateList(".search-bar");
        updateCustomEvents();
      }

      //If more than 100 results are found
      else {
        table.append('<tr><td>To many results (' + nodes.length + ')</td></tr>');
      }
    });


    //When DataTable gets drawn
    $('#advisorsList').on("draw.dt", () => {

      try {
        updateAdvisorInfo();
        updateSlider();
        sort();
        updateList();
        updateCustomEvents();

      } catch (e) {
        console.log(e);
      }
    });
  }

  //When the chat opens
  $(".open-chat").on("click", function () {

    //Wait for the chat to initialize
    setTimeout(() => {

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
      var advisorId = $(".recent-chats").find("li.active a").first().attr("data-advisor_id");
      $(".chat-wrapper .tot_tip").after('<a target="_blank" href="/manage/advisor/' + advisorId + '" class="tot_tip bottom view-profile-chat" data-content="View Profile" style="position: absolute;top: 0;right: 60px;height: 20px;width: 20px;margin: 25px 20px;z-index: 1;color: #909090;font-size: 1.1em;"><i class="fas fa-user"></i></a>');
      $(".recent-chats, .all-chats").find("li").off().on("click", function (e) {
        var advisorClickedId = $(this).find("a").first().attr("data-advisor_id");
        $(".view-profile-chat")[0].href = '/manage/advisor/' + advisorClickedId;
      });
    }, 2000);
  });
});

function approveAll() {
  $(".approve-item").click();
}
//Get the node results
function getNodes(searchString) {

  //Apply filter to rows and return new array of rows
  function filter(rows, search) {
    let newRows = [];

    //Perform filter
    rows.forEach(function (rowItem) {
      function matches(item, search, invert) {
        let match = item.data().display_name.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.data().email.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          item.data()._id.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          ("published".indexOf(search.toLowerCase()) >= 0 && item.data().published_date != "NA") ||
          ("submitted".indexOf(search.toLowerCase()) >= 0 && item.data().submitted_date != "NA") ||
          ("not published".indexOf(search.toLowerCase()) >= 0 && notPublished(item.data())) ||
          matchesCreatedYear(search.toLowerCase(), item.data()) ||
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

function matchesCreatedYear(year, advisor) {
  let created = new Date(Date.parse(advisor.site.created_at));
  return created.getFullYear() == year;
}

//Update list of advisor info, allows being able to see full list when not showing in table
function updateAdvisorInfo() {
  $('#advisorsList').DataTable().rows().data().each((e, i) => {
    if (!advisorInfo.some(function (e2) {
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
  return new Promise(function (resolve) {
    $.get("https://twentyoverten.com/manage/advisor/" + id).done(data => {
      let $data = $(data);
      let a = $data.find('a[data-content="View Live Site"]');
      let link = a && a.length > 0 ? a[0].href : null;
      resolve(link);
    });
  });
}


async function displayReviewer(url, container) {
  let review = await getReviewer(url);
  if (review && review[0]) {
    let reviewText = '<div class="review-item-preview" style="display:flex"><div style="width:50%;display:inline-block">';
    reviewText += '<p style="margin:5px 40px 0;text-align: left;font-size: 12px;color: rgba(220,220,222,0.8);">' + review[2] + ' By: ' + review[1] + ' - ' + review[0] + '</p>';
    reviewText += '</div>';
    reviewText += '<div style="width:50%;display:inline-block">';
    reviewText += '<p style="margin:5px 25px 0;text-align: right;font-size: 12px;color: rgba(220,220,222,0.8);">' + review[3] + '</p>';
    reviewText += '</div></div>';
    container.append(reviewText);
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

//Apply sort to slider cards
function sort() {

  // Get the time in minutes
  function getTime(time) {
    //Days (2 Days/a few days)
    if (time.indexOf("day") > 0) {
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

    //Get advisor name from cards
    let nameA = a.find(".card-content h4").text(),
      nameB = b.find(".card-content h4").text();

    //Load advisor info from DataTable
    let infoA = getAdvisorInfo(nameA),
      infoB = getAdvisorInfo(nameB);

    //Get current times for both cards in minutes
    let timeA = getTime(a.find(".submitted").text()),
      timeB = getTime(b.find(".submitted").text());

    //Check if either card is a migration site
    let isMigratingA = hasTag("Migrating", infoA),
      isMigratingB = hasTag("Migrating", infoB);

    //Check if either card is a brand new site
    let isBrandNewA = hasTag("Brand New", infoA),
      isBrandNewB = hasTag("Brand New", infoB);

    //Check if the site isn't on the program
    let isNotOnProgramA = hasTag("Not On Program", infoA),
      isNotOnProgramB = hasTag("Not On Program", infoB);

    if (isNotOnProgramA && !isNotOnProgramB)
      return 1;
    else if (isNotOnProgramA && !isNotOnProgramB)
      return -1;

    // Check if the advisor is assigned to current officer
    let isAssignedToA = infoA ? window.loggedInUser === infoA.officer_id : false,
      isAssignedToB = infoB ? window.loggedInUser === infoB.officer_id : false;

    //Sites assigned to you come before not migrating sites
    if (isAssignedToA && !isAssignedToB)
      return -1;
    else if (isAssignedToB && !isAssignedToA)
      return 1;
    /*
          //Migrating sites come after not migrating sites
          if (isMigratingA && !isMigratingB)
            return 1;
          else if (!isMigratingA && isMigratingB)
            return -1;

          //Migrating sites come after not migrating sites
          if (isBrandNewA && !isBrandNewB)
            return 1;
          else if (!isBrandNewA && isBrandNewB)
            return -1;
    */
    //Compare time
    return (timeA < timeB) ? 1 : (timeA > timeB) ? -1 : 0;
  })

  //Add each element back in the new order
  .each(function () {
    $(".providence-pending--list").append(this)
  });

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
    ["Total In Review", 0, 0]
  ];
  $(".advisor-card").each((i, e) => {
    var reviewName = $(e).find(".assigned")[0].innerHTML.split('<br>')[0];
    var found = 0;
    reviewers.forEach((e, i) => {
      if (e[0] == reviewName) {
        e[1] = e[1] + 1;
        found = i;
      }
    });
    if (found == 0) {
      reviewers.push([reviewName, 1, 0]);
      found = reviewers.length - 1;
    }
    reviewers[0][1] = reviewers[0][1] + 1;

    if ($(e).find(".changes").length > 0) {
      var changes = $(e).find(".changes").first().text();
      changes = changes.substr(changes.indexOf(" - ") + 3, changes.lastIndexOf(" - "));
      changes = parseInt(changes);
      reviewers[0][2] = reviewers[0][2] + changes;
      reviewers[found][2] = reviewers[found][2] + changes;
    }
  });
  var reviewersText = '<table style="width: 100%; text-align:left">';
  reviewersText += '<thead><th>Reviewer</th><th>Sites </th><th> Items</th></thead>';
  reviewers.forEach((e, i) => {
    reviewersText += '<tr>';
    reviewersText += '<td><a href="#" class="filter-cards">' + e[0] + '</a></td><td>' + e[1] + '</td><td> ' + e[2] + '</td>';

    reviewersText += '</tr>';
  });
  reviewersText += '</table>';
  $(".providence-pending--title").html('Pending Review <div style="font-size: .65em;border-top: 1px solid rgba(98,98,98,0.5);color: rgba(220,220,222,0.8);padding-top: .5rem;">' + reviewersText + '</div>');

  $(".filter-cards").off().on("click", function () {
    var filterName = this.innerHTML;
    if (filterName == "Total In Review") {
      $(".advisor-card").show();
      $(".filter-cards.active").removeClass("active");
      $(this).addClass("active");
    } else {
      $(".filter-cards.active").removeClass("active");
      $(this).addClass("active");
      $(".advisor-card").hide();
      $(".advisor-card").filter(function () {
        return $(this).find(".assigned").html().indexOf(filterName) >= 0;
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

    card.attr("data-approvals", revisions[0]);
    card.attr("data-pending", revisions[1]);
    card.attr("data-rejects", revisions[2]);

    if (card.find(".changes").length === 0)
      card.find(".submitted").after('<span class="changes" style="font-size: 12px;color: rgba(220,220,222,0.8);">' + '<span style="color:green">' + revisions[0] + '</span> - ' + revisions[2] + ' - <span style="color:red">' + revisions[1] + '</span></span>');
    else
      card.find(".changes").html('<span class="changes" style="font-size: 12px;color: rgba(220,220,222,0.8);">' + '<span style="color:green">' + revisions[0] + '</span> - ' + revisions[2] + ' - <span style="color:red">' + revisions[1] + '</span></span>');

    if (cb)
      cb();

    //Get the HTML page and query for review items
    function getRevisions(id) {
      return new Promise(function (resolve) {
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

  $(".advisor-card").each(function (i) {

    //Find the card's name and row in table
    let name = $(this).find(".card-content h4").text();
    let info = getAdvisorInfo(name);

    //Find who's assigned to the current card
    let assigned = info ? getOfficerName(info.officer_id) : "";

    //Check if the person assigned to the advisor is found
    if (assigned && assigned.length > 0) {

      //Check if the site is migrating or new
      let isMigrating = hasTag("Migrating", info),
        isNew = hasTag("Brand New", info),
        isNotOnProgram = hasTag("Not On Program", info);

      //Add the assigned and migration tag; overwrite if already there, append if not
      if ($(this).find(".assigned").length >= 1)
        $(this).find(".assigned").html(assigned + '<br>' + (isMigrating ? '<span style="font-size: 12px; color: #06874E">Migration</span>' : "") + (isNew ? '<span style="font-size: 12px; color: #00A758">Brand New</span>' : "") + (isNotOnProgram ? '<span style="font-size: 12px; color: red">Not On Program</span>' : ""));
      else {
        $(this).find(".card-content").append('<p class="assigned" style="font-size: 14px;color: rgba(220,220,222,0.8);padding: 15px;margin-top: 15px;background-color: #333; border-radius: 10px;' + (info ? window.loggedInUser === info.officer_id ? "color: #fff" : "" : "") + '">' + assigned + '<br>' + (isMigrating ? '<span style="font-size: 12px">Migration</span>' : "") + (isNew ? '<span style="font-size: 12px">Brand New</span>' : "") + '</p>');
      }

      //Update revision count
      if (info)
        if (i == $(".advisor-card").length - 1)
          updateRevisions($(this), info._id, updateSlideCardCount);
        else
          updateRevisions($(this), info._id);
      else if (i == $(".advisor-card").length - 1)
        updateSlideCardCount();
    }

    //Add the placeholder box if the assigned isn't found
    else if ($(this).find(".assigned").length < 1) {
      $(this).find(".card-content").append('<p class="assigned" style="color: rgba(220,220,222,0.8);padding: 15px;margin-top: 15px;background-color: #333; border-radius: 10px; font-size: 14px"><span style="font-size: 12px">-----</span></p>');
    }

    //Add the Open chat button to the card
    if ($(this).find(".card-action").children().length < 2) {
      let id = $(this).find(".card-action").children(":first")[0].href;
      id = id.split("/")[id.split("/").length - 1];
      let cardAction = $(this).find(".card-action");
      cardAction.css("display", "flex");
      cardAction.css("justify-content", "center");
      cardAction.append('<a href="#messages" style="margin-left: 5px;" class="btn pill primary open-chat-extension" data-advisor_id="' + id + '" data-cover="Open Chat">Open Chat</a>');
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
  $(container).find(".tot_droplist").each(function () {
    let list = $($(this).find("ul"));

    //Only add if not already added
    if (list.children().length < 6) {

      //Get ID
      let id = list.children(":first").find("a")[0].href;
      id = id.split("/")[id.split("/").length - 1];

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
    }
  });
}
