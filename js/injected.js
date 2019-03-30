let advisorInfo = [];

$(function () {

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
        '<table class="table" style="margin-top: .5rem;"></table>' +
        '</div>');

    //When enter is pressed when typing in search
    $('#search-advisor').on('keypress', e => {
        if (e.code === 13)
            $("#search-advisor-btn")[0].click();
    });

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

                //Format row
                let assigned = row.find(".selected").text();
                let cell = row.find(".select-wrapper").parent();
                cell.css("text-align", "center");
                cell.html('<span>' + assigned + '</span>');
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

    $("#usersNav").css("margin-top", "1.5rem");
});

//Get the node results
function getNodes(searchString) {

    //Apply filter to rows and return new array of rows
    function filter(rows, search, invert) {
        let newRows = [];

        //Perform filter
        rows.forEach(function (e) {

            //If inverted (!search)
            if (invert) {
                if (e.data().display_name.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
                    e.data().email.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
                    e.data()._id.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
                    hasTag(search.toLowerCase(), e.data()) ||
                    getOfficerName(e.data().officer_id).toLowerCase().indexOf(search.toLowerCase()) >= 0
                ) {
                } else {
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
    let searchList = searchString.split(",");

    //Gather rows
    let rows = [];
    $('#advisorsList').DataTable().rows().every(function () {
        rows.push(this);
    });

    //Apply filter to current rows(recursion.... sort of...)
    searchList.forEach(function (e) {
        let search = e.trim();

        //Check if inverted search term
        let invert = search.indexOf("!") === 0;
        if (invert)
            search = search.substr(1, search.length);

        //Apply filter/search
        rows = filter(rows, search, invert);
    });

    //Turn filtered rows into nodes, clone, and remove useless column
    let nodes = [];
    rows.forEach(e => {
        let node = e.node().cloneNode(true);

        node.deleteCell(3);
        nodes.push(node);
    });

    return nodes;
}

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
    $(".advisor-slide").sort((a, b) => {
        a = $(a);
        b = $(b);

        //Get advisor name from cards
        let nameA = a.find(".card-content h4").text().replace(/&amp;/g, '&'),
            nameB = b.find(".card-content h4").text().replace(/&amp;/g, '&');

        //Load advisor info from DataTable
        let infoA = getAdvisorInfo(nameA),
            infoB = getAdvisorInfo(nameB);

        //Get current times for both cards in minutes
        let timeA = getTime(a.find(".submitted").text()),
            timeB = getTime(b.find(".submitted").text());

        //Check if either card is a migration card
        let isMigratingA = hasTag("Migrating", infoA),
            isMigratingB = hasTag("Migrating", infoB);

        //Check if either card is a brand new card
        let isBrandNewA = hasTag("Brand New", infoA),
            isBrandNewB = hasTag("Brand New", infoB);

        // Check if the advisor is assigned to current officer
        let isAssignedToA = infoA ? window.loggedInUser === infoA.officer_id : false,
            isAssignedToB = infoB ? window.loggedInUser === infoB.officer_id : false;

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
        .each(function () {
            $(".slide-wrapper").append(this)
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

//Update extra card information
function updateSlider() {

    //Async get the number of revisions and update the card
    async function updateRevisions(card, id) {
        let revisions = await getRevisions(id);

        //If the chanages span doesn't exist, make a new one, otherwise update existing
        if (card.find(".changes").length === 0)
            card.find(".submitted").after('<span class="changes" style="font-size: 12px;color: rgba(220,220,222,0.8);">' + '<span style="color:green">' + revisions[0] + '</span> - ' + revisions[2] + ' - <span style="color:red">' + revisions[1] + '</span></span>');
        else
            card.find(".changes").html('<span class="changes" style="font-size: 12px;color: rgba(220,220,222,0.8);">' + '<span style="color:green">' + revisions[0] + '</span> - ' + revisions[2] + ' - <span style="color:red">' + revisions[1] + '</span></span>');

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

    $(".advisor-slide").each(function () {

        //Find the card's name and row in table
        let name = $(this).find(".card-content h4").text().replace(/&amp;/g, '&');
        let info = getAdvisorInfo(name);

        //Find who's assigned to the current card
        let assigned = info ? getOfficerName(info.officer_id) : "";

        //Check if the person assigned to the advisor is found
        if (assigned && assigned.length > 0) {

            //Check if the site is migrating or new
            let isMigrating = hasTag("Migrating", info),
                isNew = hasTag("Brand New", info);

            //Add the assigned and migration tag; overwrite if already there, append if not
            if ($(this).find(".assigned").length >= 1)
                $(this).find(".assigned").html(assigned + '<br>&nbsp;' + (isMigrating ? '<span style="font-size: 12px">Migration</span>' : "") + (isNew ? '<span style="font-size: 12px">Brand New</span>' : ""));
            else {
                $(this).find(".card-content").append('<p class="assigned" style="color: rgba(220,220,222,0.8);padding: 15px;margin-top: 15px;background-color: #333;' + (info ? window.loggedInUser === info.officer_id ? "color: #fff" : "" : "") + '">' + assigned + '<br>&nbsp;' + (isMigrating ? '<span style="font-size: 12px">Migration</span>' : "") + (isNew ? '<span style="font-size: 12px">Brand New</span>' : "") + '</p>');
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
            let id = $(this).find(".card-action").children(":first")[0].href;
            id = id.split("/")[id.split("/").length - 1];
            $(this).find(".card-action").append('<a href="#messages" class="btn pill primary open-chat-extension" data-advisor_id="' + id + '" data-cover="Open Chat">Open Chat</a>');
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
        if (list.children().length < 4) {

            //Get ID
            let id = list.children(":first").find("a")[0].href;
            id = id.split("/")[id.split("/").length - 1];

            list.append('<li><a href="#messages" class="open-chat-extension" data-advisor_id="' + id + '">Open Chat</a></li>');

            //Add link to view website without needing to login/view profile
            let info = getAdvisorInfoByID(id);
            list.append('<li><a href="https://' + info.site.settings.subdomain + '.twentyoverten.com" class="" target="_blank" data-advisor_id="' + id + '">View Website</a></li>');
        }
    });
}
