var advisorInfo = [];

$(document).ready(function() {

  //Sort on page load
  sort();

  //Auto open all advisors
  $("#showAllAdvisors")[0].click();

  //Add search
  $("#pending").after(
    '<div class="search-bar" style=" display: flex; flex-flow: row wrap; ">' +
    '<div class="text-control" aria-required="true" style=" margin: 0; flex-basis: 80%; padding-right: 15px"> ' +
    '<input type="text" id="search-advisor" name="search-advisor" class="form-control" title="Advisor"> <label for="search-advisor">Advisor</label> ' +
    '</div>' +
    '<div class="btn-control" aria-required="true" style=" margin: 0;flex-basis:20%"> ' +
    '<input type="button" style="height:100%;width:100%" class="btn primary" value="Search" id="search-advisor-btn">' +
    '</div>' +
    '<table class="table" style="margin-top: .5rem;"></table> ' +
    ' </div>');

  //When enter is pressed when typing in search
  $('#search-advisor').on('keypress', function(e) {
    if (e.which == 13)
      $("#search-advisor-btn")[0].click();
  });

  //When search button is clicked
  $("#search-advisor-btn").on('click', function() {

    runSearch($('#search-advisor').val());

    async function runSearch(searchTerm){
      var showAll = searchTerm.indexOf("*") == 0;
      if(showAll)
        searchTerm = searchTerm.substr(1, searchTerm.length);

      //Empty current search results
      var table = $(".search-bar table");
      table.empty()

      //Get all nodes that match the search
      var nodes = getNodes(searchTerm);

      //Inform if no nodes are found
      if (nodes.length == 0) {
        table.append('<tr><td>No results found</td></tr>');
      }

      //Display nodes if under 100 results
      else if(showAll || nodes.length <= 100)
      {

        //Add nodes to table
        nodes.forEach(function(e, i) {

          table.append(nodes);
          var row = $(table.find("tr")[i]);
          row.prepend('<td>' + (i + 1) + '.</td>')

          //Format row
          var assigned = row.find(".selected").text();
          var cell = row.find(".select-wrapper").parent();
          cell.css("text-align", "center");
          cell.html('<span>' + assigned + '</span>');
        });
        table.find("td").css("border", "none");

        //Update action menu
        updateList(".search-bar");
        updateCustomEvents();
      }

      //If more than 100 results are found
      else{
        table.append('<tr><td>To many results ('+nodes.length+')</td></tr>');
      }
    }
  });

  $("#usersNav").css("margin-top", "1.5rem");
});

//Get the node results
function getNodes(searchString) {

  //Apply filter to rows and return new array of rows
  function filter(rows, search, invert) {
    var newRows = [];

    //Perform filter
    rows.forEach(function(e) {

      //If inverted (!search)
      if (invert) {
        if (e.data().display_name.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          e.data().email.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          e.data()._id.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          hasTag(search.toLowerCase(), e.data()) ||
          getOfficerName(e.data().officer_id).toLowerCase().indexOf(search.toLowerCase()) >= 0
        ) {} else {
          newRows.push(e);
        }
      }

      //Regular search
      else {

        if (
          e.data().display_name.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          e.data().email.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          e.data()._id.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
          hasTag(search.toLowerCase(), e.data()) ||
          getOfficerName(e.data().officer_id).toLowerCase().indexOf(search.toLowerCase()) >= 0
        ) {
          newRows.push(e);
        }
      }
    });
    return newRows;
  }

  //Split search at every ,
  var searchList = searchString.split(",");

  //Gather rows
  var rows = [];
  $('#advisorsList').DataTable().rows().every(function() {
    rows.push(this);
  });

  //Apply filter to current rows(recursion.... sort of...)
  searchList.forEach(function(e) {
    var search = e.trim();

    //Check if inverted search term
    var invert = search.indexOf("!") == 0;
    if (invert)
      search = search.substr(1, search.length);

    //Apply filter/search
    rows = filter(rows, search, invert);
  });

  //Turn filtered rows into nodes, clone, and remove useless column
  var nodes = [];
  rows.forEach(function(e) {
    var node = e.node().cloneNode(true);

    node.deleteCell(3);
    nodes.push(node);
  });

  return nodes;
}

//When DataTable gets drawn
$('#advisorsList').on("draw.dt", function(settings) {

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

//Update list of advisor info, allows being able to see full list when not showing in table
function updateAdvisorInfo() {
  $('#advisorsList').DataTable().rows().data().each(function(e, i) {
    var i = 0;
    if (!advisorInfo.some(function(e2) {
        i++;
        return e._id == e2._id;
      })) {
      advisorInfo.push(e);
    } else {
      advisorInfo[i - 1] = e;
    }
  });
}

//Get current advisor info from displayName(Exact match)
function getAdvisorInfo(displayName) {
  var advisor = advisorInfo.find(function(e) {
    return displayName == e.display_name;
  });
  return advisor;
}

//Get current advisor info from id(Exact match)
function getAdvisorInfoByID(id) {
  var advisor = advisorInfo.find(function(e) {
    return id == e._id;
  });
  return advisor;
}

//Check if the tag exists in the advisor's tags(NOT Exact match)
function hasTag(tag, advisor) {
  if (advisor && advisor.settings && advisor.settings.broker_tags)
    return advisor ? advisor.settings.broker_tags.some(function(e) {
      return e.name.toLowerCase().indexOf(tag.toLowerCase()) >= 0;
    }) : false;
  return false;
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
  $(".advisor-slide").sort(function(a, b) {
      a = $(a);
      b = $(b);

      //Get advisor name from cards
      var nameA = a.find(".card-content h4").text().replace(/&amp;/g, '&'),
        nameB = b.find(".card-content h4").text().replace(/&amp;/g, '&');

      //Load advisor info from DataTable
      var infoA = getAdvisorInfo(nameA),
        infoB = getAdvisorInfo(nameB);

      //Get current times for both cards in minutes
      var timeA = getTime(a.find(".submitted").text()),
        timeB = getTime(b.find(".submitted").text());

      //Check if either card is a migration card
      var isMigratingA = hasTag("Migrating", infoA),
        isMigratingB = hasTag("Migrating", infoB);

      //Check if either card is a brand new card
      var isBrandNewA = hasTag("Brand New", infoA),
        isBrandNewB = hasTag("Brand New", infoB);

      // Check if the advisor is assigned to current officer
      var isAssignedToA = infoA ? window.loggedInUser == infoA.officer_id ? true : false : false,
        isAssignedToB = infoB ? window.loggedInUser == infoB.officer_id ? true : false : false;

      //Sites assigned to you come before not migrating sites
      if (isAssignedToA && !isAssignedToB)
        return -1;
      else if (isAssignedToB && !isAssignedToA)
        return 1;

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

      //Compare time
      return (timeA < timeB) ? 1 : (timeA > timeB) ? -1 : 0;
    })

    //Add each element back in the new order
    .each(function() {
      $(".slide-wrapper").append(this);
    });
}

//Get the officer name from their ID
function getOfficerName(id) {

  //If ID is null, it means it's assigned to "All Officers"
  if(!id)
    id="all";

  //Get the officer
  var officer = $(".assigned_officer").first().find('option[value*="' + id + '"]');
  return $(officer).text();
}

//Update extra card information
function updateSlider() {

  //Async get the number of revisions and update the card
  async function updateRevisions(card, id) {
    var revisions = await getRevisions(id);

    //If the chanages span doesn't exist, make a new one, otherwise update existing
    if (card.find(".changes").length == 0)
      card.find(".submitted").after('<span class="changes" style="font-size: 12px;color: rgba(220,220,222,0.8);">' + '<span style="color:green">' + revisions[0] + '</span> - ' + revisions[2] + ' - <span style="color:red">' + revisions[1] + '</span></span>');
    else
      card.find(".changes").html('<span class="changes" style="font-size: 12px;color: rgba(220,220,222,0.8);">' + '<span style="color:green">' + revisions[0] + '</span> - ' + revisions[2] + ' - <span style="color:red">' + revisions[1] + '</span></span>');

    //Get the HTML page and query for review items
    function getRevisions(id) {
      return new Promise(function(resolve) {
        $.get("https://twentyoverten.com/manage/advisor/" + id).done(function(data) {
          var $data = $(data);
          var approved = $data.find(".review-item.approved-status").length,
            rejected = $data.find(".review-item.rejected-status").length,
            reviews = $data.find(".review-item").length - approved - rejected;

          resolve([approved, rejected, reviews]);
        });
      });
    };
  }

  $(".advisor-slide").each(function() {

    //Find the card's name and row in table
    var name = $(this).find(".card-content h4").text().replace(/&amp;/g, '&');
    var info = getAdvisorInfo(name);

    //Find who's assigned to the current card
    var assigned = info ? getOfficerName(info.officer_id) : "";

    //Check if the person assigned to the advisor is found
    if (assigned && assigned.length > 0) {

      //Check if the site is migrating or new
      var isMigrating = hasTag("Migrating", info),
        isNew = hasTag("Brand New", info);

      //Add the assigned and migration tag; overwrite if already there, append if not
      if ($(this).find(".assigned").length >= 1)
        $(this).find(".assigned").html(assigned + '<br>&nbsp;' + (isMigrating ? '<span style="font-size: 12px">Migration</span>' : "") + (isNew ? '<span style="font-size: 12px">Brand New</span>' : ""));
      else {
        $(this).find(".card-content").append('<p class="assigned" style="color: rgba(220,220,222,0.8);padding: 15px;margin-top: 15px;background-color: #333;' + (info ? window.loggedInUser == info.officer_id ? "color: #fff" : "" : "") + '">' + assigned + '<br>&nbsp;' + (isMigrating ? '<span style="font-size: 12px">Migration</span>' : "") + (isNew ? '<span style="font-size: 12px">Brand New</span>' : "") + '</p>');
      }

      //Update revision count
      if (info)
        updateRevisions($(this), info._id);
    }

    //Add the placeholder box if the assigned isn't found
    else if ($(this).find(".assigned").length < 1) {
      $(this).find(".card-content").append('<p class="assigned" style="color: rgba(220,220,222,0.8);padding: 15px;margin-top: 15px;background-color: #333;">&nbsp;<br><span style="font-size: 12px">-----</span></p>');
    }

    //Add the Open chat button to the card
    if ($(this).find(".card-action").children().length < 2) {
      var id = $(this).find(".card-action").children(":first")[0].href;
      id = id.split("/")[id.split("/").length - 1];
      $(this).find(".card-action").append('<a href="#messages" class="btn pill primary open-chat-extension" data-advisor_id="' + id + '" data-cover="Open Chat">Open Chat</a>');
    }
  });
}

function updateCustomEvents() {
  //Add the Open Chat button click listener
  $(".open-chat-extension").off().on('click', function() {
    var btn = this;

    //Open the chat sidebar
    $("#open-chat")[0].click();

    //Open the proper chat tab after 2 seconds(Gives time for chat window to open)
    setTimeout(function() {
      var chat = $('.chat-users-list-wrapper ul').find('[data-advisor_id="' + $(btn).data("advisor_id") + '"]');
      chat[0].click();
    }, 2000);
  });
}

function updateList(container) {
  if (!container)
    container = "#advisorsList";

  //Add "Open Chat" link to all rows
  $(container).find(".tot_droplist").each(function() {
    var list = $($(this).find("ul"));

    //Only add if not already added
    if (list.children().length < 4) {

      //Get ID
      var id = list.children(":first").find("a")[0].href;
      id = id.split("/")[id.split("/").length - 1];

      list.append('<li><a href="#messages" class="open-chat-extension" data-advisor_id="' + id + '">Open Chat</a></li>');

      //Add link to view website without needing to login/view profile
      var info = getAdvisorInfoByID(id);
      list.append('<li><a href="https://' + info.site.settings.subdomain + '.twentyoverten.com" class="" target="_blank" data-advisor_id="' + id + '">View Website</a></li>');
    }
  });
}
