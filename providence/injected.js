let baseUrl = "https://app.twentyoverten.com"
//"https://staging-app.twentyoverten.com"

// Global Info
let advisorInfo = []
let urlParts = ""

$(async function () {
    try {
        await waitForCondition(() => typeof isSiteForward === "function", 2000)
        console.log("Providence Changer Loaded")
        ready()
    } catch (error) {
        alert("Unable to load Extension, please reload the page to try enabling the extension again.")
    }
})

// Function to initialize the page
async function ready() {
    //Load advisor list from storage
    if (localStorage.getItem("advisorList") != null) advisorInfo = JSON.parse(localStorage.getItem("advisorList"))

    // Check if the user is a SiteForward team member
    if (isSiteForward(window.loggedInUser)) localStorage.setItem("IsSiteForward", true)

    // Add content sub-menu items to content nav menu item
    const contentSubNav = createElement("ul", {
        class: "providence--section-nav-sub",
        html: `
            <li><a href="/manage/content" class="vendor_content_assist">Vendor Provided</a></li>
            <li><a href="/manage/content/custom" class="siteforward_content_assist">SiteForward Provided</a></li>
         `,
    })
    document.querySelector(".providence--section-nav a[href='/manage/content']").parentNode.append(contentSubNav)

    // Init general modules
    NightMode.init()
    Chat.init()

    // Get the URL Parts
    urlParts = window.location.href.split("/")

    // Load the page modules

    // [https:]//[][app.twentyoverten.com]/[manage] -> Dashboard Home
    if (urlParts.length == 4 && urlParts[3].includes("manage")) Manage.init()
    
    // [https:]//[][app.twentyoverten.com]/[manage]/[advisor]/[###advisor_id###] -> Advisor Profile
    else if (urlParts.length == 6 && urlParts[4].includes("advisor"))  Advisor.init()

    // [https:]//[][app.twentyoverten.com]/[manage]/[review]/[###advisor_id###]/[###item_id###] -> Item Review
    else if (urlParts.length == 7 && urlParts[4].includes("review"))  Review.init()
}

// ============================================================================
// Util functions
// ============================================================================

/**
 * Fetch the advisor info from the advisor's id
 * @param {*} advisor_id
 * @returns
 */
async function getAdvisorInfo(advisor_id) {
    const response = await fetch(`https://app.twentyoverten.com/manage/advisor/one/${advisor_id}`)
    return response.json()
}

/**
 * Fetch the site info from the site's id
 * Site id can be gotten from the advisor info
 * @param {*} site_id
 * @returns
 */
async function getSiteInfo(site_id) {
    const response = await fetch(`https://app.twentyoverten.com/manage/advisor/notes/${site_id}`)
    return response.json()
}

/**
 * Get the advisor info from the cached DataTable
 * @param {*} id
 * @returns
 */
function getAdvisorInfoFromTable(id) {
    return advisorInfo.find(function (e) {
        return id === e._id
    })
}

/**
 * Get advisor info by display name from the cached DataTable
 * @param {string} displayName - The advisor's display name
 * @returns {Object|null} - Advisor info object or null if not found
 */
function getAdvisorInfoByNameFromTable(displayName) {
    if (!displayName || !advisorInfo) return null
    return advisorInfo.find((advisor) => advisor.display_name === displayName) || null
}

// =============================================================================
// Night Mode Module
// =============================================================================
const NightMode = {
    /**
     * Initialize the night mode module.
     */
    init() {
        const hasNightMode = localStorage.getItem("nightMode-p") === "true"
        document.body.classList.toggle("nightMode", hasNightMode)
        this.setupToggle()
    },

    /**
     * Setup the night mode toggle in the header.
     */
    setupToggle() {
        const dropdownList = document.querySelector("#header .tot_dropdown .tot_droplist ul")
        const nightModeToggle = createElement("li", {
            class: "nightModeToggle",
            html: '<a href="#">Toggle Night Mode</a>',
            onclick: () => {
                document.body.classList.toggle("nightMode")
                localStorage.setItem("nightMode-p", document.body.classList.contains("nightMode"))
            },
        })
        dropdownList.insertBefore(nightModeToggle, dropdownList.firstChild)
    },
}
// =============================================================================
// AdvisorDetails Module
// =============================================================================
const AdvisorDetails = {
    advisor_info: null,
    init(advisor_info){
        this.advisor_info = advisor_info
        this.addTags()
        this.addPreviewLinkIcon()
        this.addViewRevisionsButton()
        this.Archives.init()
    },
    addTags(){
        const tags = this.advisor_info.settings.broker_tags || []
        // Add tags to the UI
        const tag_container = createElement("div",{
            class: "advisor-tags secondary center",
            html: `${tags.map(tag => tag.name).join("<br>")}`
        })
        //Add tag_container after "".details-wrapper header" using es6
        document.querySelector(".details-wrapper header").insertAdjacentElement("afterend", tag_container)
    },
    addPreviewLinkIcon(){
        const preview_link_icon = createElement("li", {
            html: `<a href="https://${this.advisor_info.site.settings.subdomain}.app.twentyoverten.com" class="tot_tip top center" data-content="View Preview Website"><svg id="icon-preview-website" viewBox="0 0 24 24" class="action-icon"> <path d="M8.617,12.682H5.9a6.149,6.149,0,0,0,4.544,5.258,12.465,12.465,0,0,1-1.207-2.378A9.792,9.792,0,0,1,8.617,12.682Z"> </path> <path d="M10.444,6.062A6.147,6.147,0,0,0,5.9,11.318H8.617A10.69,10.69,0,0,1,10.444,6.062Z"></path> <path d="M9.981,11.32h4.038A8.453,8.453,0,0,0,13.8,9.956a9.382,9.382,0,0,0-.376-1.207,10.325,10.325,0,0,0-.479-1.036q-0.271-.511-0.49-0.841T12,6.237q-0.235.3-.45,0.637t-0.49.844a9.048,9.048,0,0,0-.858,2.24A8.275,8.275,0,0,0,9.981,11.32Z"> </path> <path d="M12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0Zm7.242,13.947a7.416,7.416,0,0,1-1.843,3.26,7.431,7.431,0,0,1-1.457,1.18,7.514,7.514,0,0,1-1.728.781,7.408,7.408,0,0,1-1.925.327Q12.192,19.5,12,19.5t-0.288-.005a7.514,7.514,0,0,1-6.235-3.787,7.6,7.6,0,0,1-.719-1.76,7.461,7.461,0,0,1,0-3.893A7.416,7.416,0,0,1,6.6,6.794a7.431,7.431,0,0,1,1.457-1.18,7.514,7.514,0,0,1,1.728-.781,7.408,7.408,0,0,1,1.925-.327Q11.808,4.5,12,4.5t0.288,0.005a7.514,7.514,0,0,1,6.235,3.787,7.6,7.6,0,0,1,.719,1.76A7.461,7.461,0,0,1,19.242,13.947Z"> </path> <path d="M13.556,6.061h0a10.792,10.792,0,0,1,1.833,5.258H18.1A6.149,6.149,0,0,0,13.556,6.061Z"></path> <path d="M13.555,17.94A6.15,6.15,0,0,0,18.1,12.682H15.387A10.782,10.782,0,0,1,13.555,17.94Z"></path> <path d="M14.019,12.682H9.981a8.453,8.453,0,0,0,.221,1.364,9.381,9.381,0,0,0,.376,1.207,10.312,10.312,0,0,0,.479,1.036q0.271,0.511.49,0.841T12,17.765q0.235-.3.453-0.637t0.49-.844a10.017,10.017,0,0,0,.479-1.036,9.631,9.631,0,0,0,.376-1.2A8.274,8.274,0,0,0,14.019,12.682Z"> </path> </svg></a>`
        })
        document.querySelector(".advisor-actions").appendChild(preview_link_icon)
    },
    addViewRevisionsButton(){
        const open_revisions = createElement("a", {
            href: `/manage/revisions?email=${encodeURIComponent(
                this.advisor_info.email)}`,
            target: "_blank",
            html: `View Revisions`,
            class: "btn btn--action-default"
        })
        document.querySelector(".details-wrapper .btn-container").appendChild(open_revisions)
    },
    
// =============================================================================
// Archives Sub-Module
// =============================================================================
    Archives: {
        /**
         * Initialize the archives module.
         */
        init() {
            this.setupArchiveOpenListener()
        },

        /**
         * Setup archive open listener.
         */
        setupArchiveOpenListener() {
            document.querySelector(".open-archives").addEventListener("click", async () => {
                try {
                    await this.waitForArchivesOverlay()
                    await this.processArchiveItems()
                } catch (err) {
                    console.error("Error initializing archives:", err)
                }
            })
        },

        /**
         * Wait for the archives overlay to load.
         */
        async waitForArchivesOverlay() {
            try {
                await waitForCondition(() => {
                    const archivesOverlay = document.querySelector("#archives-overlay")
                    return archivesOverlay && !archivesOverlay.classList.contains("loading")
                })
            } catch (error) {
                alert("Unable to load Archives.\nThis is a known bug, to fix it please log in as the account then refresh this page or view the archives in the website engine.\n\nCause: Dashboard currently sees that you're logged in as another advisor.")
            }
        },

        /**
         * Process archive items.
         */
        async processArchiveItems() {
            const items = document.querySelectorAll(".archive-item")
            for (const item of items) {
                this.styleArchiveItem(item)
                const url = item.querySelector(".btn-group a").href
                await this.addArchiveNotes(item, url)
            }
        },

        /**
         * Style an archive item.
         * @param {HTMLElement} item - The archive item element.
         */
        styleArchiveItem(item) {
            Object.assign(item.style, { flexFlow: "row wrap" })
            Object.assign(item.querySelector(".archive-actions").style, {
                position: "absolute",
                top: "20px",
                right: "20px",
            })
        },

        /**
         * Add archive notes to an item.
         * @param {HTMLElement} item - The archive item element.
         * @param {string} url - The URL to fetch notes from.
         */
        async addArchiveNotes(item, url) {
            const note = await this.fetchNotes(url)
            if (note) {
                this.appendNoteToItem(item, note)
            }
        },

        /**
         * Fetch notes from a URL.
         * @param {string} url - The URL to fetch notes from.
         * @returns {Promise<string|null>} - The fetched notes or null if not found.
         */
        async fetchNotes(url) {
            try {
                const response = await fetch(url)
                const text = await response.text()
                const doc = new DOMParser().parseFromString(text, "text/html")

                let notes = doc.querySelector(".is-compliance-notes")?.innerHTML
                if (!notes) {
                    const timestamp = doc.querySelectorAll(".print-timestamp-title + span")[2]?.innerHTML
                    notes = `<span class="small">Approved By: ${timestamp}</span>`
                }
                return notes
            } catch (error) {
                console.error("Error fetching notes:", error)
                return null
            }
        },

        /**
         * Append a note to an archive item.
         * @param {HTMLElement} item - The archive item element.
         * @param {string} note - The note content to append.
         */
        appendNoteToItem(item, note) {
            const complianceNote = createElement("div", {
                class: "compliance-notes",
                style: "font-size: 14px; width: 100%;",
                html: note,
            })
            item.appendChild(complianceNote)
            item.querySelectorAll("span.small").forEach((span) => {
                span.style.fontSize = "12px"
            })
        },
    }

}

// =============================================================================
// Chat Module
// =============================================================================
const Chat = {
    /**
     * Initialize the chat module.
     */
    init() {
        this.setupChatOpenListeners()
    },

    /**
     * Setup chat open listeners.
     */
    setupChatOpenListeners() {
        // Chat open listener
        document.querySelectorAll(".open-chat, #open-chat").forEach((el) => {
            el.addEventListener("click", () => this.handleChatOpen())
        })

        // Chat user selection listener
        document.addEventListener("click", (e) => {
            if (e.target.matches(".chat-users-list-wrapper ul .user")) {
                let advisor_id = e.target.querySelector(".chat-user").getAttribute("data-advisor_id")
                document.querySelector("#live-chat").setAttribute("data-advisor_id", advisor_id)
                this.handleChatOpen()
            } else if (e.target.matches(".chat-users-list-wrapper ul .user img")) {
                let advisor_id = e.target.parentNode.parentNode.getAttribute("data-advisor_id")
                document.querySelector("#live-chat").setAttribute("data-advisor_id", advisor_id)
                this.handleChatOpen()
            }
        })

        // Rejection change listener
        document.addEventListener(
            "change",
            (e) => {
                if (!e.target.matches(".rejection-completed")) return

                const checkbox = e.target
                const rejectionWrapper = checkbox.closest(".rejection-notice")
                if (!rejectionWrapper) return

                const rejectionId = rejectionWrapper.dataset.id
                const advisorId = rejectionWrapper.dataset.advisorId

                if (!rejectionId || !advisorId) {
                    console.warn("Missing rejection or advisor ID for rejection change")
                    return
                }

                const rejectionArray = Array.from(rejectionWrapper.querySelectorAll(".rejected-item")).map(
                    (item) => item.querySelector(".rejection-completed").checked
                )

                updateRejection(advisorId, rejectionId, rejectionArray)
            },
            { capture: true }
        )
    },
    setupChatWindow(advisor_id) {
        if (!document.querySelector(".chat-wrapper .view-profile-chat")) {
            const chatWrapper = document.querySelector(".chat-wrapper")
            if (chatWrapper) {
                const profileLink = createElement("a", {
                    target: "_blank",
                    href: `/manage/advisor/${advisor_id}`,
                    class: "tot_tip bottom view-profile-chat",
                    "data-content": "View Profile",
                    style: "position: absolute;top: 0;right: 60px;height: 20px;width: 20px;margin: 25px 20px;z-index: 1;color: #909090;font-size: 1.1em;",
                    html: '<i class="fas fa-user"></i>',
                })

                chatWrapper.append(profileLink)
            }
        } else document.querySelector(".chat-wrapper .view-profile-chat").href = `/manage/advisor/${advisor_id}`
    },

    /**
     * Handle chat open interactions.
     */
    async handleChatOpen() {
        await this.waitForChatLoad()
        const opened_chat_id = document.querySelector(".recent-chats li.active a")?.getAttribute("data-advisor_id")
        let target_chat_id = document.querySelector("#live-chat").getAttribute("data-advisor_id")

        if (opened_chat_id != target_chat_id && target_chat_id != null) {
            document.querySelector('.chat-users-list-wrapper ul [data-advisor_id="' + target_chat_id + '"]').click()
        } else target_chat_id = opened_chat_id

        this.setupChatWindow(target_chat_id)

        try {
            await this.waitForChatLoad()
            this.setupSavedMessageHandling()
            this.setupChatEventListeners()
            this.setupChatSearch()
            await this.setupRejectionHandling(target_chat_id)
        } catch (err) {
            console.error("Error initializing chat:", err)
        }
    },

    /**
     * Setup chat search functionality
     */
    setupChatSearch() {
        // Only add search if it doesn't already exist
        if (document.querySelector(".chat-search")) return

        // Add search icon and input
        document.querySelector(".chat-users-list-wrapper").insertAdjacentHTML(
            "beforeend",
            `
            <a href="#" class="chat-search">
                <i class="fas fa-search chat-search-icon"></i>
                <div class="chat-search-input-wrapper">
                    <input type="text" placeholder="Search Name">
                    <div class="chat-search-input-search">
                        <i class="fas fa-search"></i>
                        <div class="chat-search-results"></div>
                    </div>
                </div>
            </a>
        `
        )

        // Setup search input listener with debouncing
        const searchInput = document.querySelector(".chat-search-input-wrapper input")
        const searchButton = document.querySelector(".chat-search-input-search i")
        const searchResults = document.querySelector(".chat-search-results")

        searchInput.addEventListener(
            "keyup",
            delay((e) => {
                const searchName = searchInput.value
                if (searchName.length >= 3) {
                    this.performChatSearch()
                } else {
                    searchResults.innerHTML = ""
                }
            }, 500)
        )

        // Setup search button listener
        searchButton.addEventListener("click", () => this.performChatSearch())
    },

    /**
     * Perform chat user search
     */
    performChatSearch() {
        const searchInput = document.querySelector(".chat-search-input-wrapper input")
        const searchResults = document.querySelector(".chat-search-results")
        const searchName = searchInput.value.toLowerCase()

        if (!searchName) {
            searchResults.innerHTML = ""
            return
        }

        // Find matching users
        const users = document.querySelectorAll(".chat-users-list-wrapper .user")
        const results = Array.from(users).filter((user) => {
            const content = user.getAttribute("data-content")
            return content && content.toLowerCase().includes(searchName)
        })

        // If exactly one result, click it automatically
        if (results.length === 1) {
            const link = results[0].querySelector("a")
            if (link) link.click()
        }

        // Show result count
        searchResults.innerHTML = results.length

        // Clear results if search is empty or only one result was found
        if (searchName.length === 0 || results.length === 1) {
            searchResults.innerHTML = ""
        }
    },

    /**
     * Wait for the chat to load.
     */
    async waitForChatLoad() {
        await waitForCondition(() => {
            const chatWrapper = document.querySelector(".chat-wrapper")
            return (
                chatWrapper &&
                !chatWrapper.classList.contains("loading") &&
                document.querySelector("body").classList.contains("chat-open")
            )
        })
    },

    /**
     * Setup rejection handling.
     * Waits 500ms total before adding the checkboxes (including time taken by getRejections)
     */
    async setupRejectionHandling(advisor_id) {
        const startTime = performance.now()
        const rejections = await getRejections(advisor_id)
        const elapsedTime = performance.now() - startTime

        // Calculate remaining wait time to reach 500ms total
        const WAIT_TIME = 500
        const remainingWaitTime = Math.max(0, WAIT_TIME - elapsedTime)

        setTimeout(() => {
            this.addRejectionCheckboxes(rejections, advisor_id)
        }, remainingWaitTime)
    },

    /**
     * Add rejection checkboxes to the rejection notices.
     * @param {Array} rejections - The list of rejections.
     */
    addRejectionCheckboxes(rejections) {
        document.querySelectorAll(".rejection-notice").forEach((notice) => {
            const rejectionId = notice.dataset.id
            const rejectionItem = rejections.find((item) => item.rejectionId === rejectionId) || []

            notice.querySelectorAll(".rejected-item").forEach((item, i) => {
                const isCompleted = rejectionItem?.rejection?.[i] || false
                const checkbox = createElement("input", {
                    class: "rejection-completed",
                    type: "checkbox",
                    checked: isCompleted,
                })
                item.insertBefore(checkbox, item.firstChild)
            })
        })
    },

    /**
     * Setup saved message handling.
     */
    setupSavedMessageHandling() {
        const savedMsg = localStorage.getItem("savedChatMsg")
        const chatMessage = document.querySelector("#chatMessage")

        if (savedMsg) {
            chatMessage.querySelector(".fr-wrapper").classList.remove("show-placeholder")
            chatMessage.querySelector(".fr-element").innerHTML = savedMsg
        }
    },

    /**
     * Setup chat event listeners.
     */
    setupChatEventListeners() {
        const chatMessage = document.querySelector("#chatMessage")

        document.querySelector(".close-chat").addEventListener("click", () => {
            localStorage.setItem("savedChatMsg", chatMessage.querySelector(".fr-element").innerHTML)
            document.querySelector("#live-chat").setAttribute("data-advisor_id", null)
        })

        document.querySelector(".chat-tools .send-message").addEventListener("click", () => {
            localStorage.setItem("savedChatMsg", null)
            document.getElementById("loadLastMessage").style.display = "none"
        })
    },
}

// =============================================================================
// Manage Page Module
// =============================================================================
const Manage = {
    /**
     * Initialize the Manage module.
     */
    async init() {
        this.changeToShowAll()
        this.setupEventListeners()
        this.adjustItemsPerPage()
        this.checkFilterWarning()
        this.SearchBar.init()
        this.AdvisorList.init()
        this.ReviewList.init()
    },

    /**
     * Setup the filter warning display.
     */
    checkFilterWarning() {
        // Remove any existing filter warning
        document.querySelector(".filter-warning")?.remove()

        // Show warning if any filter is enabled
        if (document.querySelector(".filter-dropdown--options input:checked")) {
            document.querySelector("header")?.prepend(
                createElement("div", {
                    class: "filter-warning",
                    html: "Caution: You have a filter enabled",
                })
            )
        }
    },

    /**
     *  Setup event listeners for the Manage module.
     */
    setupEventListeners() {
        document
            .querySelectorAll(".providence-overview--nav a")
            .forEach((e) => e.addEventListener("click", () => this.adjustItemsPerPage()))

        // Wait until the button exists before adding the event listener
        const waitForFilterBtn = setInterval(() => {
            const filterBtn = document.querySelector("#filterAdvisors .btn")
            if (filterBtn) {
                filterBtn.addEventListener("click", () => this.checkFilterWarning())
                clearInterval(waitForFilterBtn)
            }
        }, 500)

        // Custom chat opening buttons
        document.addEventListener("click", (e) => {
            if (e.target.matches(".open-chat-extension")) {
                const advisorId = e.target.getAttribute("data-advisor_id")
                document.querySelector("#live-chat").setAttribute("data-advisor_id", advisorId)
                document.querySelector("#open-chat").click()
            }
        })
    },

    /**
     * Function to change the view to show all advisors.
     */
    changeToShowAll() {
        const waitForShowAllBtn = setInterval(() => {
            const showAllBtn = document.getElementById("showAllAdvisors")
            if (showAllBtn) {
                if (!showAllBtn.classList.contains("active")) {
                    showAllBtn.click()
                }
                clearInterval(waitForShowAllBtn)
            }
        }, 200)
    },

    /**
     * Function to adjust the number of items displayed per page.
     */
    adjustItemsPerPage() {
        setTimeout(() => {
            const select = document.querySelector("#advisorsList_length select")
            ;["200", "500", "999999"].forEach((val) => {
                select.appendChild(createElement("option", { value: val, html: val === "999999" ? "All" : val }))
            })
        }, 1000)
    },

    // ======================= Search Bar =======================
    SearchBar: {
        /**
         * Initialize the SearchBar module.
         */
        init() {
            this.addSearchBar()
            this.setupEventListeners()
        },

        /**
         * Add the search bar to the DOM.
         */
        addSearchBar() {
            const searchBar = createElement("div", {
                class: "search-bar",
                html: `
                    <div class="text-control" aria-required="true" style="margin: 10px 0 0 0; flex-basis: 80%; padding-right: 15px">
                        <input required type="text" id="search-advisor" name="search-advisor" class="form-control" title="Search">
                        <label for="search-advisor">Search</label>
                        <div data-content="Search for &quot;?&quot; for assistance." class="tot_tip top search-help">?</div>
                    </div>
                    <div class="btn-control" aria-required="true" style="margin: 0; flex-basis:20%">
                        <input type="button" style="height:100%; width:100%" 
                            class="btn primary btn--action-review" 
                            value="Search" 
                            id="search-advisor-btn" 
                            data-cover="Search for Advisor">
                    </div>
                    <table class="table" style="margin: .5rem 0; width: 100%"></table>
                `,
            })

            const listContainer = document.querySelector(".providence-overview--list")
            if (listContainer) {
                listContainer.prepend(searchBar)
            }
        },

        /**
         * Setup event listeners for the SearchBar module.
         */
        setupEventListeners() {
            document.querySelector("#search-advisor").addEventListener(
                "keyup",
                delay(() => {
                    document.querySelector("#search-advisor-btn").click()
                }, 400)
            )

            document.querySelector("#search-advisor-btn").addEventListener("click", () => this.handleSearch())
            document
                .querySelectorAll(".providence-overview--nav a")
                .forEach((e) => e.addEventListener("click", () => this.resetSearch()))
        },

        /**
         * Handle the search functionality.
         */
        async handleSearch() {
            const searchInput = document.getElementById("search-advisor")
            const searchTerm = searchInput?.value

            this.clearSearchTable()
            if (!searchTerm || searchTerm.length == 0) {
                this.showAdvisorListTable()
                return
            }

            const requestingAll = searchTerm.indexOf("*") == 0
            const requestingNumber = searchTerm.indexOf("#") == 0
            if (requestingAll || requestingNumber) searchInput = searchInput.substring(1)

            const table = document.querySelector(".search-bar table")
            if (!table) return

            this.hideAdvisorListTable()

            if (searchTerm === "?") {
                table.innerHTML += `<tr><td><h1>Searching can be done by Name, Email, Tags, Status, or Officer.</h1> <table style="width: 100%"><tr><th>Expressions</th><th>Results</th><th>Example</th></tr> <tr><td>|</td><td>OR</td><td>Published|Submitted</td></tr> <tr><td>,</td><td>AND</td><td>Published,SiteForward</td></tr> <tr><td>!</td><td>NOT</td><td>!Published</td></tr></table><h1>There are some extra searching as well</h1><table style="width: 100%"><tr> <th>Search</th> <th>Results</th> <th>Example</th> </tr> <tr> <td>published</td> <td>Shows all published sites</td> <td></td> </tr> <tr> <td>submitted</td> <td>Shows all submitted sites</td> <td></td> </tr> <tr> <td>approved</td> <td>Shows all approved sites</td> <td></td> </tr> <tr> <td>pending review</td> <td>Shows all sites needing revisions</td> <td></td> </tr> <tr> <td>revisions needed</td> <td>Shows all published sites</td> <td></td> </tr> <tr> <td>rejected</td> <td>Shows all rejected sites</td> <td></td> </tr> <tr> <td colspan="3"></td> </tr> <tr> <td>is_siteforward</td> <td>Shows all sites assigned to SiteForward</td> <td></td> </tr> <tr> <td>is_compliance</td> <td>Shows all sites assigned to Compliance</td> <td></td> </tr> <tr> <td>is_mlssalescompliance</td> <td>Shows all sites assigned to MLS Sales Communication</td> <td></td> </tr> <tr> <td>is_msicompliance</td> <td>Shows all sites assigned to Insurance Compliance</td> <td></td> </tr> <tr> <td>is_onhold</td> <td>Shows all sites on hold</td> <td></td> </tr> <tr> <td colspan="3"></td> </tr> <tr> <td>created_at:&lt;year&gt;/[month]/[day]</td> <td>Shows sites created at that time</td> <td>created_at:2019/08</td> </tr> <tr> <td>updated_at:&lt;year&gt;/[month]/[day]</td> <td>Shows sites updated at that time</td> <td>created_at:2019/08/01</td> </tr> <tr> <td>published_at:&lt;year&gt;/[month]/[day]</td> <td>Shows sites published at that time</td> <td>created_at:2020</td> </tr> <tr> <td>submitted_at:&lt;year&gt;/[month]/[day]</td> <td>Shows sites submitted at that time</td> <td>created_at:2020/01</td> </tr> <tr> <td colspan="3"></td> </tr> <tr> <td>#</td> <td>Shows the number of sites that match</td> <td>#Published</td> </tr> <tr> <td>*</td> <td>Shows all sites that match regardless of number</td> <td>*Published</td> </tr>`
                return
            }
            table.innerHTML = `<thead> <tr role="row"><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1">#</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Name</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Email</th><th class="has-state sorting" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Status</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="" aria-sort="descending">Last Submitted</th><th class="" rowspan="1" colspan="1" aria-label="Assigned">Assigned</th><th class="" rowspan="1" colspan="1" aria-label="Actions">Actions</th></tr> </thead>`

            const results = this.performSearch(searchTerm)
            if (results.length == 0) {
                table.innerHTML += `<tr><td colspan="7">No results found</td></tr>`
                return
            }
            if (requestingNumber || results.length > 100)
                table.innerHTML += `<tr><td colspan="7">Number of results: ${results.length}</td></tr>`
            else {
                let tbody = document.createElement("tbody")
                results.forEach((advisor, i) => {
                    advisor.prepend(createElement("td", { html: i + 1 }))
                    tbody.appendChild(advisor)
                })
                table.appendChild(tbody)
            }
        },

        /**
         * Reset the search input and show the full advisor list.
         */
        resetSearch() {
            document.querySelector("#search-advisor").value = ""
            this.clearSearchTable()
            this.showAdvisorListTable()
        },

        /**
         * Clear the search results table.
         */
        clearSearchTable() {
            const searchTable = document.querySelector(".search-bar table")
            if (searchTable) searchTable.innerHTML = ""
        },

        /**
         * Hide the advisor list table.
         */
        hideAdvisorListTable() {
            const advisorListTable = document.querySelector("#advisorsList_wrapper")
            if (advisorListTable) advisorListTable.style.display = "none"
        },

        /**
         * Show the advisor list table.
         */
        showAdvisorListTable() {
            const advisorListTable = document.querySelector("#advisorsList_wrapper")
            if (advisorListTable) advisorListTable.style.display = "block"
        },

        /**
         * Perform a search based on the provided search string.
         * Supports:
         * - Full-text search on advisor names, emails, and IDs
         * - Date-based filtering (created_at, updated_at, etc.)
         * - Special commands (e.g., ".")
         * @param {string} searchString - The search string to use for filtering results.
         * @returns {Array} - An array of search results matching the search criteria.
         */
        performSearch(searchString) {
            const searchPatterns = {
                datePattern: /^(created|updated|published|submitted)_at:(\d{4})(?:\/(\d{1,2})(?:\/(\d{1,2}))?)?$/,
                specialCommands: {
                    ".": (data) => isRandysList(data),
                    published: (data) => data.published_date !== "NA",
                    submitted: (data) => data.submitted_date !== "NA",
                    "not published": (data) => notPublished(data),
                    "advisor revisions needed": (data) => hasStatus("review completed", data),
                    is_siteforward: (data) => isSiteForward(data.officer_id),
                    is_compliance: (data) => isCompliance(data.officer_id),
                    is_mlssalescompliance: (data) => isMLSSalesCompliance(data.officer_id),
                    is_msicompliance: (data) => isMSICompliance(data.officer_id),
                    is_onhold: (data) => isOnHold(data.officer_id),
                },
            }

            // Helper function to check if item matches date criteria
            const matchesDateCriteria = (data, type, year, month = null, day = null) => {
                const date = new Date(Date.parse(data.site[type]))
                return (
                    (!year || date.getFullYear().toString() === year) &&
                    (!month || date.getMonth() === parseInt(month) - 1) &&
                    (!day || date.getDate() === parseInt(day))
                )
            }

            // Helper function to check if item matches a search term
            const matchesTerm = (item, search) => {
                const data = item.data()
                const searchLower = search.replace("&", "&amp;").toLowerCase()

                // Check special commands first
                if (searchPatterns.specialCommands[search]) {
                    return searchPatterns.specialCommands[search](data)
                }

                // Check date pattern
                const dateMatch = search.match(searchPatterns.datePattern)
                if (dateMatch) {
                    const [_, type, year, month, day] = dateMatch
                    return matchesDateCriteria(data, type + "_at", year, month, day)
                }

                // Standard text search
                return (
                    data.display_name.toLowerCase().includes(searchLower) ||
                    data.email.toLowerCase().includes(searchLower) ||
                    data._id.toLowerCase().includes(searchLower) ||
                    hasTag(searchLower, data) ||
                    hasStatus(searchLower, data) ||
                    getOfficerName(data.officer_id).toLowerCase().includes(searchLower)
                )
            }

            // Helper function to check if an item is in Randy's list
            const isRandysList = (data) => {
                return (
                    (isSiteForward(data.officer_id) && hasStatus("review completed", data)) ||
                    (isCompliance(data.officer_id) &&
                        (hasStatus("editing", data) || hasStatus("review completed", data))) ||
                    isOnHold(data.officer_id)
                )
            }

            // Get all rows from DataTable
            const rows = []
            const table = document.querySelector("#advisorsList")
            const dataTable = $(table).DataTable()
            dataTable.rows().every(function () {
                rows.push(this)
            })

            // Process each search term (split by comma for AND operations)
            return searchString
                .split(",")
                .reduce((filteredRows, searchGroup) => {
                    searchGroup = searchGroup.trim()

                    // Process OR operations (split by |)
                    return filteredRows.filter((row) => {
                        return searchGroup.split("|").some((term) => {
                            term = term.trim()
                            const invert = term.startsWith("!")
                            const searchTerm = invert ? term.slice(1) : term
                            const matches = matchesTerm(row, searchTerm)
                            return invert ? !matches : matches
                        })
                    })
                }, rows)
                .map((row) => row.node().cloneNode(true))
        },
    },
    // ======================= Advisor List ==========================
    AdvisorList: {
        init() {
            this.setupEventListeners()
        },

        setupEventListeners() {
            // When Table is redrawn and if the "Show All Advisors" button is active then update the advisor list in local storage
            // Update dropdowns when the table is redrawn
            $("#advisorsList").on(
                "draw.dt",
                delay(() => {
                    if (document.getElementById("showAllAdvisors").classList.contains("active")) {
                        document.querySelector(".providence-overview--list")?.classList.add("loadedAll")
                        this.updateAdvisorInfo()
                    }

                    this.updateDropdowns()
                    this.updateOfficerList()
                    this.checkForUnPublished()
                }, 500)
            )
        },

        /**
         * Check for unpublished advisors, if any are found add a note under their state
         */
        checkForUnPublished() {
            let rows = document.querySelectorAll("#advisorsList tbody tr")
            rows.forEach((row) => {
                const advisor = getAdvisorInfoFromTable(row._id)
                let isUnPublished = false
                if (hasStatus("approved", advisor)) {
                    let dateA = Date.parse(advisor.site.published_at),
                        dateB = Date.parse(advisor.site.submitted_at)
                    isUnPublished = dateA < dateB
                }
                if (isUnPublished) {
                    let state = row.querySelector(".has-state")
                    state.append(
                        "<p style=\"font-size: .75em;color: #1fe9ae;text-align: center;margin: 5px 0 0 0; font-family: 'Anonymous Pro', Courier, monospace;\">Not Published</p>"
                    )
                }
            })
        },

        /**
         * Update the dropdowns for each row in the advisor list table
         */
        updateDropdowns() {
            // Check if we're updating the dropdowns for the regular list or the searchbar list
            let rows = document.querySelectorAll("#advisorsList tbody tr")
            // if (document.querySelector(".search-bar tbody")) rows = document.querySelectorAll(".search-bar tbody tr")

            if (rows.length < 2) return // Not enough rows to actually be showing data

            for (const row of rows) {
                // Get the advisor ID from the row
                const advisor_id = row.querySelector("a").href.split("/").pop()
                row.setAttribute("advisor_id", advisor_id)

                const dropdown = row.querySelector(".tot_droplist ul")
                if (dropdown.childElementCount > 3) continue // Skip if dropdown already has items

                // Get advisor info from DataTable
                let advisor_info = getAdvisorInfoFromTable(advisor_id)
                if (!advisor_info) continue

                // Add Open Chat
                const open_chat = createElement("li", {
                    html: `<a href="#messages" class="open-chat-extension" data-advisor_id="${advisor_id}">Open Chat</a>`,
                })
                dropdown.appendChild(open_chat)

                // Add View Revisions
                const open_revisions = createElement("li", {
                    html: `<a href="/manage/revisions?email=${encodeURIComponent(
                        advisor_info.email
                    )}" target="_blank" class="">View Revisions</a>`,
                })
                dropdown.appendChild(open_revisions)

                // Add View Preview
                const open_preview = createElement("li", {
                    html: `<a href="https://${advisor_info.site.settings.subdomain}.app.twentyoverten.com" class="" target="_blank">View Preview Website</a>`,
                })
                dropdown.appendChild(open_preview)

                // Add View Live - this is done async since we need to fetch data to get the live url
                addLiveURLToDropdown(advisor_info.site._id)
                async function addLiveURLToDropdown(advisor_id) {
                    const site_info = await getSiteInfo(advisor_id)

                    if (site_info.site.settings.domains && site_info.site.settings.domains.length > 0) {
                        const open_live = createElement("li", {
                            html: `<a href="https://${site_info.site.settings.domains[0]}" class="" target="_blank">View Live Website</a>`,
                        })
                        dropdown.appendChild(open_live)
                    }
                }
            }
        },
        /**
         * Update list of advisor info, allows being able to see full list when not showing in table
         */
        updateAdvisorInfo() {
            advisorInfo = []
            $("#advisorsList")
                .DataTable()
                .rows()
                .data()
                .each((e, i) => {
                    advisorInfo.push(e)
                })
            localStorage.setItem("advisorList", JSON.stringify(advisorInfo))
            // Notify other scripts that the advisor list was updated
            try {
                const evt = new CustomEvent("advisorListUpdated", { detail: advisorInfo })
                document.dispatchEvent(evt)
                console.log("advisorListUpdated dispatched", advisorInfo)
            } catch (err) {
                console.warn("advisorListUpdated dispatch failed", err)
            }
        },

        /**
         * Update officer dropdowns with organized optgroups
         */
        updateOfficerList() {
            document.querySelectorAll(".form-item--control.assigned_officer").forEach((selectElement) => {
                if (selectElement.classList.contains("optGroupsAdded")) return

                const officers = {
                    Teams: [],
                    SiteForward: [],
                    "MLS Sales Communication": [],
                    "Insurance Compliance": [],
                    Miscellaneous: [],
                    Other: [],
                }

                // Organize options into groups
                selectElement.querySelectorAll("option").forEach((option) => {
                    const id = option.value.substring(option.value.indexOf("|") + 1)
                    option.setAttribute("data-id", id)

                    if (isTeam(id)) officers.Teams.push(option)
                    else if (isSiteForward(id)) officers.SiteForward.push(option)
                    else if (isMLSSalesCompliance(id)) officers["MLS Sales Communication"].push(option)
                    else if (isMSICompliance(id)) officers["Insurance Compliance"].push(option)
                    else if (isMiscellaneous(id)) officers.Miscellaneous.push(option)
                    else if (!isNotAssignable(id)) officers.Other.push(option)
                })

                // Create optgroups
                Object.entries(officers).forEach(([groupName, optionList]) => {
                    if (groupName === "Other" && optionList.length === 0) return

                    const optgroup = createElement("optgroup", {
                        label: groupName,
                        style: "padding-top: 4px;",
                    })

                    // Sort options based on account list index
                    optionList
                        .sort((a, b) => {
                            const indexA = allAccountList().indexOf(a.getAttribute("data-id"))
                            const indexB = allAccountList().indexOf(b.getAttribute("data-id"))
                            return indexA - indexB
                        })
                        .forEach((option) => {
                            const id = option.getAttribute("data-id")
                            if (!isNotActive(id)) {
                                optgroup.appendChild(option.cloneNode(true))
                            }
                            option.remove()
                        })

                    if (optgroup.children.length > 0) {
                        selectElement.appendChild(optgroup)
                    }
                })

                // Clean up any remaining ungrouped options
                selectElement.querySelectorAll(":scope > option").forEach((option) => option.remove())

                // Remove empty optgroups
                selectElement.querySelectorAll("optgroup").forEach((optgroup) => {
                    if (optgroup.children.length === 0) optgroup.remove()
                })

                // Set default selection if none exists
                if (!selectElement.querySelector("option[selected]")) {
                    const allOption = selectElement.querySelector("option[value*='all']")
                    if (allOption) selectElement.value = allOption.value
                }

                selectElement.classList.add("optGroupsAdded")

                // Hide assignees based on advisor tags
                const tagsElement = selectElement.closest("tr")?.querySelector(".advisor-tags")
                if (tagsElement) {
                    const tags = tagsElement.textContent
                    const optgroups = selectElement.querySelectorAll("optgroup")

                    // Hide MLS options if no dealer tags
                    if (!tags.includes("IIROC") && !tags.includes("MFDA")) {
                        // Hide MLS option in Teams group
                        const teamsGroup = optgroups[0]
                        if (teamsGroup?.querySelectorAll("option")[1]) {
                            teamsGroup.querySelectorAll("option")[1].style.display = "none"
                        }
                        // Hide MLS Sales Communication group
                        if (optgroups[2]) {
                            optgroups[2].style.display = "none"
                        }
                    }

                    // Hide MSI options if no insurance
                    if (tags.includes("Insurance: None")) {
                        // Hide MSI option in Teams group
                        const teamsGroup = optgroups[0]
                        if (teamsGroup?.querySelectorAll("option")[2]) {
                            teamsGroup.querySelectorAll("option")[2].style.display = "none"
                        }
                        // Hide Insurance Compliance group
                        if (optgroups[3]) {
                            optgroups[3].style.display = "none"
                        }
                    }
                }
            })
        },
    },
    // ======================= Review List =======================
    ReviewList: {
        importantTagsList: [
            "Migrating",
            "Brand New",
            "Post-Review",
            "Redesign",
            "Construction",
            "Not On Program",
            "Tier",
        ],
        reviewCount: {},
        init() {
            this.setupEventListeners()
        },

        setupEventListeners() {
            document.addEventListener("advisorListUpdated", (event) => {
                if (event.detail.length > 0) {
                    this.sortReviewCards()
                    this.addDetailsToCards()
                    this.setupRevisionCount()
                }
            })
            document.addEventListener("click", (e) => {
                if (e.target.matches(".review-table tbody tr td")) {
                    const table = e.target.closest(".review-table")
                    const clicked_row = e.target.closest("tr")
                    const clicked_category = e.target.closest("tbody").classList[0]
                    table.querySelector(".active").classList.remove("active")
                    clicked_row.classList.add("active")
                    this.filterReviewCards(clicked_category, clicked_row.children[0].textContent)
                }
            })
        },
        filterReviewCards(clicked_category, clicked_text){
            console.log("Filtering for ", clicked_category, clicked_text)
            const cards = document.querySelectorAll(".advisor-card")
            if (cards.length === 0) return
            cards.forEach((card) => {
                if (clicked_category == "officers")
                    if(card.querySelector(".cardOfficer").textContent == clicked_text)
                        card.style.display = "block"
                    else
                        card.style.display = "none"
                else if (clicked_category == "tags")
                    if(card.querySelectorAll(".tag").length > 0 && [...card.querySelectorAll(".tag")].some(tag=> tag.textContent == clicked_text))
                        card.style.display = "block"
                    else
                        card.style.display = "none"
            })

        },

        /**
         * Sort advisor review cards by priority and time
         */
        sortReviewCards() {
            const advisorCards = document.querySelectorAll(".advisor-card")
            if (advisorCards.length === 0) return

            // Convert to array and sort
            const sortedCards = Array.from(advisorCards).sort((a, b) => {
                // Get advisor names from cards
                const nameA = a.dataset.name
                const nameB = b.dataset.name

                // Load advisor info from DataTable
                const infoA = getAdvisorInfoByNameFromTable(nameA)
                const infoB = getAdvisorInfoByNameFromTable(nameB)

                // Get current times for both cards in minutes
                const timeA = this.parseTimeToMinutes(a.querySelector(".submitted")?.textContent || "")
                const timeB = this.parseTimeToMinutes(b.querySelector(".submitted")?.textContent || "")

                // Check if either card is a construction page
                const isConstructionA = hasTag("Construction", infoA)
                const isConstructionB = hasTag("Construction", infoB)

                // Construction Pages come first
                if (isConstructionA && !isConstructionB) return -1
                if (isConstructionB && !isConstructionA) return 1

                // Compare time (newer submissions first)
                return timeA < timeB ? 1 : timeA > timeB ? -1 : 0
            })

            // Re-append sorted cards to the container
            const container = document.querySelector(".providence-pending--list")
            if (container) {
                sortedCards.forEach((card) => container.appendChild(card))
            }
        },

        /**
         * Parse time string to minutes for comparison
         * @param {string} timeString - Time string like "2 months ago", "3 days ago", etc.
         * @returns {number} - Time in minutes
         */
        parseTimeToMinutes(timeString) {
            if (!timeString) return 0

            const time = timeString.toLowerCase()
            let value = 1
            let unit = ""

            // Extract number and unit
            const parts = time.split(" ")
            if (parts[0] && parts[0] !== "a" && parts[0] !== "an") {
                value = parseInt(parts[0]) || 1
            }

            // Determine unit
            if (time.includes("month")) {
                unit = "months"
            } else if (time.includes("day")) {
                unit = "days"
            } else if (time.includes("hour")) {
                unit = "hours"
            } else {
                unit = "minutes"
            }

            // Convert to minutes
            switch (unit) {
                case "months":
                    return value * 60 * 24 * 30
                case "days":
                    return value * 60 * 24
                case "hours":
                    return value * 60
                default:
                    return value
            }
        },
        setupRevisionCount() {
            const advisor_cards = document.querySelectorAll(".advisor-card")
            this.reviewCount = { all: { sites: 0, pending: 0, total: 0 }, tags: {}, officers: {} }
            advisor_cards.forEach(async (card) => {
                const revisions = await this.getRevisions(card.getAttribute("advisor_id"))
                card.querySelector(".cardApprovals").textContent = revisions.approved
                card.querySelector(".cardPending").textContent = revisions.pending
                card.querySelector(".cardRejections").textContent = revisions.rejected

                // Update overall review count
                this.reviewCount.all.sites += 1
                this.reviewCount.all.pending += revisions.pending
                this.reviewCount.all.total += revisions.approved + revisions.pending + revisions.rejected

                // Update tag review count
                const tags = card.querySelectorAll(".tag")
                tags.forEach((tag) => {
                    let tag_name = tag.textContent
                    if (!this.reviewCount.tags[tag_name])
                        this.reviewCount.tags[tag_name] = { sites: 0, pending: 0, total: 0 }
                    this.reviewCount.tags[tag_name].sites += 1
                    this.reviewCount.tags[tag_name].pending += revisions.pending
                    this.reviewCount.tags[tag_name].total += revisions.approved + revisions.pending + revisions.rejected
                })

                // Update officer review count
                const officer_name = card.querySelector(".cardOfficer")?.textContent
                if (!this.reviewCount.officers[officer_name])
                    this.reviewCount.officers[officer_name] = { sites: 0, pending: 0, total: 0 }
                this.reviewCount.officers[officer_name].sites += 1
                this.reviewCount.officers[officer_name].pending += revisions.pending
                this.reviewCount.officers[officer_name].total +=
                    revisions.approved + revisions.pending + revisions.rejected

                this.updateReviewTable()
            })
        },
        updateReviewTable() {
            const reviewFilter = createElement("div", {
                class: "review-filter",
                html: `
                <h2>Pending Reviews</h2>
                <table class="review-table">
                 <thead><tr><th>Filter</th><th>Sites</th><th>Pending</th></tr></thead><thead>
                 <tbody class="all">
                    <tr class="active"><td>All in Review</td><td>${this.reviewCount.all.sites}</td><td>${this.reviewCount.all.pending}</td></tr>
                 </tbody>
                
                <thead><tr><th>Filter by Officer</th></tr></thead>
                <tbody class="officers">
                ${Object.entries(this.reviewCount.officers)
                    .map(([officer, data]) => {
                        return `<tr><td>${officer}</td><td>${data.sites}</td><td>${data.pending}</td></tr>`
                    })
                    .join("")}
                </tbody>
                <thead><tr><th>Filter by Tags</th></tr></thead>
                <tbody class="tags">
                ${Object.entries(this.reviewCount.tags)
                    .map(([tag, data]) => {
                        return `<tr><td>${tag}</td><td>${data.sites}</td><td>${data.pending}</td></tr>`
                    })
                    .join("")}
                </tbody>
                </table>`,
            })
            document.querySelector(".providence-pending--title").innerHTML = reviewFilter.outerHTML
        },

        /**
         * Get the revisions for a specific advisor's review
         * @param {*} advisor_id
         * @returns
         */
        async getRevisions(advisor_id) {
            const data = await fetch(`${baseUrl}/manage/advisor/${advisor_id}`)
            const response = await data.text()
            const parser = new DOMParser()
            const doc = parser.parseFromString(response, "text/html")

            const approved = doc.querySelectorAll(".review-item.approved-status").length
            const rejected = doc.querySelectorAll(".review-item.rejected-status").length
            const pending = doc.querySelectorAll(".review-item").length - approved - rejected
            return { approved, pending, rejected }
        },

        /**
         * Add details to each advisor card
         */
        addDetailsToCards() {
            document.querySelectorAll(".advisor-card").forEach((card) => {
                // Add card status section
                if (!card.querySelector(".card-status")) {
                    const cardContent = card.querySelector(".card-content")
                    const cardStatus = createElement("div", { class: "card-status" })
                    cardContent?.prepend(cardStatus)

                    // Move submitted and changes elements to card status
                    const submitted = card.querySelector(".submitted")
                    const changes = card.querySelector(".card-changes")
                    if (submitted) cardStatus.appendChild(submitted)
                    if (changes) cardStatus.appendChild(changes)
                }

                // Add card title section
                if (!card.querySelector(".card-title")) {
                    const cardTitle = createElement("div", { class: "card-title" })
                    card.prepend(cardTitle)

                    // Move advisor profile and h4 to card title
                    const advisorProfile = card.querySelector(".advisor-profile")
                    const h4 = card.querySelector("h4")
                    if (advisorProfile) cardTitle.appendChild(advisorProfile)
                    if (h4) cardTitle.appendChild(h4)
                }

                const advisor_id = card.querySelector(".btn--action-review")?.href.split("/").pop()
                const advisor_info = getAdvisorInfoFromTable(advisor_id)
                card.setAttribute("advisor_id", advisor_id)

                // Add card tags section
                if (!card.querySelector(".card-tags")) {
                    const cardContent = card.querySelector(".card-content")
                    cardContent?.appendChild(createElement("div", { class: "card-tags" }))
                }

                // Add card tier section
                if (!card.querySelector(".card-tier")) {
                    const cardContent = card.querySelector(".card-content")
                    cardContent?.appendChild(createElement("div", { class: "card-tier" }))
                }

                // Add card changes section
                if (!card.querySelector(".card-changes")) {
                    const submitted = card.querySelector(".submitted")
                    if (submitted) {
                        const cardChanges = createElement("div", {
                            class: "card-changes",
                            html: '<span><span class="cardApprovals"></span> - <span class="cardPending"></span> - <span class="cardRejections"></span></div>',
                        })
                        submitted.insertAdjacentElement("afterend", cardChanges)
                    }
                }

                // Add card extras section
                if (!card.querySelector(".card-extras")) {
                    const officer_name = getOfficerName(advisor_info.officer_id)
                    let important_tags = ""

                    advisor_info.settings.broker_tags.forEach((tag) => {
                        if (this.importantTagsList.some((importantTag) => tag.name.indexOf(importantTag) > -1))
                            important_tags += `<span class="tag">${tag.name}</span>, `
                    })
                    important_tags = important_tags.slice(0, -2) // Remove trailing comma and space

                    const cardContent = card.querySelector(".card-content")
                    const cardExtras = createElement("div", {
                        class: "card-extras",
                        html: `<p class="cardOfficer" style="margin: 0">${officer_name}</p><p class="cardImportantTags" style="line-height: 1; margin: 0">${important_tags}</p>`,
                    })
                    cardContent?.appendChild(cardExtras)
                }

                // Add the Open chat button to the card
                if (!card.querySelector(".open-chat-extension")) {
                    const reviewBtn = card.querySelector(".card-action .btn--action-review")
                    if (reviewBtn) {
                        reviewBtn.target = "_blank"

                        const chatBtn = createElement("a", {
                            href: "#messages",
                            style: "margin-left: 5px;flex-grow:1",
                            class: "btn pill primary btn--action-review open-chat-extension",
                            "data-advisor_id": advisor_id,
                            "data-cover": "Open Chat",
                            html: "Open Chat",
                        })

                        const cardAction = card.querySelector(".card-action")
                        cardAction?.appendChild(chatBtn)
                    }
                }
            })
        },
    },
}

// =============================================================================
// Advisor Page Module
// =============================================================================
const Advisor = {
    advisor_id: null,
    advisor_info: null,
    init(){
        this.advisor_id = urlParts[5]
        if (this.advisor_id[this.advisor_id.length - 1] === "#")
            this.advisor_id = this.advisor_id.slice(0, -1)

        this.advisor_info = getAdvisorInfoFromTable(this.advisor_id)
        AdvisorDetails.init(this.advisor_info)

        this.setupEventListeners()
        this.setupAlwaysShowReviewSubmission()
        this.addPendingCount()
        this.addSiteForwardControls()
        this.setupReviewItemNotes()
        this.updateViewButtonText()
        this.checkEmptyReview()

        // this.InternalDB.init()
    },
    setupEventListeners(){
        document.addEventListener("click", async (e) => {
            if(e.target.matches(".btn-clear-state")){
                const review_id = e.target.closest(".review-item").querySelector("[data-id]").getAttribute("data-id")
                await fetch(`${baseUrl}/api/revisions/${review_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ state: "", internal_notes: "", notes: "" })
                })
                window.location.reload()
            }
        })
        document.addEventListener("click", async (e) => {
            if(e.target.matches("#revision-note-overlay .save")){
                const overlay = document.querySelector("#revision-note-overlay")
                await waitForClassAsync(true, overlay, "velocity-animating")
                await waitForClassAsync(false, overlay, "velocity-animating")
                const review_id = e.target.getAttribute("data-id")
                this.addReviewItemNotesToPage(review_id)
            }
        })
        document.addEventListener("click", (e)=>{
            if(e.target.matches(".btn--action-approve, .btn--action-reject"))
                setTimeout(this.addPendingCount, 100)
        })
    },
    setupAlwaysShowReviewSubmission(){
        document.querySelector(".review-submission").classList.add("showing")
    },
    checkEmptyReview(){
        if(document.querySelector(".changes-list")?.children?.length == 0)
            document.querySelector(".changes-header").append(
                createElement("div",{
                    html: `<h3>Something was put into draft mode</h3><p>This is a bug in the platform and shouldn't have come in for review.</p>`
                })
            )
    },
    addPendingCount(){
        document.querySelector(".pending-count")?.remove() // Remove if already there
        const pending_count = createElement('div',{
            class: "approved-count pending-count",
            html: `<span class="active">${$(".review-item:not(.approved-status):not(.rejected-status)").length}</span> Pending Changes`
        })
        document.querySelector(".approved-count").insertAdjacentElement("afterend", pending_count)
    },
    updateViewButtonText(){
        const review_items = document.querySelectorAll(".review-item")
        review_items.forEach((item) => {
            if(item.querySelector(".review-actions a").textContent.includes("Link")){
                const link = item.querySelector(".review-actions a")
                if(link.href.indexOf("http") == 0)
                    link.text = "Visit External Link"
                else if (link.href.indexOf("#") == 0){
                    link.text = "Visit Section Link"
                    link.href = link.href.replace("app.twentyoverten.com/manage/advisor/", "")
                }else{
                    link.innerHTML = "Navigation Link"
                    link.removeAttribute("href")
                    link.style = "cursor: no-drop"
                    link.classList.add("approve-item")
                    link.classList.add("active")
                    link.title = "Just a navigation link, has no content."
                }
            }
        })
    },
    addSiteForwardControls(){
        const approve_all_btn = createElement("a",{
            href: '#',
            class: "btn pill btn--action-approve btn-approve-all",
            html: "Approve All",
            onclick: () => {
                document.querySelectorAll(".review-actions .approve-item").forEach((btn) => btn.click())
            }
        })
        document.querySelector(".changes-header .btn-group").appendChild(approve_all_btn)

        const add_note_to_all_btn = createElement("a", {
            href: '#',
            class: "btn pill btn--action-review btn-add-note-all",
            html: "Add Note to All",
            onclick: () => {
                const note = prompt("Add your note")
                if (!note) return

                const revisionIds = [...document.querySelectorAll(".revision-note")].map(rev => 
                    rev.getAttribute("data-id")
                )

                const updatePromises = revisionIds.map(id => 
                    fetch(`${baseUrl}/api/revisions/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ internal_notes: note })
                    })
                )

                Promise.all(updatePromises).then(() => {
                    window.location.reload()
                }).catch(error => {
                    console.error("Failed to update some revisions:", error)
                })
            }
        })
        document.querySelector(".changes-header .btn-group").appendChild(add_note_to_all_btn)

        const clear_state = createElement("a", {
            href: '#',
            class: "btn pill btn--action-default btn-clear-state",
            html: "Clear State",
            title: "Clear the state and all notes"
        })
        document.querySelectorAll(".review-actions").forEach((action) => {
            action.appendChild(clear_state.cloneNode(true))
        })
    },
    setupReviewItemNotes(){
        const review_items = document.querySelectorAll(".review-item")
        review_items.forEach((item) => {
            const review_id = item.querySelector("[data-id]").getAttribute("data-id")
            item.setAttribute("data-id", review_id)
            this.addReviewItemNotesToPage(review_id)
        })
    },
    async addReviewItemNotesToPage(review_id){
        const { status, officer, date, note, rejection } = await this.getReviewInfoFromRevisionsPage(review_id)
        if (!status) return
        const review_item = document.querySelector(`.review-item[data-id="${review_id}"]`)

        // Remove if already existing
        review_item.querySelector(`.review-item-preview`)?.remove()
        const review_item_preview = createElement("div", {
                class: "review-item-preview",
                html: `
                <p class="review-details"><span class="officer">Reviewed by: ${officer}</span> - <span class="date">${date}</span></p>
                ${note ? `<div class="review-note"><h3>Review Note</h3><div class="review-html">${note}</div></div>` : ""}
                ${rejection ? `<div class="review-rejection"><h3>Rejection Note</h3><div class="review-html">${rejection}</div></div>` : ""}
                `
            })
            review_item.appendChild(review_item_preview)
    },
    async getReviewInfoFromRevisionsPage(review_id){
        let response = await fetch(`${baseUrl}/manage/revisions/${this.advisor_id}/${review_id}`)
        if (!response.ok) return {}
        const text = await response.text()
        const doc = new DOMParser().parseFromString(text, "text/html")
        const info = doc.querySelectorAll(".print-timestamp-title + span")
        const date = info[0].textContent
        const officer = info[1].textContent
        const status = info[2].textContent
        const note = doc.querySelector(".is-compliance-notes")?.innerHTML
        const rejection = doc.querySelector(".is-rejection-notes")?.innerHTML
        return { status, officer, date, note, rejection }
    },
    setupLastReviewed(){
        const last_reviewed_id = localStorage.getItem("last_reviewed_id")
        if (!last_reviewed_id) return

        const last_reviewed_item = document.querySelector(`.review-item[data-id="${last_reviewed_id}"]`)
        if (!last_reviewed_item) return

        last_reviewed_item.scrollIntoView({ behavior: "smooth" })
        localStorage.removeItem("last_reviewed_id")
    },

    // ======================= Review List =======================
    ReviewList:{
        init(){
            this.setupEventListeners()
            this.loadNotes()
            this.updateLastReviewed()
        },
        setupEventListeners(){
            // Setup event listeners for the review list
        },
        updateLastReviewed(){
          localStorage.setItem("last_reviewed_id", urlParts[6])  
        },
        loadNotes(){
            const review_items = document.querySelectorAll(".review-item")
            review_items.forEach(async (item) => {
                const review_id = item.querySelector("[data-id]").getAttribute("data-id")
                const notes = await this.fetchReviewInfo(review_id)
            })
        },
        async fetchReviewInfo(review_id){
            const response = await fetch(`${baseUrl}/api/rvisions/${review_id}`)
            this.reviewInfo = await response.json()
            return this.reviewInfo
        }
    },

    // ======================= InternalDB =======================
    InternalDB:{
        init(){

        }
    }
}

// =============================================================================
// Review Page Module
// =============================================================================
const Review = {
    advisorInfo: null,
    async init(){
        let advisor_id = urlParts[5]
        if (advisor_id[advisor_id.length - 1] === "#")
            advisor_id = advisor_id.slice(0, -1)

        this.advisorInfo = getAdvisorInfoFromTable(advisor_id)
        AdvisorDetails.init(this.advisorInfo)
        
        this.setupEventListeners()
    },
    setupEventListeners(){
        // Setup event listeners for the review page
    }
    //TODO: Implement the rest - starts line #2267
}





// ==================================================== OLD CODE ============================================================

function oldready() {
    //Get the URL Parts
    let urlParts = window.location.href.split("/")

    //If currently reviewing
    if ((urlParts.length > 4 && urlParts[4] === "advisor") || (urlParts.length > 4 && urlParts[4] === "advisor#")) {
        //Add p on side for Advisor Tags
        $($(".details-wrapper").find("header")).append(
            '<p class="secondary center advisor-tags" style="font-size: .8em"></p>'
        )
        let advisorId = urlParts[urlParts.length - 1]
        if (advisorId[advisorId.length - 1] == "#") advisorId = advisorId.substr(0, advisorId.length - 1)

        //Get advisor
        let advisor = getAdvisorInfoByID(advisorId)

        //Create string with tags
        let tags = ""
        if (advisor && advisor.settings && advisor.settings.broker_tags)
            advisor.settings.broker_tags.forEach(function (e) {
                tags += "<br>" + e.name
            })

        //Add tags
        $(".advisor-tags").html(tags.substr(4, tags.length))
        if (advisor && advisor.email)
            $(".advisor-quick-links").append(
                '<a href="/manage/revisions?email=' +
                    encodeURIComponent(advisor.email) +
                    '" class="btn pill secondary btn--action-default" style="max-width: unset">View Revisions</a>'
            )

        $(".advisor-actions").append(
            '<li><a href="https://' +
                advisor?.site?.settings?.subdomain +
                '.app.twentyoverten.com" class="tot_tip top center" data-content="View Preview Website"><svg id="icon-preview-website" viewBox="0 0 24 24" class="action-icon"> <path d="M8.617,12.682H5.9a6.149,6.149,0,0,0,4.544,5.258,12.465,12.465,0,0,1-1.207-2.378A9.792,9.792,0,0,1,8.617,12.682Z"> </path> <path d="M10.444,6.062A6.147,6.147,0,0,0,5.9,11.318H8.617A10.69,10.69,0,0,1,10.444,6.062Z"></path> <path d="M9.981,11.32h4.038A8.453,8.453,0,0,0,13.8,9.956a9.382,9.382,0,0,0-.376-1.207,10.325,10.325,0,0,0-.479-1.036q-0.271-.511-0.49-0.841T12,6.237q-0.235.3-.45,0.637t-0.49.844a9.048,9.048,0,0,0-.858,2.24A8.275,8.275,0,0,0,9.981,11.32Z"> </path> <path d="M12,0A12,12,0,1,0,24,12,12,12,0,0,0,12,0Zm7.242,13.947a7.416,7.416,0,0,1-1.843,3.26,7.431,7.431,0,0,1-1.457,1.18,7.514,7.514,0,0,1-1.728.781,7.408,7.408,0,0,1-1.925.327Q12.192,19.5,12,19.5t-0.288-.005a7.514,7.514,0,0,1-6.235-3.787,7.6,7.6,0,0,1-.719-1.76,7.461,7.461,0,0,1,0-3.893A7.416,7.416,0,0,1,6.6,6.794a7.431,7.431,0,0,1,1.457-1.18,7.514,7.514,0,0,1,1.728-.781,7.408,7.408,0,0,1,1.925-.327Q11.808,4.5,12,4.5t0.288,0.005a7.514,7.514,0,0,1,6.235,3.787,7.6,7.6,0,0,1,.719,1.76A7.461,7.461,0,0,1,19.242,13.947Z"> </path> <path d="M13.556,6.061h0a10.792,10.792,0,0,1,1.833,5.258H18.1A6.149,6.149,0,0,0,13.556,6.061Z"></path> <path d="M13.555,17.94A6.15,6.15,0,0,0,18.1,12.682H15.387A10.782,10.782,0,0,1,13.555,17.94Z"></path> <path d="M14.019,12.682H9.981a8.453,8.453,0,0,0,.221,1.364,9.381,9.381,0,0,0,.376,1.207,10.312,10.312,0,0,0,.479,1.036q0.271,0.511.49,0.841T12,17.765q0.235-.3.453-0.637t0.49-.844a10.017,10.017,0,0,0,.479-1.036,9.631,9.631,0,0,0,.376-1.2A8.274,8.274,0,0,0,14.019,12.682Z"> </path> </svg></a></li>'
        )

        //Load Notes
        let notesLoaded = false
        $("#advisor-details").prepend(
            '<div class="sidebar-module advisor-notes" tabindex="0" ><div class="sidebar-module-icon"><i class="far fa-pencil-alt"></i><span>Notes</span></div><div class="sidebar-module-wrapper"><div class="sidebar-module-header">Website Notes</div><div class="sidebar-module-body"><div class="sidebar-module-message"><div class="sidebar-module-message-content" style="color: #9a9a9a; border-radius: 10px; "><textarea style="width: 100%;height: 100%;padding: 5px;" class="updateNotes-textarea" placeholder="Loading Notes..."></textarea></div></div></div><div class="sidebar-module-footer"><button class="btn updateNotes-button" style="display: none">Save</button></div></div></div>'
        )
        $(".advisor-notes").on("click", function () {
            loadNotes()
        })
        $(".updateNotes-textarea").on(
            "keyup",
            delay(() => $(".updateNotes-button").show(), 1000)
        )

        let statusesLoaded = false
        $("#advisor-details").prepend(
            '<div class="sidebar-module advisor-statuses" tabindex="0" ><div class="sidebar-module-icon"><i class="far fa-comments-alt"></i><span>Status</span></div><div class="sidebar-module-wrapper"><div class="sidebar-module-header">Website Status</div><div class="sidebar-module-body"><div class="sidebar-module-message statusPlaceholder"><div class="sidebar-module-message-content" style=" padding: 20px; color: #9a9a9a; border-radius: 10px; text-align:center">Loading Statuses...</div></div></div><div class="sidebar-module-footer"><textarea class="addStatus-input" type="text" placeholder="Add a status"></textarea><button class="btn addStatus-button">Send</button></div></div></div>'
        )
        $(".advisor-statuses").on("click", function () {
            loadStatuses()
        })

        //Notes
        $(".updateNotes-button").on("click", function (event) {
            $(".updateNotes-button").text("Updating Notes...")
            updateNotes(advisorId, $(".updateNotes-textarea").val())
                .then((data) => {
                    $(".updateNotes-button").text("Notes Updated!")
                    setTimeout(function () {
                        $(".updateNotes-button").text("Save")
                        $(".updateNotes-button").hide()
                    }, 1500)
                })
                .catch((err) => {
                    $(".updateNotes-button").text("Unable to update notes!")
                    setTimeout(function () {
                        $(".updateNotes-button").text("Save")
                    }, 1500)
                })
        })

        function loadNotes() {
            if (notesLoaded) return

            getNotes(advisorId)
                .then((notes) => {
                    notesLoaded = true
                    $(".updateNotes-textarea")[0].placeholder =
                        "There are no notes for this website.\nClick here to add some."
                    if (notes) $(".updateNotes-textarea").val(notes.message)
                })
                .catch((err) => {
                    $(".updateNotes-textarea")[0].placeholder = "Unable to load notes."
                })
        }

        $(".addStatus-button").on("click", function (event) {
            let officer = $("#header").find(".display-name + small").text()
            let message = $(".addStatus-input").val()
            let now = new Date()
            addStatus(advisorId, officer, message)
                .then((data) => {
                    $(".statusPlaceholder").remove()
                    $(".addStatus-input").val("")
                    let date = now
                    let term = date.getHours() >= 12 ? "pm" : "am"
                    date =
                        date.getMonth() +
                        "/" +
                        date.getDate() +
                        "/" +
                        date.getFullYear() +
                        " - " +
                        (date.getHours() % 12 || 12) +
                        ":" +
                        (date.getMinutes() < 10 ? "0" : "") +
                        date.getMinutes() +
                        term
                    $(".sidebar-module.advisor-statuses .sidebar-module-body").append(
                        '<div class="sidebar-module-message"><div class="sidebar-module-message-icon"><i class="fas fa-trash-alt"></i></div><div class="sidebar-module-message-info"><span class="sidebar-module-message-name">' +
                            officer +
                            '</span><span class="sidebar-module-message-time" data-time="' +
                            now.getTime() +
                            '">' +
                            date +
                            '</span></div><div class="sidebar-module-message-content">' +
                            message +
                            "</div></div>"
                    )
                    $(".sidebar-module.advisor-statuses .sidebar-module-body").scrollTop(function () {
                        return this.scrollHeight
                    })
                    $(".sidebar-module-message-icon")
                        .off()
                        .on("click", function (e) {
                            let confirmation = confirm("Are you sure you want to delete this status?")
                            if (confirmation == true) {
                                let messageModule = $(this).parent()
                                let timeStamp = messageModule.find("[data-time]").data("time")
                                delStatus(advisorId, timeStamp)
                                    .then((data) => {
                                        messageModule.remove()
                                    })
                                    .catch((err) => {
                                        alert("Unable to delete status.")
                                    })
                            }
                        })
                })
                .catch((err) => {
                    alert("Unable to add Status")
                })
        })

        function loadStatuses() {
            if (statusesLoaded) {
                $(".sidebar-module.advisor-statuses .sidebar-module-body").scrollTop(function () {
                    return this.scrollHeight
                })
                return
            }

            getStatuses(advisorId).then((statuses) => {
                statusesLoaded = true
                if (statuses.length > 0) {
                    $(".sidebar-module.advisor-statuses .sidebar-module-body").empty()
                    statuses
                        .sort(function (i1, i2) {
                            if (i1.timestamp > i2) return -1
                            else return 1
                        })
                        .forEach((item) => {
                            let date = new Date(item.timestamp)
                            let term = date.getHours() >= 12 ? "pm" : "am"
                            date =
                                date.getMonth() +
                                1 +
                                "/" +
                                date.getDate() +
                                "/" +
                                date.getFullYear() +
                                " - " +
                                (date.getHours() % 12 || 12) +
                                ":" +
                                (date.getMinutes() < 10 ? "0" : "") +
                                date.getMinutes() +
                                term
                            $(".sidebar-module.advisor-statuses .sidebar-module-body").append(
                                '<div class="sidebar-module-message"><div class="sidebar-module-message-icon"><i class="fas fa-trash-alt"></i></div><div class="sidebar-module-message-info"><span class="sidebar-module-message-name">' +
                                    item.officer +
                                    '</span><span class="sidebar-module-message-time" data-time="' +
                                    item.timestamp +
                                    '">' +
                                    date +
                                    '</span></div><div class="sidebar-module-message-content">' +
                                    item.message +
                                    "</div></div>"
                            )
                        })
                    $(".sidebar-module.advisor-statuses .sidebar-module-body").scrollTop(function () {
                        return this.scrollHeight
                    })
                    $(".sidebar-module-message-icon")
                        .off()
                        .on("click", function (e) {
                            let confirmation = confirm("Are you sure you want to delete this status?")
                            if (confirmation == true) {
                                let messageModule = $(this).parent()
                                let timeStamp = messageModule.find("[data-time]").data("time")
                                delStatus(advisorId, timeStamp)
                                    .then((data) => {
                                        messageModule.remove()
                                    })
                                    .catch((err) => {
                                        alert("Unable to delete status.")
                                    })
                            }
                        })
                } else
                    $(".sidebar-module.advisor-statuses .sidebar-module-message-content").html(
                        "There are no statuses for this website."
                    )
            })
        }

        //Scroll down if needed
        setTimeout(function () {
            if (localStorage.getItem("lastReviewed")) {
                let lastReviewed = JSON.parse(localStorage.getItem("lastReviewed"))
                if (lastReviewed && lastReviewed.id == advisorId) {
                    localStorage.setItem("lastReviewed", null)
                    $([document.documentElement, document.body]).animate(
                        {
                            scrollTop: $(".title:contains(" + lastReviewed.title + ")").offset().top - 120,
                        },
                        1000
                    )
                } else localStorage.setItem("lastReviewed", null)
            }
        }, 2000)

        if (localStorage.getItem("IsSiteForward") == "true") {
            $(".changes-header .btn-group").append(
                '<a href="#" class="btn pill btn--action-approve approve-all">Approve All</a><a href="#" class="btn pill btn--action-review add-note-to-all">Add Note to All</a>'
            )
            document.querySelector(".approve-all").addEventListener("click", () => {
                document.querySelectorAll(".approve-item").forEach((elm) => elm.click())
            })
            document.querySelector(".add-note-to-all").addEventListener("click", () => {
                var note = prompt("Add your note")
                if (note != null) {
                    let revision_ids = [...document.querySelectorAll(".revision-note")].map((rev) =>
                        rev.getAttribute("data-id")
                    )
                    let promises = []
                    revision_ids.forEach((id) => {
                        promises.push(
                            new Promise((resolve, reject) => {
                                $.ajax({
                                    method: "PUT",
                                    dataType: "json",
                                    cache: false,
                                    data: { internal_notes: note },
                                    url: "https://app.twentyoverten.com/api/revisions/" + id,
                                    success: function () {
                                        resolve(id)
                                    },
                                    error: function () {
                                        reject(id)
                                    },
                                })
                            })
                        )
                    })
                    Promise.all(promises).then(() => window.location.reload())
                }
            })
        }

        if ($(".changes-list")[0]?.children.length == 0) {
            $("body.providence .review-submission").css("bottom", "100px")
            $(".changes-list").append(
                "<h3>Something was put into draft mode</h3><p>This is a bug in the platform and shouldn't have come in for review.</p>"
            )
        }

        //Add pending review count
        $(".approved-count").after(
            '<div class="approved-count pending-count"><span class="active">' +
                $(".review-item:not(.approved-status):not(.rejected-status)").length +
                "</span> Pending Changes</div>"
        )

        //Update pending review count on approve/reject click
        $(".btn--action-approve, .btn--action-reject").on("click", function () {
            $(".pending-count span").html($(".review-item:not(.approved-status):not(.rejected-status)").length)
        })

        $(".btn--action-default.revision-note, .btn--action-reject").on("click", function () {
            let scrollBackTo = $(this)

            setTimeout(
                delay((e) => {
                    //Add notes & scroll back down when save is clicked
                    $(".settings-wrapper .btn.primary.btn-lg.save, .settings-wrapper .btn.btn-text.cancel").on(
                        "click",
                        function () {
                            //Wait 2 seconds
                            setTimeout(
                                delay((e) => {
                                    updateAllReviewItemNotes()
                                    $([document.documentElement, document.body]).animate(
                                        {
                                            scrollTop: scrollBackTo.offset().top - 120,
                                        },
                                        1000
                                    )
                                }),
                                1500
                            )
                        }
                    )
                }),
                2000
            )
        })

        //When archives are opened
        $(".open-archives").on("click", function () {
            //Wait 2 seconds
            let attempts = 0,
                waiting = setInterval(() => {
                    if (attempts++ > 50) {
                        clearInterval(waiting)
                        alert(
                            "Unable to load Archives.\nThis is a known bug, to fix it please log in as the account then refresh this page or view the archives in the website engine."
                        )
                    }

                    if (document.querySelector("#archives-overlay").classList.contains("loading")) return

                    // For each archive item adjust the styling
                    $(".archive-item").each(function () {
                        $(this).css("flex-flow", "row wrap")
                        $(this).find(".archive-actions")[0].style = "position: absolute; top: 20px; right: 20px;"

                        //Load the archive note
                        let url = $(this).find(".btn-group").children().first()[0].href
                        updateNotes(this, url)
                    })

                    async function updateNotes(item, url) {
                        //Get the notes
                        let notes = await getNotes(url)

                        //Add the notes, and the styling
                        if (notes) {
                            $(item).append(
                                '<div class="compliance-notes" style="font-size: 14px; width: 100%;">' +
                                    notes +
                                    "</div>"
                            )
                            $(item).find("span.small").css("font-size", "12px")
                        }
                    }

                    function getNotes(url) {
                        return new Promise(function (resolve) {
                            //Read the note from the page
                            $.get(url).done((data) => {
                                let $data = $(data)

                                //Try to get the notes
                                let notes = $data.find(".is-compliance-notes").html()

                                //Get the notes if it wasn't found the previous way
                                if (!notes)
                                    notes =
                                        '<span class="small">Approved By: ' +
                                        $($data.find(".print-timestamp-title + span")[2]).html() +
                                        "</span>"
                                resolve(notes)
                            })
                        })
                    }

                    clearInterval(waiting)
                }, 50)
        })

        updateAllReviewItemNotes()

        function updateAllReviewItemNotes() {
            // For all approved/rejected items get the review information
            $(".review-item").each(async function (i, e) {
                let $e = $(e)
                let reviewId = $e.find(".review-actions").find(".revision-note").data("id")

                //TODO: Use revision api

                //If a review id was found, get the review - need to do this way as revision API doesn't return officer info
                if (reviewId) {
                    displayReviewer(baseUrl + "manage/revisions/" + advisorId + "/" + reviewId, $e, function () {
                        if (!$e.hasClass("approved-status") && !$e.hasClass("rejected-status"))
                            $e.find(".review-item-preview").find(".approvedByNote").text("")
                    })
                }
            })
        }

        //For each review item check if it's a link
        $(".review-item").each(function (i, e) {
            if (
                $(e).find(".review-actions a")[0].innerHTML == "View Link" ||
                $(e).find(".review-actions a")[0].innerHTML == "Review Link"
            ) {
                let link = $(e).find(".review-url").text()
                let review = $(e).find(".review-actions a")[0]

                //Indicate if the link is External or Internal
                if (link.indexOf("http") >= 0) review.innerHTML = "Visit External Link"
                else if (link.indexOf("#") >= 0) {
                    review.innerHTML = "Visit Section Link"
                    review.href = review.href.replace("app.twentyoverten.com/manage/advisor/", "")
                } else {
                    review.innerHTML = "Navigation Link"
                    review.removeAttribute("href")
                    review.style = "cursor: no-drop"
                    review.classList.add("approve-item")
                    review.classList.add("active")
                    review.title = "Just a navigation link, has no content."
                }
            }
        })
    }

    // Revisions Page
    else if (
        (urlParts.length > 4 && urlParts[4].indexOf("revisions") == 0) ||
        (urlParts.length > 4 && urlParts[4].indexOf("revisions#") == 0)
    ) {
        // Check if an email was provided in the URL
        var email = null
        var urlParams = new URLSearchParams(window.location.search)
        email = urlParams.get("email")

        //If an email was provided, force a search of the revisions table
        if (email) {
            var prefixs = ["siteforwardprogram+", "digitaladvisorprogram+"]
            prefixs.forEach((prefix) => {
                if (email.indexOf(prefix) == 0) email = email.substr(prefix.length, email.length)
            })

            // Wait 2 seconds after the page loads to ensure the revisions load
            setTimeout(() => {
                //Search the table, and re-drawn it
                $("#revisions-list").DataTable().search(email).draw()
            }, 2000)
        }

        $(".providence--page-title").after(
            '<a class="btn primary btn--action-review" id="reportorize-btn" style="    position: fixed; z-index:100; bottom: 20px;  right: 20px;">Reportorize It</a>'
        )

        //When DataTable gets drawn
        $("#revisions-list").on("page.dt", function () {
            $("#reportorize-btn")[0].text = "Reportorize It"
        })

        $("#reportorize-btn").on("click", function () {
            $("#revisions-list_filter").hide()
            $(".reports-toolbar").hide()
            if (this.text == "Copy Table") {
                selectElementContents($(".table")[0])
                document.execCommand("copy")

                function selectElementContents(el) {
                    let body = document.body,
                        range,
                        sel
                    if (document.createRange && window.getSelection) {
                        range = document.createRange()
                        sel = window.getSelection()
                        sel.removeAllRanges()
                        range.selectNode(el)
                        sel.addRange(range)
                    } else if (body.createTextRange) {
                        range = body.createTextRange()
                        range.moveToElementText(el)
                        range.select()
                    }
                }
            } else if (this.text == "Loading...") {
            } else {
                let $tableHeader = $(".dataTable").find("thead")
                if ($tableHeader.find("th:contains(Email)").length == 0) {
                    $($tableHeader.find("th")[0]).after("<th>Email</th>")
                    $($tableHeader.find("th")[1]).after("<th>Tags</th>")
                    $($tableHeader.find("th")[2]).after("<th>Domain</th>")
                    $($tableHeader.find("th")[4]).after('<th style="min-width:250px">Page Title</th>')
                    $($tableHeader.find("th")[5]).after('<th style="min-width:500px">Note</th>')
                    $($tableHeader.find("th")[6]).after('<th style="min-width:500px">Rejections</th>')
                    $($tableHeader.find("th")[11]).remove()
                }

                $(".dataTable")
                    .find("tbody")
                    .find("tr")
                    .each(function (i) {
                        let $row = $(this)
                        let $columns = $row.find("td")
                        let data = $(".dataTable").DataTable().row(i).data()

                        let advisorId = data.advisor._id,
                            reviewId = data._id,
                            email = data.advisor.email,
                            domain = data.site.settings.domains[0],
                            pageTitle =
                                data.meta && data.meta.name
                                    ? data.meta.name +
                                      (data.title
                                          ? '<span class="revisions-page-title"> (' + data.title + ")</span>"
                                          : "")
                                    : data.title
                                    ? data.title
                                    : "",
                            notes = data.internal_notes
                                ? data.internal_notes
                                      .replace(/<\/[^>]*>?/gm, "</span>")
                                      .replace(/<[^>]*>?/gm, '<span class="revisions-notes-note">')
                                : "",
                            rejections = data.notes
                                ? data.notes
                                      .replace(/<\/[^>]*>?/gm, "</span>")
                                      .replace(/<[^>]*>?/gm, '<span class="revisions-notes-note">')
                                : ""

                        let allTags = ""
                        data.advisor.settings.broker_tags.forEach(
                            (i) => (allTags += "<span class='revisions-tags-tag'>" + i.name + ", </span>")
                        )
                        allTags = allTags.substr(0, allTags.length - 2)

                        $($row.find("td")[0]).after('<td class="revisions-email">' + email + "</td>")
                        $($row.find("td")[1]).after('<td class="revisions-tags">' + allTags + "</td>")
                        $($row.find("td")[2]).after('<td class="revisions-domains">' + domain + "</td>")
                        $($row.find("td")[4]).after('<td class="revisions-page">' + pageTitle + "</td>")
                        $($row.find("td")[5]).after('<td class="revisions-notes">' + notes + "</td>")
                        $($row.find("td")[6]).after('<td class="revisions-notes">' + rejections + "</td>")
                        $row.find(".advisor-tags").remove()
                        $row.find("td")[11].remove()
                    })

                $(".wrapper").css("width", "100%").css("max-width", "unset").css("margin", "5px")

                $(".dataTable").addClass("reportorized")
                $(".dataTable").css("font-size", ".75em")
                $($(".dataTable").find("thead").find("th")[3]).css("min-width", "150px")

                var btn = this
                btn.text = "Loading..."
                setTimeout(function () {
                    btn.text = "Copy Table"
                }, 1000)
            }
        })
        $("#revisions-list_length")
            .find("option")
            .last()
            .after(
                '<option value="500">500</option><option value="1000">1000</option><option value="2000">2000</option><option value="999999">All</option>'
            )
    }

    // Reviewing a review item page
    else if (urlParts.length > 4 && urlParts[4].indexOf("review") == 0) {
        let advisorId = urlParts[urlParts.length - 2]
        let reviewId = urlParts[urlParts.length - 1]
        let revisionId = document.querySelector(".btn--action-reject.reject-item").getAttribute("data-id")

        //Remove any trailing parts of the URL
        if (reviewId[reviewId.length - 1] == "#") reviewId = reviewId.substr(0, reviewId.length - 1)

        //Add a simple add notes option
        $(".review-tools").append(
            '<button class="btn btn--action-default revision-note" data-id="' + revisionId + '">Add Notes</button>'
        )
        $(".revision-note").on("click", () => {
            var note = prompt("Add your note")
            if (note != null)
                $.ajax({
                    method: "PUT",
                    dataType: "json",
                    cache: false,
                    data: { internal_notes: note },
                    url: "https://app.twentyoverten.com/api/revisions/" + revisionId,
                    success: function () {
                        console.log("success")
                    },
                    error: function () {
                        console.log("fail")
                    },
                })
        })

        //Add "View Revision" button and revision notes to the review tools navigation
        if (
            $(".review-tools").find('a[href="#approve"].active').length > 0 ||
            $(".review-tools").find('a[href="#reject"].active').length > 0
        ) {
            $(".review-tools").append(
                '<a href="' +
                    window.location.href.replace("review", "revisions") +
                    '" class="btn pill secondary btn-sm primary btn--action-review" target="_blank">View Revision</a>'
            )

            // Doesn't fit nicely
            // displayReviewer(baseUrl+'manage/revisions/' + advisorId + '/' + reviewId, $(".review-title"));
        }
        localStorage.setItem(
            "lastReviewed",
            JSON.stringify({
                id: advisorId,
                title: $(".title")[0].childNodes[1].nodeValue.trim(),
            })
        )

        //Check if item in review is content
        checkIfContent(revisionId).then((result) => {
            const OUTPUT_DIFFERENCES = true
            if (!result.is_post) return // If it's not a post do nothing

            console.log(result)
            const from_siteforward = Object.keys(result.from_siteforward).length != 0
            const from_vendor = Object.keys(result.from_vendor).length != 0
            const was_edited = result.edits && (result.edits.title.length > 0 || result.edits.content.length > 0)

            //Check where the content is from
            let who = ""
            if (result.is_custom) who = "Custom"
            else if (from_vendor) who = "Vendor Provided"
            else if (from_siteforward) who = "SiteForward Provided"

            if (was_edited) {
                who = "Edited " + who
                let differences = ""

                if (OUTPUT_DIFFERENCES && result.edits.title.length > 0) {
                    differences += '<h2 style="font-size: 1.25em;border-bottom: 1px solid #ccc;">Title Differences</h2>'
                    result.edits.title.forEach((e) => {
                        differences += `
               <div style="display: flex; justify-content: space-between; gap: 2rem; border-bottom: 1px dashed #ccc;">
               <div style="flex: 1;">
                  <p><span style="font-style: italic">Vendor:</span><br>${escapeHTML(e.vendor)
                      .replace(/\[\[/g, "<strong>[")
                      .replace(/\]\]/g, "]</strong>")}</p>
               </div>
               <div style="flex: 1;">
                  <p><span style="font-style: italic">Advisor:</span><br>${escapeHTML(e.advisor)
                      .replace(/\[\[/g, "<strong>[")
                      .replace(/\]\]/g, "]</strong>")}</p>
               </div>
               </div>`
                    })
                }
                if (OUTPUT_DIFFERENCES && result.edits.content.length > 0) {
                    if (differences != "") differences += "<br><br>"
                    differences +=
                        '<h2 style="font-size: 1.25em;border-bottom: 1px solid #ccc;">Content Differences</h2>'
                    result.edits.content.forEach((e) => {
                        differences += `
               <div style="display: flex; justify-content: space-between; gap: 2rem; border-bottom: 1px dashed #ccc;">
               <div style="flex: 1;">
                  <p><span style="font-style: italic">Vendor:</span><br>${escapeHTML(e.vendor)
                      .replace(/\[\[/g, "<strong>[")
                      .replace(/\]\]/g, "]</strong>")}</p>
               </div>
               <div style="flex: 1;">
                  <p><span style="font-style: italic">Advisor:</span><br>${escapeHTML(e.advisor)
                      .replace(/\[\[/g, "<strong>[")
                      .replace(/\]\]/g, "]</strong>")}</p>
               </div>
               </div>`
                    })
                }

                function escapeHTML(str) {
                    return (str || "")
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/"/g, "&quot;")
                        .replace(/'/g, "&#039;")
                }

                const trigger = document.querySelector(".open-differences")

                trigger.addEventListener("click", function (event) {
                    // Create dialog
                    const dialog = document.createElement("dialog")
                    dialog.setAttribute("id", "differences-dialog")

                    // Add content
                    const text = document.createElement("div")
                    text.innerHTML = differences
                    dialog.appendChild(text)

                    // Append to body
                    document.body.appendChild(dialog)

                    // Position near the button
                    const rect = trigger.getBoundingClientRect()
                    dialog.style.cssText = `top: ${rect.bottom + 5}px;`

                    // Show the dialog (non-modal)
                    dialog.show()

                    // Close when clicking outside
                    const handleClickOutside = (e) => {
                        if (!dialog.contains(e.target)) {
                            dialog.close()
                            dialog.remove()
                            document.removeEventListener("click", handleClickOutside)
                        }
                    }

                    // Delay to avoid immediate close from the same click
                    setTimeout(() => {
                        document.addEventListener("click", handleClickOutside)
                    }, 0)
                })
            }

            let difference_compare = document.querySelector(".open-differences")
            difference_compare.setAttribute("title", `${who} Content${was_edited ? " (Click to see differences)" : ""}`)
            let icon_classes = difference_compare.querySelector("i").classList
            icon_classes.remove("fa-spinner")
            if (result.is_custom) icon_classes.add("fa-edit")
            else if (was_edited) icon_classes.add("fa-user-edit")
            else if (from_siteforward || from_vendor) icon_classes.add("fa-copy")
        })

        async function checkIfContent(revisionId) {
            //Get the current review item
            let current_item = await fetch("https://app.twentyoverten.com/api/revisions/" + revisionId)
            current_item = await current_item.json()

            return new Promise((resolve) => {
                if (current_item.location != "post") resolve({ is_post: false })
                else {
                    $(".floating-review-item-wrapper").append(
                        `<div class="floating-review-item open-differences" title="Checking the file source"><i class="fas fa-spinner"></i></div>`
                    )

                    //Check both bukets
                    let is_custom = current_item.content_id == null
                    let from_siteforward = getContent(current_item, "https://app.twentyoverten.com/api/content/broker")
                    let from_vendor = getContent(current_item, "https://app.twentyoverten.com/api/content")

                    // When both promises are done check for edits, and then resolve the parent promise
                    Promise.all([from_siteforward, from_vendor]).then((values) => {
                        let edits = null

                        // If article isn't custom get the differences
                        let found_article = values[0]
                        if (Object.keys(found_article).length === 0)
                            // If current found article doesn't exist, assign the next
                            found_article = values[1]
                        if (Object.keys(found_article).length === 0)
                            // If it still doesn't exist, make it null
                            found_article = null

                        if (found_article) {
                            is_custom = false // Sometimes articles won't have a content_id, but will still be from content assist - this is confirmed by checking title and html
                            current_item = { title: current_item.title, html: current_item.content }
                            const title = getArrayDifferences(
                                parseHTML(found_article.title),
                                parseHTML(current_item.title)
                            )
                            const content = getArrayDifferences(
                                parseHTML(found_article.html),
                                parseHTML(current_item.html)
                            )
                            edits = { title, content }
                        }

                        resolve({
                            is_post: true,
                            is_custom,
                            from_siteforward: values[0],
                            from_vendor: values[1],
                            current_item,
                            edits,
                        })
                    })

                    // Function to parse HTML into an array of tags and content
                    function parseHTML(html) {
                        // Update the regex to also capture content outside of HTML tags
                        const regex =
                            /(<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>)|(<p[^>]*>[\s\S]*?<\/p>)|(<li[^>]*>[\s\S]*?<\/li>)|(<img[^>]*>)|(<a[^>]*>[\s\S]*?<\/a>)|([^<>]+)/gi
                        let match
                        const result = []
                        while ((match = regex.exec(html)) !== null) {
                            if (match[0].trim()) {
                                // Ensure we don't push empty strings
                                result.push(match[0].trim())
                            }
                        }
                        return result
                    }

                    // Function to find the first index at which two strings differ
                    function findDifferenceIndex(str1, str2) {
                        let index = 0
                        while (index < str1.length && index < str2.length) {
                            if (str1[index] !== str2[index]) {
                                return index
                            }
                            index++
                        }
                        return index
                    }

                    // Function to compare two arrays and return differences with brackets
                    function getArrayDifferences(arr1, arr2) {
                        const differences = []
                        const maxLength = Math.max(arr1.length, arr2.length)
                        let inDifference = false // Flag to track if we're in the middle of a difference

                        for (let i = 0; i < maxLength; i++) {
                            if (arr1[i] !== arr2[i]) {
                                if (!inDifference) {
                                    const vendorText = arr1[i] || ""
                                    const advisorText = arr2[i] || ""

                                    const diffIndex = findDifferenceIndex(vendorText, advisorText)

                                    const vendorDiff =
                                        vendorText.slice(0, diffIndex) + "[[" + vendorText.slice(diffIndex) + "]]"
                                    const advisorDiff =
                                        advisorText.slice(0, diffIndex) + "[[" + advisorText.slice(diffIndex) + "]]"

                                    differences.push({
                                        vendor: vendorDiff,
                                        advisor: advisorDiff,
                                    })

                                    inDifference = true // Start tracking the difference
                                }
                            } else {
                                inDifference = false // Reset the difference flag when texts align again
                            }
                        }
                        return differences
                    }
                }
            })
        }

        async function getContent(current_item, url) {
            let custom_content_list = await fetch(url)
            custom_content_list = await custom_content_list.json()

            // Check if content API loaded
            if (!custom_content_list.content) {
                let difference_compare = document.querySelector(".open-differences")
                difference_compare.setAttribute(
                    "title",
                    `Error: Unable to load content API.\nPlease login as advisor to load the content API.`
                )
                let icon_classes = difference_compare.querySelector("i").classList
                icon_classes.remove("fa-spinner")
                icon_classes.add("fa-exclamation-circle")
            }

            //Check list of all content in bucket to see if title and content match
            return new Promise(function (resolve) {
                custom_content_list.content.forEach((blog) => {
                    if (blog._id == current_item.content_id) resolve({ title: blog.title, html: blog.html })
                    else if (blog.title == current_item.title && blog.html == current_item.content)
                        resolve({ title: blog.title, html: blog.html })
                })
                resolve({})
            })
        }

        // Add Dark toggle button
        $(".review-header").append(
            '<div class="floating-review-item-wrapper"> <div class="floating-review-item dark-toggle" title="Toggle page preview darkness"><i class="fas fa-moon"></i></div></div>'
        )
        $(".dark-toggle").on("click", function () {
            let i = $(this).find("i")
            i.toggleClass("fa-moon")
            i.toggleClass("fa-sun")
            $(".change-item").toggleClass("darken")
        })

        // Add the tags on the left
        $($(".details-wrapper").find("header")).append('<p class="secondary center advisor-tags"></p>')

        //Get advisor
        let advisor = getAdvisorInfoByID(advisorId)

        //Create string with tags
        let tags = ""
        if (advisor && advisor.settings && advisor.settings.broker_tags)
            advisor.settings.broker_tags.forEach(function (e) {
                tags += "<br>" + e.name
            })

        //Add tags
        $(".advisor-tags").html(tags.substr(4, tags.length))
        if (advisor && advisor.email)
            $(".advisor-quick-links").append(
                '<a href="/manage/revisions?email=' +
                    encodeURIComponent(advisor.email) +
                    '" class="btn pill secondary btn--action-default" style="max-width: unset">View Revisions</a>'
            )
    }

    //Content Assist page
    else if (urlParts.length > 4 && urlParts[4].indexOf("content") == 0) {
        let is_SiteForward_Bucket = urlParts[5]?.indexOf("custom") == 0 || false
        document
            .querySelector(is_SiteForward_Bucket ? ".siteforward_content_assist" : ".vendor_content_assist")
            .parentNode.classList.add("active")

        $("#content-list_wrapper, #custom-content-list_wrapper").prepend(
            '<div class="search-bar">' +
                '<div class="text-control" aria-required="true" style=" margin: 10px 0 0 0; flex-basis: 80%; padding-right: 15px"> ' +
                '<input required type="text" id="search-content" name="search-content" class="form-control" title="Search"> <label for="search-content">Search ( Make sure to set entries to all )</label> ' +
                '<div data-content="Search by Name or Categories &nbsp; &nbsp; - &nbsp; &nbsp; [! = Not] &nbsp; &nbsp; [, = And] &nbsp; &nbsp; [| = Or]" class="tot_tip top  search-help">?</div>' +
                "</div>" +
                '<div class="btn-control" aria-required="true" style=" margin: 0;flex-basis:20%"> ' +
                '<input type="button" style="height:100%;width:100%" class="btn primary btn--action-review" value="Search" id="search-content-btn" data-cover="Search for Content">' +
                "</div>" +
                '<table class="table" style="margin: .5rem 0;  width: 100%"></table>' +
                "</div>"
        )
        $(".add-custom-content")
            .wrap('<div style="display: flex; flex-flow: column">')
            .parent()
            .prepend(
                '<a href="../content" class="btn btn--action-default-outlined add-custom-content" style="margin-bottom: 10px;">Back to Content Assist</a>'
            )
        $("#custom-content-list_length, #content-list_length")
            .find("option")
            .last()
            .after(
                '<option value="200">200</option><option value="500">500</option><option value="999999">All</option>'
            )

        //Remove Lead Pilot content
        $("#content-list").on(
            "init.dt",
            delay((e) => {
                console.log(ready)
                $("#content-list tr").each(function (i, e) {
                    console.log(i)
                    if ($(e).find(".content-cat")[0].textContent == "Lead Pilot") $(e).hide()
                })
            }, 750)
        )

        //When enter is pressed when typing in search
        $("#search-content").on(
            "keyup",
            delay((e) => {
                let searchTerm = $("#search-content").val()
                if (
                    (searchTerm.length > 2 &&
                        (searchTerm.indexOf("*") != 0 || searchTerm.indexOf("#") != 0) &&
                        getNodes(searchTerm).length < 50) ||
                    e.which === 13
                )
                    $("#search-content-btn")[0].click()
                if (searchTerm.length <= 2 && e.which == 8) {
                    let table = $(".search-bar table")
                    table.empty()

                    $("#content-list, #custom-content-list").show()
                }
            }, 500)
        )

        //When search button is clicked
        $("#search-content-btn").on("click", () => {
            let searchTerm = $("#search-content").val()

            let showAll = searchTerm.indexOf("*") === 0
            let onlyNumber = searchTerm.indexOf("#") === 0
            if (showAll || onlyNumber) searchTerm = searchTerm.substr(1, searchTerm.length)

            //Empty current search results
            let table = $(".search-bar table")
            table.empty()
            table.append(
                '<thead> <tr role="row"><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1">#</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Thumbnail</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Title</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Date Added</th><th class="has-state sorting" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Availability</th><th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="" aria-sort="descending">Status</th><th class="" rowspan="1" colspan="1" aria-label="Actions">Actions</th></tr> </thead>'
            )

            $("#content-list, #custom-content-list").hide()

            //Get all nodes that match the search
            let nodes = getNodes(searchTerm)

            //Inform if no nodes are found
            if (nodes.length === 0) {
                table.append('<tr><td colspan="7">No results found</td></tr>')
            }
            //Display only the number of results
            else if (onlyNumber) {
                table.append('<tr><td colspan="7">Results: (' + nodes.length + ")</td></tr>")
            }
            //Display nodes if under 100 results
            else if (showAll || nodes.length <= 100) {
                //Add nodes to table
                table.append(nodes)
                nodes.forEach(function (e, i) {
                    let row = $(table.find("tr")[i + 1])
                    row.prepend("<td>" + (i + 1) + ".</td>")
                })
                table.find("td").css("border", "none")
            }

            //If more than 100 results are found
            else {
                table.append("<tr><td>To many results (" + nodes.length + ")</td></tr>")
            }
        })

        //Get the node results
        function getNodes(searchString) {
            //Apply filter to rows and return new array of rows
            function filter(rows, search) {
                let newRows = []

                //Perform filter
                rows.forEach(function (rowItem) {
                    function matches(item, search, invert) {
                        let match =
                            item.data().title.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
                            item.data()._id.toLowerCase().indexOf(search.toLowerCase()) >= 0 ||
                            (item.data().categories && hasCategory(search.toLowerCase(), item.data())) ||
                            (item.data().availability &&
                                item.data().availability.toLowerCase().indexOf(search.toLowerCase()) >= 0)
                        function hasCategory(tag, item) {
                            if (item && item.categories)
                                return item
                                    ? item.categories.some((e) => {
                                          return e.name && e.name.toLowerCase().indexOf(tag.toLowerCase()) >= 0
                                      })
                                    : false
                            return false
                        }

                        if (invert && !match) return true
                        else if (!invert && match) return true
                        else return false
                    }

                    let searchTerms = search.split("|")
                    let match = false

                    searchTerms.forEach(function (term) {
                        term = term.trim()
                        let invert = term.indexOf("!") === 0
                        if (invert) term = term.substr(1, search.length)
                        if (matches(rowItem, term, invert)) match = true
                    })

                    if (match) newRows.push(rowItem)
                })
                return newRows
            }

            //Split search at every ,
            let searchList = searchString.split(",")

            //Gather rows
            let rows = []
            $(".dataTable")
                .DataTable()
                .rows()
                .every(function () {
                    rows.push(this)
                })
            //Apply filter to current rows(recursion.... sort of...)
            searchList.forEach(function (e) {
                let search = e.trim()

                //Apply filter/search
                rows = filter(rows, search)
            })

            //Turn filtered rows into nodes, clone, and remove useless column
            let nodes = []
            rows.forEach((e) => {
                let node = e.node().cloneNode(true)
                // let select = $(node).find("select");
                // let status = $(node).find("option:selected").text();
                // select.parent().removeClass("is-select");
                // select.parent().css("text-align", "center");
                // select.after(status == "Default" ? "---" : status);
                // select.remove();

                //node.deleteCell(4);
                nodes.push(node)
            })
            return nodes
        }
    }

    //Home Page
    else {
    }
}

//Check if the tag exists in the advisor's tags(NOT Exact match)
function hasTag(tag, advisor) {
    if (advisor && advisor.settings && advisor.settings.broker_tags)
        return advisor
            ? advisor.settings.broker_tags.some((e) => {
                  return e.name.toLowerCase().indexOf(tag.toLowerCase()) >= 0
              })
            : false
    return false
}

// check if status matches the advisor's current status
function hasStatus(status, advisor) {
    status = status.toLowerCase()
    if (advisor && advisor.display_state) {
        let advisorStatus = advisor.display_state.toLowerCase()
        if (advisor.site.status === "taken_down") {
            advisorStatus = "taken down"
        } else if (advisor.site.broker_reviewed && advisor.display_state === "pending_review") {
            advisorStatus = "review completed"
        } else if (advisor.display_state === "pending_review") {
            advisorStatus = "pending review"
        } else if (advisor.display_state === "approved") {
            advisorStatus = "approved"
        } else if (advisor.display_state === "editing") {
            advisorStatus = "editing"
        }
        return advisorStatus.indexOf(status) >= 0
    } else return false
}

//Get the officer name from their ID
function getOfficerName(id) {
    //If ID is null, it means it's assigned to "All Officers"
    if (!id) id = "all"

    //Get the officer
    let officer = $(".assigned_officer")
        .first()
        .find('option[value*="' + id + '"]')
    return $(officer).text()
}