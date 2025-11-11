let baseUrl = "https://app.twentyoverten.com"
//"https://staging-app.twentyoverten.com"

// Global Info
let advisor_list = []
let url_parts = ""
let database = null
let officer_list = []

/**
 * Advisor lookup maps for O(1) data access
 */
const advisorLookups = {
    byId: new Map(),
    byName: new Map(),
    
    buildIndexes() {
        this.byId.clear()
        this.byName.clear()
        
        advisor_list.forEach(advisor => {
            this.byId.set(advisor._id, advisor)
            this.byName.set(advisor.display_name, advisor)
        })
        
        console.log(`Providence: Built advisor indexes - ${this.byId.size} advisors indexed`)
    },
    
    getById(id) {
        return this.byId.get(id)
    },
    
    getByName(name) {
        return this.byName.get(name)
    }
}

$(async function () {
    try {
        await waitForCondition(() => typeof isSiteForward === "function" && typeof DatabaseClient != "undefined", 5000)
        database = new DatabaseClient()
        ready()
    } catch (error) {
        console.error(error)
        alert("Unable to load Extension, please reload the page to try enabling the extension again.")
    }
})

/**
 * Wait for a specific condition to be met.
 * @param {Function} condition_fn - The condition function to evaluate.
 * @param {number} timeout - The maximum time to wait (in milliseconds).
 * @param {number} interval - The interval between checks (in milliseconds).
 * @returns {Promise} - A promise that resolves when the condition is met.
 */
function waitForCondition(condition_fn, timeout = 2000, interval = 50) {
    return new Promise((resolve, reject) => {
        const start = Date.now()
        function check() {
            if (condition_fn()) {
                resolve()
            } else if (Date.now() - start >= timeout) {
                reject(new Error("Condition timeout"))
            } else {
                setTimeout(check, interval)
            }
        }
        check()
    })
}

// Check if the user is a SiteForward user
function isSiteForwardUser(){
    return isSiteForward(window.loggedInUser)
}

// Get the current officer info through the loggedInUser
function getCurrentOfficerInfo(){
    let current_officer = officer_list.find(officer => officer._id === window.loggedInUser)
    if (!current_officer)
        current_officer = { name: "Unknown Officer", _id: window.loggedInUser }
    return current_officer
}

// Function to initialize the page
async function ready() {

    // Load advisor list
    let advisor_list_req = await fetch(`${baseUrl}/manage/advisor/list?tags=`)
    advisor_list_req = await advisor_list_req.json()
    advisor_list = advisor_list_req.data

    // Load officer list
    let officer_list_req = await fetch(`${baseUrl}/api/officers`)
    officer_list_req = await officer_list_req.json()
    officer_list = officer_list_req

    // Initialize optimizations
    advisorLookups.buildIndexes()

    // Add content sub-menu items to content nav menu item
    const content_sub_nav = createElement("ul", {
        class: "providence--section-nav-sub",
        html: `
            <li><a href="/manage/content" class="vendor_content_assist">Vendor Provided</a></li>
            <li><a href="/manage/content/custom" class="siteforward_content_assist">SiteForward Provided</a></li>
         `,
    })
    document.querySelector(".providence--section-nav a[href='/manage/content']").parentNode.append(content_sub_nav)

    // Init general modules
    NightMode.init()
    Chat.init()

    // Get the URL Parts
    url_parts = window.location.href.split("/")

    // Load the page modules

    // [https:]//[][app.twentyoverten.com]/[manage] -> Dashboard Home
    if (url_parts.length == 4 && url_parts[3].includes("manage")) Manage.init()

    // [https:]//[][app.twentyoverten.com]/[manage]/[revisions] -> Revisions
    else if (url_parts.length == 5 && url_parts[4].includes("revisions"))  Revisions.init()

    // [https:]//[][app.twentyoverten.com]/[manage]/[content] -> Content
    else if (url_parts.length == 5 && url_parts[4].includes("content"))  Content.init()

    // [https:]//[][app.twentyoverten.com]/[manage]/[content]/[custom] -> Content
    else if (url_parts.length == 6 && url_parts[4].includes("content") && url_parts[5].includes("custom"))  Content.init()

    // [https:]//[][app.twentyoverten.com]/[manage]/[advisor]/[###advisor_id###] -> Advisor Profile
    else if (url_parts.length == 6 && url_parts[4].includes("advisor"))  Advisor.init()

    // [https:]//[][app.twentyoverten.com]/[manage]/[review]/[###advisor_id###]/[###item_id###] -> Item Review
    else if (url_parts.length == 7 && url_parts[4].includes("review"))  Review.init()
}

// ============================================================================
// Util functions
// ============================================================================

/**
 * Fetch the advisor info from the advisor's id
 * @param {string} advisor_id - The advisor's ID
 * @returns {Promise<Object>} - The advisor info object
 */
async function getAdvisorInfo(advisor_id) {
    const response = await fetch(`${baseUrl}/manage/advisor/one/${advisor_id}`)
    return response.json()
}

/**
 * Fetch the site info from the site's id
 * Site id can be gotten from the advisor info
 * @param {string} site_id - The site's ID
 * @returns {Promise<Object>} - The site info object
 */
async function getSiteInfo(site_id) {
    const response = await fetch(`${baseUrl}/manage/advisor/notes/${site_id}`)
    return response.json()
}

/**
 * Get the advisor info from the cached advisor list
 * @param {string} id - The advisor's ID
 * @returns {Object|undefined} - Advisor info object or undefined if not found
 */
function getAdvisorInfo(id) {
    return advisorLookups.getById(id)
}

/**
 * Get advisor info by display name from the cached advisor list
 * @param {string} display_name - The advisor's display name
 * @returns {Object|null} - Advisor info object or null if not found
 */
function getAdvisorInfoByName(display_name) {
    if (!display_name) return null
    return advisorLookups.getByName(display_name) || null
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
        const dropdown_list = document.querySelector("#header .tot_dropdown .tot_droplist ul")
        const night_mode_toggle = createElement("li", {
            class: "nightModeToggle",
            html: '<a href="#">Toggle Night Mode</a>',
            onclick: () => {
                document.body.classList.toggle("nightMode")
                localStorage.setItem("nightMode-p", document.body.classList.contains("nightMode"))
            },
        })
        dropdown_list.insertBefore(night_mode_toggle, dropdown_list.firstChild)
    },
}
// =============================================================================
// AdvisorDetails Module
// =============================================================================
const AdvisorDetails = {
    advisorInfo: null,
    /**
     * Initialize the advisor details module
     * @param {Object} advisorInfo - The advisor information object
     */
    init(advisorInfo){
        this.advisorInfo = advisorInfo
        this.addTags()
        this.addPreviewLinkIcon()
        this.addViewRevisionsButton()
        this.Archives.init()
    },
    addTags(){
        const tags = this.advisorInfo.settings.broker_tags || []
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
            html: `<a href="https://${this.advisorInfo.site.settings.subdomain}.app.twentyoverten.com" class="tot_tip top center" data-content="View Preview Website" target="_blank">
                <svg class="action-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" style="display:inline-block; vertical-align:middle; fill:currentColor;">
                    <mask id="browser-mask" x="0" y="0" width="24" height="24">
                        <circle cx="12" cy="12" r="12" fill="white"/>
                        <rect x="6" y="7" width="12" height="10" rx="1.5" ry="1.5" fill="none" stroke="black" stroke-width="1.2"/>
                        <line x1="6" y1="10" x2="18" y2="10" stroke="black" stroke-width="1.2"/>
                        <circle cx="8" cy="8.5" r="0.7" fill="black"/>
                        <circle cx="10" cy="8.5" r="0.7" fill="black"/>
                        <circle cx="12" cy="8.5" r="0.7" fill="black"/>
                    </mask>
                    <circle cx="12" cy="12" r="12" fill="currentColor" mask="url(#browser-mask)"/>
                </svg>
            </a>`
        })
        document.querySelector(".advisor-actions").appendChild(preview_link_icon)
    },
    addViewRevisionsButton(){
        const open_revisions = createElement("a", {
            href: `/manage/revisions?email=${encodeURIComponent(
                this.advisorInfo.email)}`,
            target: "_blank",
            html: `View Revisions`,
            class: "btn btn--action-default"
        })
        document.querySelector(".details-wrapper .btn-container").appendChild(open_revisions)
    },
    
// ========================== Archives Sub-Module =============================
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
            const compliance_note = createElement("div", {
                class: "compliance-notes",
                style: "font-size: 14px; width: 100%;",
                html: note,
            })
            item.appendChild(compliance_note)
            item.querySelectorAll("span.small").forEach((span) => {
                span.style.fontSize = "12px"
            })
        },
    }

}

// =============================================================================
// SearchBar Module
// =============================================================================
const SearchBar = {
    config: null,
    isInitialized: false,

    /**
     * Initialize SearchBar with the given configuration
     * Since only one SearchBar is active per page, uses singleton pattern
     * @param {Object} config - Configuration object
     * @param {Element} config.container - Container element for the search bar
     * @param {string} config.inputId - ID for the search input element
     * @param {string} config.buttonId - ID for the search button element
     * @param {string} config.tableSelector - CSS selector for the table element
     * @param {string} config.label - Label text for the search input
     * @param {string} config.buttonText - Text for the search button
     * @param {string} config.buttonDataCover - Data-cover attribute for the button
     * @param {string} config.helpContent - Help content for the search functionality
     * @param {number} config.debounceDelay - Delay in milliseconds for debounced search
     * @param {boolean} config.enableHelpDialog - Whether to enable help dialog
     * @param {Function} config.searchFunction - Function to handle search operations
     * @param {Function} config.hideTableFunction - Function to hide the table
     * @param {Function} config.showTableFunction - Function to show the table
     * @param {Function} config.clearTableFunction - Function to clear table content
     * @param {string} config.customClass - Custom CSS classes for styling
     * @param {Object} config.customStyles - Custom inline styles object
     */
    init(config = {}) {
        const defaultConfig = {
            // Container and IDs
            container: null,
            inputId: 'search-input',
            buttonId: 'search-button',
            tableSelector: '.search-bar table',
            
            // Labels and placeholders
            label: 'Search',
            buttonText: 'Search',
            buttonDataCover: 'Search',
            
            // Help content
            helpContent: 'Basic search functionality',
            
            // Search behavior
            debounceDelay: 400,
            enableHelpDialog: true,
            searchFunction: null,
            
            // Table management
            hideTableFunction: null,
            showTableFunction: null,
            clearTableFunction: null,
            
            // Styling
            customClass: '',
            customStyles: {}
        }

        this.config = { ...defaultConfig, ...config }
        
        if (this.isInitialized) {
            this.destroy()
        }
        
        this.addSearchBar()
        this.setupEventListeners()
        this.isInitialized = true
    },

    /**
     * Add the search bar to the DOM
     */
    addSearchBar() {
        if (!this.config.container) {
            console.error('SearchBar: No container specified')
            return
        }

        const search_bar = createElement("div", {
            class: `search-bar ${this.config.customClass}`,
            style: Object.entries(this.config.customStyles).map(([k,v]) => `${k}: ${v}`).join('; '),
            html: `
                <div class="text-control" aria-required="true" style="margin: 10px 0 0 0; flex-basis: 80%; padding-right: 15px">
                    <input required type="search" 
                           id="${this.config.inputId}" 
                           name="${this.config.inputId}" 
                           class="form-control" 
                           title="${this.config.label}">
                    <label for="${this.config.inputId}">${this.config.label}</label>
                    ${this.config.enableHelpDialog ? 
                        `<div data-content="${this.config.helpContent.replace(/"/g, '&quot;')}" class="tot_tip top search-help">?</div>` : 
                        ''}
                </div>
                <div class="btn-control" aria-required="true" style="margin: 0; flex-basis:20%">
                    <input type="button" 
                           style="height:100%; width:100%" 
                           class="btn primary btn--action-review" 
                           value="${this.config.buttonText}" 
                           id="${this.config.buttonId}" 
                           data-cover="${this.config.buttonDataCover}">
                </div>
                <table class="table" style="margin: .5rem 0; width: 100%"></table>
            `,
        })

        this.config.container.prepend(search_bar)
    },

    /**
     * Setup event listeners for the search bar
     */
    setupEventListeners() {
        const input = document.querySelector(`#${this.config.inputId}`)
        const button = document.querySelector(`#${this.config.buttonId}`)

        if (!input || !button) {
            console.error('SearchBar: Could not find input or button elements')
            return
        }

        // Debounced search on keyup
        input.addEventListener(
            "keyup",
            debounce(() => {
                button.click()
            }, this.config.debounceDelay)
        )

        // Reset search table when search input is cleared (X button clicked)
        input.addEventListener("search", () => {
            if (input.value === "") {
                this.resetSearchTable()
            }
        })

        // Search on button click
        button.addEventListener("click", () => this.handleSearch())
        document.querySelector(".search-help").addEventListener("click", () =>{
            input.value = "?"
            button.click()
        })
    },

    /**
     * Handle search functionality
     */
    async handleSearch() {
        const input = document.querySelector(`#${this.config.inputId}`)
        const search_term = input?.value

        this.clearSearchTable()
        
        if (!search_term || search_term.length === 0) {
            this.showTable()
            return
        }

        if (this.config.searchFunction) {
            await this.config.searchFunction.call(this, search_term)
        } else {
            console.warn('SearchBar: No search function provided')
        }
    },

    resetSearchTable(){
        const input = document.querySelector(`#${this.config.inputId}`)
        if (input) input.value = ""

        this.clearSearchTable()
        this.showTable()
    },

    /**
     * Clear the search results table
     */
    clearSearchTable() {
        if (this.config.clearTableFunction) {
            this.config.clearTableFunction.call(this)
        } else {
            const table = document.querySelector(this.config.tableSelector)
            if (table) table.innerHTML = ""
        }
    },

    /**
     * Hide the main content table
     */
    hideTable() {
        if (this.config.hideTableFunction) {
            this.config.hideTableFunction.call(this)
        }
    },

    /**
     * Show the main content table
     */
    showTable() {
        if (this.config.showTableFunction) {
            this.config.showTableFunction.call(this)
        }
    },

    /**
     * Destroy the current search bar instance
     */
    destroy() {
        if (this.config?.container) {
            const search_bar = this.config.container.querySelector('.search-bar')
            if (search_bar) {
                search_bar.remove()
            }
        }
        this.config = null
        this.isInitialized = false
    }
}

// =============================================================================
// Chat Module
// =============================================================================
const Chat = {
    // DOM Cache for Chat module
    cache: {
        liveChat: null,
        
        init() {
            this.liveChat = document.querySelector("#live-chat")
        }
    },

    /**
     * Initialize the chat module.
     */
    init() {
        this.cache.init()
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
                this.cache.liveChat?.setAttribute("data-advisor_id", advisor_id)
                this.handleChatOpen()
            } else if (e.target.matches(".chat-users-list-wrapper ul .user img")) {
                let advisor_id = e.target.parentNode.parentNode.getAttribute("data-advisor_id")
                this.cache.liveChat?.setAttribute("data-advisor_id", advisor_id)
                this.handleChatOpen()
            }
        })

        // Rejection change listener
        document.addEventListener(
            "change",
            (e) => {
                if (!e.target.matches(".rejection-completed")) return

                const checkbox = e.target
                const rejection_wrapper = checkbox.closest(".rejection-notice")
                if (!rejection_wrapper) return

                const rejection_id = rejection_wrapper.dataset.id
                const advisor_id = this.cache.liveChat?.getAttribute("data-advisor_id")

                if (!rejection_id || !advisor_id) {
                    console.warn("Missing rejection or advisor ID for rejection change")
                    return
                }

                const rejection_array = Array.from(rejection_wrapper.querySelectorAll(".rejected-item")).map(
                    (item) => item.querySelector(".rejection-completed").checked
                )

                database.updateRejection(advisor_id, rejection_id, rejection_array)
            }
        )
    },
    setupChatWindow() {

        const advisor_id = document.querySelector("#live-chat").getAttribute("data-advisor_id")
        if (!document.querySelector(".chat-wrapper .view-profile-chat")) {
            const chat_wrapper = document.querySelector(".chat-wrapper")
            if (chat_wrapper) {
                const profile_link = createElement("a", {
                    target: "_blank",
                    href: `/manage/advisor/${advisor_id}`,
                    class: "tot_tip bottom view-profile-chat",
                    "data-content": "View Profile",
                    style: "position: absolute;top: 0;right: 60px;height: 20px;width: 20px;margin: 25px 20px;z-index: 1;color: #909090;font-size: 1.1em;",
                    html: '<i class="fas fa-user"></i>',
                })

                chat_wrapper.append(profile_link)
            }
        } else document.querySelector(".chat-wrapper .view-profile-chat").href = `/manage/advisor/${advisor_id}`
    },

    /**
     * Handle chat open interactions.
     */
    async handleChatOpen() {
        await this.waitForChatLoad()
        let target_chat_id = this.cache.liveChat?.getAttribute("data-advisor_id")

        if(target_chat_id == null){
            target_chat_id = document.querySelector(".recent-chats li.active a")?.getAttribute("data-advisor_id")
            this.cache.liveChat?.setAttribute("data-advisor_id", target_chat_id)
        }
        else
            document.querySelector('.chat-users-list-wrapper ul [data-advisor_id="' + target_chat_id + '"]').click()

        this.setupChatWindow(target_chat_id)

        try {
            await this.waitForChatLoad()
            this.setupSavedMessageHandling()
            this.setupChatEventListeners()
            this.setupChatSearch()
            if (isSiteForwardUser())
                await this.setupRejectionHandling()
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
        const search_input = document.querySelector(".chat-search-input-wrapper input")
        const search_button = document.querySelector(".chat-search-input-search i")
        const search_results = document.querySelector(".chat-search-results")

        search_input.addEventListener(
            "keyup",
            debounce((e) => {
                const search_name = search_input.value
                if (search_name.length >= 3) {
                    this.performChatSearch()
                } else {
                    search_results.innerHTML = ""
                }
            }, 500)
        )

        // Setup search button listener
        search_button.addEventListener("click", () => this.performChatSearch())
    },

    /**
     * Perform chat user search
     */
    performChatSearch() {
        const search_input = document.querySelector(".chat-search-input-wrapper input")
        const search_results = document.querySelector(".chat-search-results")
        const search_name = search_input.value.toLowerCase()

        if (!search_name) {
            search_results.innerHTML = ""
            return
        }

        // Find matching users
        const users = document.querySelectorAll(".chat-users-list-wrapper .user")
        const results = Array.from(users).filter((user) => {
            const content = user.getAttribute("data-content")
            return content && content.toLowerCase().includes(search_name)
        })

        // If exactly one result, click it automatically
        if (results.length === 1) {
            const link = results[0].querySelector("a")
            if (link) link.click()
        }

        // Show result count
        search_results.innerHTML = results.length

        // Clear results if search is empty or only one result was found
        if (search_name.length === 0 || results.length === 1) {
            search_results.innerHTML = ""
        }
    },

    /**
     * Wait for the chat to load.
     */
    async waitForChatLoad() {
        await waitForCondition(() => {
            const chat_wrapper = document.querySelector(".chat-wrapper")
            return (
                chat_wrapper &&
                !chat_wrapper.classList.contains("loading") &&
                document.querySelector("body").classList.contains("chat-open")
            )
        })
    },

    /**
     * Setup rejection handling.
     * Waits 500ms total before adding the checkboxes (including time taken by getRejections)
     */
    async setupRejectionHandling() {
        const advisor_id = this.cache.liveChat?.getAttribute("data-advisor_id")
        const start_time = performance.now()
        const rejections = await database.getRejections(advisor_id)
        const elapsed_time = performance.now() - start_time

        // Calculate remaining wait time to reach 500ms total
        const WAIT_TIME = 500
        const remaining_wait_time = Math.max(0, WAIT_TIME - elapsed_time)

        setTimeout(() => {
            this.addRejectionCheckboxes(rejections, advisor_id)
        }, remaining_wait_time)
    },

    /**
     * Add rejection checkboxes to the rejection notices.
     * @param {Array} rejections - The list of rejections.
     */
    addRejectionCheckboxes(rejections) {
        document.querySelectorAll(".rejection-notice").forEach((notice) => {
            const rejection_id = notice.dataset.id
            const rejection_item = rejections.find((item) => item.rejectionId === rejection_id) || []

            notice.querySelectorAll(".rejected-item").forEach((item, i) => {
                const is_completed = rejection_item?.rejection?.[i] || false
                const checkbox = createElement("input", {
                    class: "rejection-completed",
                    type: "checkbox",
                    checked: is_completed,
                })
                item.insertBefore(checkbox, item.firstChild)
            })
        })
    },

    /**
     * Setup saved message handling.
     */
    setupSavedMessageHandling() {
        const saved_msg = localStorage.getItem("savedChatMsg")
        const chat_message = document.querySelector("#chatMessage")

        if (saved_msg && chat_message) {
            const fr_wrapper = chat_message.querySelector(".fr-wrapper")
            const fr_element = chat_message.querySelector(".fr-element")
            
            if (fr_wrapper && fr_element) {
                fr_wrapper.classList.remove("show-placeholder")
                fr_element.innerHTML = saved_msg
            }
        }
    },

    /**
     * Setup chat event listeners.
     */
    setupChatEventListeners() {
        const chat_message = document.querySelector("#chatMessage")
        const close_chat = document.querySelector(".close-chat")
        const send_message = document.querySelector(".chat-tools .send-message")

        if (close_chat && chat_message) {
            close_chat.addEventListener("click", () => {
                const fr_element = chat_message.querySelector(".fr-element")
                if (fr_element) {
                    const message_content = fr_element.innerHTML
                    // Don't save empty messages
                    if (message_content && message_content !== "<p><br></p>") {
                        localStorage.setItem("savedChatMsg", message_content)
                    } else {
                        localStorage.setItem("savedChatMsg", null)
                    }
                }
                document.querySelector("#live-chat")?.setAttribute("data-advisor_id", null)
            })
        }

        if (send_message) {
            send_message.addEventListener("click", () => {
                localStorage.setItem("savedChatMsg", null)
                const loadLastMessage = document.getElementById("loadLastMessage")
                if (loadLastMessage) {
                    loadLastMessage.style.display = "none"
                }
            })
        }
    },
}

// =============================================================================
// Manage Page Module
// =============================================================================
const Manage = {
    // DOM Cache for Manage module
    cache: {
        filterBtn: null,
        advisorsList: null,
        providenceOverviewList: null,
        
        init() {
            this.advisorsList = document.querySelector("#advisorsList")
            this.providenceOverviewList = document.querySelector(".providence-overview--list")
            this.refreshDynamicElements()
        },
        
        refreshDynamicElements() {
            this.filterBtn = document.querySelector("#filterAdvisors .btn")
        }
    },

    /**
     * Initialize the Manage module.
     */
    async init() {
        this.cache.init()
        this.changeToShowAll()
        this.setupEventListeners()
        this.adjustItemsPerPage()
        this.checkFilterWarning()
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

        // Filter button click listener
        waitForCondition(() => document.querySelector("#filterAdvisors .btn"))
            .then(() => {
                this.cache.refreshDynamicElements()
                this.cache.filterBtn?.addEventListener("click", () => this.checkFilterWarning())
            })

        // Custom chat opening buttons
        document.addEventListener("click", (e) => {
            if (e.target.matches(".open-chat-extension")) {
                const advisor_id = e.target.getAttribute("data-advisor_id")
                Chat.cache.liveChat?.setAttribute("data-advisor_id", advisor_id)
                document.querySelector("#open-chat").click()
            }
        })
    },

    /**
     * Function to change the view to show all advisors.
     */
    changeToShowAll() {
        const waitForShowAllBtn = setInterval(() => {
            const show_all_btn = document.getElementById("showAllAdvisors")
            if (show_all_btn) {
                if (!show_all_btn.classList.contains("active")) {
                    show_all_btn.click()
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
    // ======================= Advisor List ==========================
    AdvisorList: {
        init() {
            this.setupEventListeners()
            this.setupSearchBar()
        },

        setupEventListeners() {
            // When Table is redrawn and if the "Show All Advisors" button is active then update the advisor list in local storage
            // Update dropdowns when the table is redrawn
            $("#advisorsList").on(
                "draw.dt",
                debounce(() => {
                    if (document.getElementById("showAllAdvisors")?.classList.contains("active"))
                        Manage.cache.providenceOverviewList?.classList.add("loadedAll")

                    this.updateDropdowns()
                    this.updateOfficerList()
                    this.checkForUnPublished()
                }, 300)
            )
        },

        /**
         * Check for unpublished advisors, if any are found add a note under their state
         */
        checkForUnPublished() {
            let rows = document.querySelectorAll("#advisorsList tbody tr")
            rows.forEach((row) => {
                const advisor = getAdvisorInfo(row.getAttribute("data-advisor_id"))
                let is_unpublished = false
                if (hasStatus("approved", advisor)) {
                    let date_a = Date.parse(advisor.site.published_at),
                        date_b = Date.parse(advisor.site.submitted_at)
                    is_unpublished = date_a < date_b
                }
                if (is_unpublished) {
                    console.log("Unpublished advisor found:", row._id)
                    let state = row.querySelector(".has-state")
                    state.querySelector(".notPublished")?.remove()
                    let notPublished = createElement("p", {
                        class: "notPublished",
                        html: "⚠️ Not Published"
                    })
                    state.append(notPublished)
                }
            })
        },

        /**
         * Update the dropdowns for each row in the advisor list table
         */
        updateDropdowns() {
            // Check if we're updating the dropdowns for the regular list or the searchbar list
            let rows = document.querySelectorAll("#advisorsList tbody tr")
            if (document.querySelector(".search-bar tbody")) rows = document.querySelectorAll(".search-bar tbody tr")

            if(rows.length == 1 && rows[0].childElementCount == 1) return // Only result is saying no results found

            for (const row of rows) {
                // Get the advisor ID from the row
                const advisor_id = row.querySelector("a").href.split("/").pop()
                row.setAttribute("data-advisor_id", advisor_id)

                const dropdown = row.querySelector(".tot_droplist ul")
                if (dropdown.childElementCount > 3) continue // Skip if dropdown already has items

                // Make "View Profile" open in a new tab
                dropdown.children[0].children[0].target ="_blank"

                // Get advisor info from DataTable
                let advisor_info = getAdvisorInfo(advisor_id)
                if (!advisor_info) continue

                const fragment = document.createDocumentFragment()

                // Add Open Chat
                const open_chat = createElement("li", {
                    html: `<a href="#messages" class="open-chat-extension" data-advisor_id="${advisor_id}">Open Chat</a>`,
                })
                fragment.appendChild(open_chat)

                // Add View Revisions
                const open_revisions = createElement("li", {
                    html: `<a href="/manage/revisions?email=${encodeURIComponent(
                        advisor_info.email,
                    )}" target="_blank" class="">View Revisions</a>`,
                })
                fragment.appendChild(open_revisions)

                // Add View Preview
                const open_preview = createElement("li", {
                    html: `<a href="https://${advisor_info.site.settings.subdomain}.app.twentyoverten.com" class="" target="_blank">View Preview Website</a>`,
                })
                fragment.appendChild(open_preview)

                dropdown.appendChild(fragment)

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
         * Update officer dropdowns with organized optgroups
         */
        updateOfficerList() {
            document.querySelectorAll(".form-item--control.assigned_officer").forEach((select_element) => {
                if (select_element.classList.contains("optGroupsAdded")) return

                const officers = {
                    Teams: [],
                    SiteForward: [],
                    "MLS Sales Communication": [],
                    "Insurance Compliance": [],
                    Miscellaneous: [],
                    Other: [],
                }

                // Organize options into groups
                select_element.querySelectorAll("option").forEach((option) => {
                    const id = option.value.substring(option.value.indexOf("|") + 1)
                    option.setAttribute("data-id", id)

                    if (isTeam(id)) officers.Teams.push(option)
                    else if (isSiteForward(id)) officers.SiteForward.push(option)
                    else if (isMLSSalesCompliance(id)) officers["MLS Sales Communication"].push(option)
                    else if (isMSICompliance(id)) officers["Insurance Compliance"].push(option)
                    else if (isMiscellaneous(id)) officers.Miscellaneous.push(option)
                    else if (!isNotAssignable(id)) officers.Other.push(option)
                })

                const optgroupFragment = document.createDocumentFragment()
                
                Object.entries(officers).forEach(([groupName, optionList]) => {
                    if (groupName === "Other" && optionList.length === 0) return

                    const optgroup = createElement("optgroup", {
                        label: groupName,
                        style: "padding-top: 4px;",
                    })

                    const optionFragment = document.createDocumentFragment()
                    
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
                                optionFragment.appendChild(option.cloneNode(true))
                            }
                            option.remove()
                        })

                    optgroup.appendChild(optionFragment)
                    
                    if (optgroup.children.length > 0) {
                        optgroupFragment.appendChild(optgroup)
                    }
                })
                
                select_element.appendChild(optgroupFragment)

                // Clean up any remaining ungrouped options
                select_element.querySelectorAll(":scope > option").forEach((option) => option.remove())

                // Remove empty optgroups
                select_element.querySelectorAll("optgroup").forEach((optgroup) => {
                    if (optgroup.children.length === 0) optgroup.remove()
                })

                // Set default selection if none exists
                if (!select_element.querySelector("option[selected]")) {
                    const all_option = select_element.querySelector("option[value*='all']")
                    if (all_option) select_element.value = all_option.value
                }

                select_element.classList.add("optGroupsAdded")

                // Hide assignees based on advisor tags
                const tagsElement = select_element.closest("tr")?.querySelector(".advisor-tags")
                if (tagsElement) {
                    const tags = tagsElement.textContent
                    const optgroups = select_element.querySelectorAll("optgroup")

                    // Hide MLS options if no dealer tags
                    if (!tags.includes("IIROC") && !tags.includes("MFDA")) {
                        // Hide MLS option in Teams group
                        const teams_group = optgroups[0]
                        if (teams_group?.querySelectorAll("option")[1]) {
                            teams_group.querySelectorAll("option")[1].style.display = "none"
                        }
                        // Hide MLS Sales Communication group
                        if (optgroups[2]) {
                            optgroups[2].style.display = "none"
                        }
                    }

                    // Hide MSI options if no insurance
                    if (tags.includes("Insurance: None")) {
                        // Hide MSI option in Teams group
                        const teams_group = optgroups[0]
                        if (teams_group?.querySelectorAll("option")[2]) {
                            teams_group.querySelectorAll("option")[2].style.display = "none"
                        }
                        // Hide Insurance Compliance group
                        if (optgroups[3]) {
                            optgroups[3].style.display = "none"
                        }
                    }
                }
            })
        },
        
    /**
     * Setup the search bar for advisor management
     */
    setupSearchBar() {
        const search_config = {
            container: Manage.cache.providenceOverviewList,
            inputId: 'search-advisor',
            buttonId: 'search-advisor-btn',
            label: 'Search Advisors',
            buttonText: 'Search',
            buttonDataCover: 'Search for Advisor',
            helpContent: 'Search for &quot;?&quot; for assistance.',
            searchFunction: this.performAdvisorSearch.bind(this),
            hideTableFunction: () => {
                const table = document.querySelector("#advisorsList_wrapper")
                if (table) table.style.display = "none"
            },
            showTableFunction: () => {
                const table = document.querySelector("#advisorsList_wrapper")
                if (table) table.style.display = "block"
            }
        }

        SearchBar.init(search_config)
        
        // Setup reset listeners specific to advisor search
        this.setupResetListeners()
    },

    /**
     * Setup reset listeners for advisor search
     */
    setupResetListeners() {
        const reset_selectors = ['.providence-overview--nav a']
        reset_selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                element.addEventListener("click", () => SearchBar.resetSearchTable())
            })
        })

        // Filter button click listener
        waitForCondition(() => document.querySelector("#filterAdvisors .btn"))
            .then(() => {
                Manage.cache.refreshDynamicElements()
                Manage.cache.filterBtn?.addEventListener("click", () => SearchBar.resetSearchTable())
            })
    },


    /**
     * Perform advisor search (bound to SearchBar instance)
     */
    async performAdvisorSearch(search_term) {
        const requesting_all = search_term.indexOf("*") === 0
        const requesting_number = search_term.indexOf("#") === 0
        if (requesting_all || requesting_number) {
            search_term = search_term.substring(1)
        }

        const table = document.querySelector(".search-bar table")
        if (!table) return

        SearchBar.hideTable()

        if (search_term === "?") {
            table.innerHTML = `
                <tr><th colspan="3"><h1>Searching can be done by Name, Email, Tags, Status, or Officer.</h1></th></tr>
                <tr><th>Expressions</th><th>Results</th><th>Example</th></tr> 
                    <tr><td>|</td><td>OR</td><td>Published | Submitted</td></tr> 
                    <tr><td>,</td><td>AND</td><td>Published, SiteForward</td></tr> 
                    <tr><td>!</td><td>NOT</td><td>!Published</td></tr>
                </tbody><br>
                <tbody>
                <tr><th colspan="3"><h1>There are some extra searching as well</h1></th></tr>
                    <tr><th>Search</th><th>Results</th><th>Example</th></tr> 
                    <tr><td>published</td><td>Shows all published sites</td><td></td></tr> 
                    <tr><td>submitted</td><td>Shows all submitted sites</td><td></td></tr> 
                    <tr><td>approved</td><td>Shows all approved sites</td><td></td></tr> 
                    <tr><td>pending review</td><td>Shows all sites needing revisions</td><td></td></tr> 
                    <tr><td>revisions needed</td><td>Shows all published sites</td><td></td></tr> 
                    <tr><td>rejected</td><td>Shows all rejected sites</td><td></td></tr> 
                    <tr><td colspan="3"></td></tr> 
                    <tr><td>is_siteforward</td><td>Shows all sites assigned to SiteForward</td><td></td></tr> 
                    <tr><td>is_compliance</td><td>Shows all sites assigned to Compliance</td><td></td></tr> 
                    <tr><td>is_mlssalescompliance</td><td>Shows all sites assigned to MLS Sales Communication</td><td></td></tr> 
                    <tr><td>is_msicompliance</td><td>Shows all sites assigned to Insurance Compliance</td><td></td></tr> 
                    <tr><td>is_onhold</td><td>Shows all sites on hold</td><td></td></tr> 
                    <tr><td colspan="3"></td></tr> 
                    <tr><td>created_at:&lt;year&gt;/[month]/[day]</td><td>Shows sites created at that time</td><td>created_at:2019/08</td></tr> 
                    <tr><td>updated_at:&lt;year&gt;/[month]/[day]</td><td>Shows sites updated at that time</td><td>created_at:2019/08/01</td></tr> 
                    <tr><td>published_at:&lt;year&gt;/[month]/[day]</td><td>Shows sites published at that time</td><td>created_at:2020</td></tr> 
                    <tr><td>submitted_at:&lt;year&gt;/[month]/[day]</td><td>Shows sites submitted at that time</td><td>created_at:2020/01</td></tr> 
                    <tr><td colspan="3"></td></tr> 
                    <tr><td>#</td><td>Shows the number of sites that match</td><td>#Published</td></tr> 
                    <tr><td>*</td><td>Shows all sites that match regardless of number</td><td>*Published</td></tr>
                `
            return
        }

        table.innerHTML = `<thead> 
            <tr role="row">
                <th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1">#</th>
                <th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Name</th>
                <th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Email</th>
                <th class="has-state sorting" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="">Status</th>
                <th class="" tabindex="0" aria-controls="advisorsList" rowspan="1" colspan="1" aria-label="" aria-sort="descending">Last Submitted</th>
                <th class="" rowspan="1" colspan="1" aria-label="Assigned">Assigned</th>
                <th class="" rowspan="1" colspan="1" aria-label="Actions">Actions</th>
            </tr> 
        </thead>`

        const results = this.performSearch(search_term)
        if (results.length === 0) {
            table.innerHTML += `<tr><td colspan="7">No results found</td></tr>`
            return
        }

        if (requesting_number || (results.length > 100 && !requesting_all)) {
            table.innerHTML += `<tr><td colspan="7">Number of results: ${results.length}</td></tr>`
        } else {
            const fragment = document.createDocumentFragment()
            results.forEach((advisor, i) => {
                advisor.prepend(createElement("td", { html: `${i + 1}.` }))
                fragment.appendChild(advisor)
            })
            
            const tbody = document.createElement("tbody")
            tbody.appendChild(fragment)
            table.appendChild(tbody)
        }
        this.updateDropdowns()
        this.updateOfficerList()
        this.checkForUnPublished()
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
        const search_patterns = {
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
            const search_lower = search.replace("&", "&amp;").toLowerCase()

            // Check special commands first
            if (search_patterns.specialCommands[search]) {
                return search_patterns.specialCommands[search](data)
            }

            // Check date pattern
            const date_match = search.match(search_patterns.datePattern)
            if (date_match) {
                const [_, type, year, month, day] = date_match
                return matchesDateCriteria(data, type + "_at", year, month, day)
            }

            // Standard text search
            return (
                data.display_name.toLowerCase().includes(search_lower) ||
                data.email.toLowerCase().includes(search_lower) ||
                data._id.toLowerCase().includes(search_lower) ||
                hasTag(search_lower, data) ||
                hasStatus(search_lower, data) ||
                getOfficerName(data.officer_id).toLowerCase().includes(search_lower)
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
        const data_table = $(table).DataTable()
        data_table.rows().every(function () {
            rows.push(this)
        })

        // Process each search term (split by comma for AND operations)
        return searchString
            .split(",")
            .reduce((filtered_rows, search_group) => {
                search_group = search_group.trim()

                // Process OR operations (split by |)
                return filtered_rows.filter((row) => {
                    return search_group.split("|").some((term) => {
                        term = term.trim()
                        const invert = term.startsWith("!")
                        const search_term = invert ? term.slice(1) : term
                        const matches = matchesTerm(row, search_term)
                        return invert ? !matches : matches
                    })
                })
            }, rows)
            .map((row) => row.node().cloneNode(true))
    }
    },
    // ======================= Review List =======================
    ReviewList: {
        importantTagList: [
            "Migrating",
            "Brand New",
            "Post-Review",
            "Redesign",
            "Not On Program",
            "Tier",
        ],
        reviewCount: {},
        activeFilters: {
            officers: [],
            tags: [],
            all: true
        },
        debouncedUpdateFilters: null, // Will be initialized in init()
        
        async init() {
            // Initialize debounced filter function
            this.debouncedUpdateFilters = debounce(() => this.updateReviewFilters(), 150)
            
            this.setupEventListeners()
            this.sortReviewCards()
            this.addDetailsToCards()
            await this.setupRevisionCount()
            this.updateReviewFilters()
        },

        setupEventListeners() {
            document.addEventListener("click", async (e) => {
                if (e.target.matches(".review-table tbody tr td")) {
                    const table = e.target.closest(".review-table")
                    const clicked_row = e.target.closest("tr")
                    const clicked_category = e.target.closest("tbody").classList[0]
                    const clicked_text = clicked_row.children[0].textContent
                    
                    // Handle "All in Review" special case
                    if (clicked_category === "all") {
                        // Clear all filters and reset to show all
                        this.activeFilters = { officers: [], tags: [], all: true }
                        table.querySelectorAll(".active").forEach(row => row.classList.remove("active"))
                        clicked_row.classList.add("active")
                        this.debouncedUpdateFilters()
                        return
                    }
                    
                    // Disable "all" filter when selecting specific filters
                    this.activeFilters.all = false
                    const allRow = table.querySelector(".all .active")
                    if (allRow) allRow.classList.remove("active")
                    
                    if (clicked_row.classList.contains("active")) {
                        // Remove from active filters
                        clicked_row.classList.remove("active")
                        const filterArray = this.activeFilters[clicked_category]
                        const index = filterArray.indexOf(clicked_text)
                        if (index > -1) {
                            filterArray.splice(index, 1)
                        }
                    } else {
                        // Add to active filters
                        clicked_row.classList.add("active")
                        if (!this.activeFilters[clicked_category].includes(clicked_text)) {
                            this.activeFilters[clicked_category].push(clicked_text)
                        }
                    }
                
                    
                    // If no filters are active, show all
                    if (this.activeFilters.officers.length === 0 && this.activeFilters.tags.length === 0) {
                        this.activeFilters.all = true
                        const allRowInTable = table.querySelector(".all tr")
                        if (allRowInTable) allRowInTable.classList.add("active")
                    }
                    this.debouncedUpdateFilters()
                }
                if(e.target.matches(".advisor-card .assign-to-me i")){
                    const card = e.target.closest(".advisor-card")
                    const advisor_id = card.getAttribute("data-advisor_id")
                    const my_info = getCurrentOfficerInfo()

                    e.target.classList.add("thinking")
                    
                    // Update the main table if row exists
                    const row = document.querySelector(`#advisorsList [data-advisor_id="${advisor_id}"]`)
                    if (row) {
                        const select = row.querySelector(".assigned_officer")
                        select.value = select.value.split("|")[0] + "|" + my_info._id
                    }
                    
                    // Make API call
                    await fetch(`${baseUrl}/api/officers/assign`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ user_id: advisor_id, officer_id: my_info._id })
                    })
                    
                    // Update UI
                    e.target.classList.remove("thinking")
                    card.querySelector(".assign-to-me").remove()
                    card.querySelector(".cardOfficer").outerHTML = `<div class="cardOfficer" data-officer_id="${my_info._id}">${my_info.display_name}</div>`
                    await this.setupRevisionCount()
                    this.debouncedUpdateFilters()
                }
                if(e.target.matches(".advisor-card .find-in-list i")){
                    const card = e.target.closest(".advisor-card")
                    const advisor_id = card.getAttribute("data-advisor_id")
                    const advisor_info = getAdvisorInfo(advisor_id)
                    const search_term = advisor_info?.display_name || advisor_id

                    // Set the search input value first
                    const search_input = document.querySelector(`#${SearchBar.config?.inputId}`)
                    if (search_input) {
                        search_input.value = search_term
                    }

                    const advisor_list = document.querySelector("#advisorsList")
                    const advisor_row = advisor_list.querySelector(`[data-advisor_id="${advisor_id}"]`)
                    
                    if (advisor_row) {
                        // Row exists in current table - reset search to show all, then highlight
                        SearchBar.resetSearchTable()
                        setTimeout(() => {
                            advisor_row.scrollIntoView({ behavior: "smooth", block: "center" })
                            advisor_row.classList.add("highlight")
                            setTimeout(() => {
                                advisor_row.classList.remove("highlight")
                            }, 3000)
                        }, 100)
                    } else {
                        // Row not in current table - perform search
                        await Manage.AdvisorList.performAdvisorSearch(search_term)
                    }
                }

            })
        },
        updateReviewFilters(){
            this.filterCardsForOfficers();
            this.filterCardsAndTagListForTags()
            this.updateShowMoreTags()
            this.updateFilterCounts()
        },

        filterCardsForOfficers(){

            //Remove any unavailable officers from the activeFilter
            const available_officers = new Set([...document.querySelectorAll(".cardOfficer")].map(officer => officer.textContent))
            this.activeFilters.officers = this.activeFilters.officers.filter(officer => available_officers.has(officer))

           const cards = document.querySelectorAll(".advisor-card")
           const all_officers = this.activeFilters.officers.length === 0 || this.activeFilters.all
           if (cards.length === 0) return

           // Use CSS classes instead of inline styles for better performance
           cards.forEach((card) => {
               const card_officer = card.querySelector(".cardOfficer")?.textContent
               const matches_officer_filter = (card_officer && this.activeFilters.officers.includes(card_officer)) || all_officers
               card.classList.toggle("card-hidden", !matches_officer_filter)
           })
        },

        filterCardsAndTagListForTags(){
            const tag_rows = document.querySelectorAll(".review-table .tags tr")
            // Get cards that passed officer filtering, or all cards if no officer filter is active
            const cards_after_officer_filter = this.activeFilters.officers.length === 0 || this.activeFilters.all 
                ? [...document.querySelectorAll(".advisor-card")]  // All cards if no officer filter
                : [...document.querySelectorAll(".advisor-card")].filter(card => !card.classList.contains("card-hidden")) // Cards that passed officer filter
            
            const tags_with_visible_cards = new Set()

            // Collect all available tags from cards after officer filtering
            cards_after_officer_filter.forEach(card => {
                const card_tags = [...card.querySelectorAll('.card-tags .tag')].map(tag => tag.textContent)
                card_tags.forEach(tag => tags_with_visible_cards.add(tag))
            })

            // Check if any active tag filters are not available from visible cards and remove them
            const tags_to_remove = this.activeFilters.tags.filter(activeTag => !tags_with_visible_cards.has(activeTag))
            if (tags_to_remove.length > 0) {
                // Remove unavailable tags from active filters
                this.activeFilters.tags = this.activeFilters.tags.filter(activeTag => tags_with_visible_cards.has(activeTag))
                
                // Remove active class from deselected tag rows
                tags_to_remove.forEach(removedTag => {
                    const tag_row = [...tag_rows].find(row => row.children[0]?.textContent === removedTag)
                    if (tag_row) {
                        tag_row.classList.remove("active")
                    }
                })
            }

            // Reset tags_with_visible_cards for final filtering
            tags_with_visible_cards.clear()

            // Hide all tag rows initially
            tag_rows.forEach(tag_row => tag_row.style.display = "none")

            // Filter cards based on tag selection (AND logic) and collect tags from visible cards
            cards_after_officer_filter.forEach(card => {
                if (this.activeFilters.tags.length === 0) {
                    // No tag filters active - ensure card is visible
                    card.classList.remove("card-hidden")
                    // Add all tags from this visible card
                    const card_tags = [...card.querySelectorAll('.card-tags .tag')].map(tag => tag.textContent)
                    card_tags.forEach(tag => tags_with_visible_cards.add(tag))
                } else {
                    // Check if card has ALL active tag filters
                    const card_tags = [...card.querySelectorAll('.card-tags .tag')].map(tag => tag.textContent)
                    const has_all_tags = this.activeFilters.tags.every(activeTag => card_tags.includes(activeTag))
                    card.classList.toggle("card-hidden", !has_all_tags)
                    
                    // If card will be visible, add its tags to the available set
                    if (has_all_tags) {
                        card_tags.forEach(tag => tags_with_visible_cards.add(tag))
                    }
                }
            })

            // Show only tag rows that have visible cards
            for(const tag_row of tag_rows){
                const tag_name = tag_row.children[0]?.textContent
                if (tag_name && tags_with_visible_cards.has(tag_name)) {
                    tag_row.style.display = "table-row"
                }
            }
        },
        updateShowMoreTags(){
            const visible_important_tags = [...document.querySelectorAll(".review-table .tags.important-tags tr")].filter(row => row.style.display !== "none")
            const expand_toggle = document.querySelector(".review-table .expand-toggle")
            const other_tags = document.querySelector(".review-table .other-tags")

            if (visible_important_tags.length === 0) {
                // No important tags visible, auto-expand other tags and hide toggle
                expand_toggle.style.display = "none"
                other_tags.style.display = "table-row-group"
            } else {
                // Important tags are visible, show toggle and respect its state
                expand_toggle.style.display = "inline-block"
                const is_expanded = expand_toggle.classList.contains("expanded")
                other_tags.style.display = is_expanded ? "table-row-group" : "none"
            }
        },
        updateFilterCounts(){
            const tag_rows = document.querySelectorAll(".review-table .tags tr")
            const visible_cards = [...document.querySelectorAll(".advisor-card")].filter(card => !card.classList.contains("card-hidden"))

            // Update the site and pending counts in tag_rows based off visible_cards tags
            tag_rows.forEach(row => {
                const tag_name = row.children[0]?.textContent
                const matching_cards = visible_cards.filter(card => {
                    const tags = card.querySelectorAll('.card-tags .tag')
                    return Array.from(tags).some(tag => tag.textContent === tag_name)
                })
                if (tag_name) {
                    const count = matching_cards.length
                    row.children[1].textContent = count
                    row.children[2].textContent = matching_cards.reduce((acc, card) => {
                        const pending = card.querySelector('.cardPending')
                        return acc + (pending ? parseInt(pending.textContent) : 0)
                    }, 0)
                }
            })
        },

        /**
         * Sort advisor review cards by priority and time
         */
        sortReviewCards() {
            const advisor_cards = document.querySelectorAll(".advisor-card")
            if (advisor_cards.length === 0) return

            // Convert to array and sort
            const sorted_cards = Array.from(advisor_cards).sort((a, b) => {
                // Get advisor names from cards
                const name_a = a.dataset.name
                const name_b = b.dataset.name

                // Load advisor info from DataTable
                const info_a = getAdvisorInfoByName(name_a)
                const info_b = getAdvisorInfoByName(name_b)

                // Get current times for both cards in minutes
                const time_a = this.parseTimeToMinutes(a.querySelector(".submitted")?.textContent || "")
                const time_b = this.parseTimeToMinutes(b.querySelector(".submitted")?.textContent || "")

                // Check if either card is a construction page
                const is_construction_a = hasTag("Construction", info_a)
                const is_construction_b = hasTag("Construction", info_b)

                // Construction Pages come first
                if (is_construction_a && !is_construction_b) return -1
                if (is_construction_b && !is_construction_a) return 1

                // Compare time (newer submissions first)
                return time_a < time_b ? 1 : time_a > time_b ? -1 : 0
            })

            const container = document.querySelector(".providence-pending--list")
            if (container) {
                const fragment = document.createDocumentFragment()
                sorted_cards.forEach((card) => fragment.appendChild(card))
                container.appendChild(fragment)
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
        async setupRevisionCount() {
            const advisor_cards = document.querySelectorAll(".advisor-card")
            this.reviewCount = { all: { sites: 0, pending: 0, total: 0 }, tags: {}, officers: {} }
            
            const promises = Array.from(advisor_cards).map(async (card) => {
            const revisions = await this.getRevisions(card.getAttribute("data-advisor_id"))
            card.querySelector(".cardApprovals").textContent = revisions.approved
            card.querySelector(".cardPending").textContent = revisions.pending
            card.querySelector(".cardRejections").textContent = revisions.rejected

            // Update overall review count
            this.reviewCount.all.sites += 1
            this.reviewCount.all.pending += revisions.pending
            this.reviewCount.all.total += revisions.approved + revisions.pending + revisions.rejected

            // Update tag review count
            const tags = card.querySelectorAll(".card-tags .tag")
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
            })

            await Promise.all(promises)
            this.updateReviewTable()
        },
        updateReviewTable() {
            const review_cards = document.querySelectorAll(".advisor-card")
            
            // Create the main container
            const review_filter = createElement("div", { class: "review-filter" })
            
            // Create title
            const title = createElement("h2", { html: "Pending Reviews" })
            review_filter.appendChild(title)
            
            const table = createElement("table", { class: "review-table" })
            
            // Create table header
            const thead = createElement("thead")
            const headerRow = createElement("tr")
            headerRow.innerHTML = `<th>Filter</th><th>Sites</th><th>Pending</th>`
            thead.appendChild(headerRow)
            table.appendChild(thead)
            
            // Create "All" section
            const allTbody = createElement("tbody", { class: "all" })
            const allRow = createElement("tr", { class: "active" })
            allRow.innerHTML = `<td>All in Review</td><td>${this.reviewCount.all.sites}</td><td>${this.reviewCount.all.pending}</td>`
            allTbody.appendChild(allRow)
            table.appendChild(allTbody)
            
            // Create Officers section header
            const officersHead = createElement("thead")
            const officersHeaderRow = createElement("tr")
            officersHeaderRow.innerHTML = `<th>Filter by Officer</th>`
            officersHead.appendChild(officersHeaderRow)
            table.appendChild(officersHead)
            
            const officersTbody = createElement("tbody", { class: "officers" })
            const officersFragment = document.createDocumentFragment()
            Object.entries(this.reviewCount.officers).forEach(([officer, data]) => {
                const row = createElement("tr")
                row.innerHTML = `<td>${officer}</td><td>${data.sites}</td><td>${data.pending}</td>`
                officersFragment.appendChild(row)
            })
            officersTbody.appendChild(officersFragment)
            table.appendChild(officersTbody)
            
            // Create Tags section header
            const tagsHead = createElement("thead")
            const tagsHeaderRow = createElement("tr")
            tagsHeaderRow.innerHTML = `<th>Filter by Tags <span class="expand-toggle" title="Show/Hide Other Tags">▼</span></th>`
            tagsHead.appendChild(tagsHeaderRow)
            table.appendChild(tagsHead)
            
            const importantTagsTbody = createElement("tbody", { class: "tags important-tags" })
            const importantTagsFragment = document.createDocumentFragment()
            Object.entries(this.reviewCount.tags)
                .filter(([tag, data]) => {
                    return this.importantTagList.some((importantTag) => tag.indexOf(importantTag) > -1)
                })
                .sort(([tagA], [tagB]) => tagA.localeCompare(tagB))
                .forEach(([tag, data]) => {
                    const row = createElement("tr")
                    row.innerHTML = `<td>${tag}</td><td class="sites">#</td><td class="pending">#</td>`
                    importantTagsFragment.appendChild(row)
                })
            importantTagsTbody.appendChild(importantTagsFragment)
            table.appendChild(importantTagsTbody)
            
            const otherTagsTbody = createElement("tbody", { class: "tags other-tags", style: "display:none" })
            const otherTagsFragment = document.createDocumentFragment()
            Object.entries(this.reviewCount.tags)
                .filter(([tag, data]) => {
                    return !this.importantTagList.some((importantTag) => tag.indexOf(importantTag) > -1)
                })
                .sort(([tagA], [tagB]) => tagA.localeCompare(tagB))
                .forEach(([tag, data]) => {
                    const row = createElement("tr")
                    row.innerHTML = `<td>${tag}</td><td class="sites">#</td><td class="pending">#</td>`
                    otherTagsFragment.appendChild(row)
                })
            otherTagsTbody.appendChild(otherTagsFragment)
            table.appendChild(otherTagsTbody)
            
            // Append table to container
            review_filter.appendChild(table)
            
            document.querySelector(".providence-pending--title").innerHTML = review_filter.outerHTML
            
            // Setup expand toggle with simplified logic
            const expand_toggle = document.querySelector(".expand-toggle")
            const other_tags = document.querySelector(".tags.other-tags")
            
            expand_toggle.addEventListener("click", () => {
                const is_expanded = expand_toggle.classList.toggle("expanded")
                other_tags.style.display = is_expanded ? "table-row-group" : "none"
                expand_toggle.innerHTML = is_expanded ? "▲" : "▼"
                expand_toggle.title = is_expanded ? "Hide Other Tags" : "Show Other Tags"
            })
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
            document.querySelectorAll(".advisor-card").forEach(async (card) => {
                // Add card status section
                if (!card.querySelector(".card-status")) {
                    const card_content = card.querySelector(".card-content")
                    const card_status = createElement("div", { class: "card-status" })
                    card_content?.prepend(card_status)

                    // Move submitted and changes elements to card status
                    const submitted = card.querySelector(".submitted")
                    const changes = card.querySelector(".card-changes")
                    if (submitted) card_status.appendChild(submitted)
                    if (changes) card_status.appendChild(changes)
                }

                // Add card title section
                if (!card.querySelector(".card-title")) {
                    const card_title = createElement("div", { class: "card-title" })
                    card.prepend(card_title)

                    // Move advisor profile and h4 to card title
                    const advisor_profile = card.querySelector(".advisor-profile")
                    const h4 = card.querySelector("h4")
                    if (advisor_profile) card_title.appendChild(advisor_profile)
                    if (h4) card_title.appendChild(h4)
                }

                const advisor_id = card.querySelector(".btn--action-review")?.href.split("/").pop()
                const advisor_info = getAdvisorInfo(advisor_id)
                card.setAttribute("data-advisor_id", advisor_id)

                // Add card changes section
                if (!card.querySelector(".card-changes")) {
                    const submitted = card.querySelector(".submitted")
                    if (submitted) {
                        const card_changes = createElement("div", {
                            class: "card-changes",
                            html: '<span><span class="cardApprovals"></span> - <span class="cardPending"></span> - <span class="cardRejections"></span></div>',
                        })
                        submitted.insertAdjacentElement("afterend", card_changes)
                    }
                }
                
                let important_tags = ""
                let all_tags = ""

                advisor_info.settings.broker_tags.forEach((tag) => {
                    if (this.importantTagList.some((important_tag) => tag.name.indexOf(important_tag) > -1))
                        important_tags += `<span class="tag">${tag.name}</span>, `
                    all_tags += `<span class="tag">${tag.name}</span>, `
                })
                important_tags = important_tags.slice(0, -2) // Remove trailing comma and space
                all_tags = all_tags.slice(0, -2) // Remove trailing comma and space

                // Add card tags section
                if (!card.querySelector(".card-tags")) {
                    card.querySelector(".card-content").append(createElement("div", { class: "card-tags", html: all_tags }))
                }

                // Add card extras section
                if (!card.querySelector(".card-extras")) {
                    const officer_name = getOfficerName(advisor_info.officer_id)
                    const my_officer_info = getCurrentOfficerInfo()
                    const can_assign_to_me = isOnTeam(advisor_info.officer_id, my_officer_info._id)

                    const card_content = card.querySelector(".card-content")
                    const card_extras = createElement("div", {
                        class: "card-extras",
                        html: `
                        <p class="cardOfficer" data-officer_id="${advisor_info.officer_id}" style="margin: 0">${officer_name}</p>
                        <p class="cardImportantTags" style="line-height: 1; margin: 0">${important_tags}</p>
                        <a class="card-helper find-in-list" href="#" title="Find in Advisor List"><i class="fa fa-search" aria-hidden="true"></i></a>
                        ${can_assign_to_me ? `<a class="card-helper assign-to-me" href="#" title="Assign to me"><i class="fa fa-user-plus" aria-hidden="true"></i></a>` : ``}`,
                    })
                    card_content?.appendChild(card_extras)
                }

                // Add the Open chat button to the card
                if (!card.querySelector(".open-chat-extension")) {
                    const review_btn = card.querySelector(".card-action .btn--action-review")
                    if (review_btn) {
                        review_btn.target = "_blank"

                        const chat_btn = createElement("a", {
                            href: "#messages",
                            style: "margin-left: 5px;flex-grow:1",
                            class: "btn pill primary btn--action-review open-chat-extension",
                            "data-advisor_id": advisor_id,
                            "data-cover": "Open Chat",
                            html: "Open Chat",
                        })

                        const card_action = card.querySelector(".card-action")
                        card_action?.appendChild(chat_btn)
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
    advisorId: null,
    advisorInfo: null,
    init(){
        this.advisorId = url_parts[5]
        if (this.advisorId[this.advisorId.length - 1] === "#")
            this.advisorId = this.advisorId.slice(0, -1)

        this.advisorInfo = getAdvisorInfo(this.advisorId)
        AdvisorDetails.init(this.advisorInfo)

        this.setupEventListeners()

        if(!document.querySelector(".no-changes")){
            this.setupAlwaysShowReviewSubmission()
            this.updateChangeCounts()
            if(isSiteForwardUser())
                this.addSiteForwardControls()
            
            this.addClearStateButton()
            this.setupReviewItemNotes()
            this.updateViewButtonText()
            this.checkEmptyReview()
            this.setupLastReviewed()
            this.updateTagsInAdvisorTitle()
        }
        this.InternalDB.init(this.advisorId)
    },
    setupEventListeners(){
        document.addEventListener("click", async (e) => {

            if(e.target.matches(".revision-note")){
                document.querySelector("#revision-note-overlay").setAttribute("data-id", e.target.getAttribute("data-id"))
            }
            
            if(e.target.matches("#revision-note-overlay .save, #revision-note-overlay .cancel") || 
               e.target.matches("#rejection-note-overlay .save, #rejection-note-overlay .cancel")){

                await waitForClassAsync(true, e.target.closest(".settings-wrapper").parentNode, "velocity-animating")

                const id = document.querySelector("#revision-note-overlay").getAttribute("data-id")
                document.querySelector(`.revision-note[data-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })
            }

            if(e.target.matches(".btn-clear-state")){
                e.preventDefault()
                const review_item = e.target.closest(".review-item")
                const review_id = review_item.querySelector("[data-id]").getAttribute("data-id")
                const clear_notes = e.ctrlKey || e.metaKey
                e.target.textContent = clear_notes ? "Clearing All..." : "Clearing State..."
                e.target.classList.add("thinking")
                
                const payload = { state: "" }
                if (clear_notes) {
                    payload.internal_notes = ""
                    payload.notes = ""
                }
                
                await fetch(`${baseUrl}/api/revisions/${review_id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })
                review_item.classList.remove("approved-status", "rejected-status")
                review_item.querySelector(".active")?.classList.remove("active")
                review_item.querySelector(".review-item__status").innerHTML = `<span class="review-item-status pending-status">Pending Review</span>`
                e.target.textContent = "Clear State"
                e.target.classList.remove("thinking")
                setTimeout(() => this.addReviewItemNotesToPage(review_item.getAttribute("data-id")), 100)
                this.updateChangeCounts()
            }
      
            if(e.target.matches("#revision-note-overlay .save")){
                let reset_internal_notes = false
                const overlay = document.querySelector("#revision-note-overlay")
                const review_id = e.target.getAttribute("data-id")
                
                if(overlay.querySelector(".show-placeholder")){ // Fixes bug of not being able to remove note after adding it
                   reset_internal_notes = true
                }
                await waitForClassAsync(true, overlay, "velocity-animating")
                await waitForClassAsync(false, overlay, "velocity-animating")
                if(reset_internal_notes)
                     await fetch(`${baseUrl}/api/revisions/${review_id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ internal_notes: "" })
                    })
                this.addReviewItemNotesToPage(review_id)
            }

            if(e.target.matches("#rejection-note-overlay .save")){
                const overlay = document.querySelector("#rejection-note-overlay")
                await waitForClassAsync(true, overlay, "velocity-animating")
                await waitForClassAsync(false, overlay, "velocity-animating")
                const review_id = e.target.getAttribute("data-id")
                this.addReviewItemNotesToPage(review_id)
            }

            if(e.target.matches(".btn--action-approve, .btn--action-reject"))
                setTimeout(() => this.addPendingCount(), 1)

            if(e.target.matches(".btn--action-approve"))
                setTimeout(() => this.addReviewItemNotesToPage(e.target.closest(".review-item").getAttribute("data-id")), 1)

        })
    },
    updateChangeCounts(){
        this.addPendingCount()
        document.querySelector(".review-count-items .approved-count span").textContent = $(".review-item.approved-status").length
        document.querySelector(".review-count-items .rejected-count span").textContent = $(".review-item.rejected-status").length
    },
    setupAlwaysShowReviewSubmission(){
        document.querySelector(".review-submission").classList.add("showing")
    },
    updateTagsInAdvisorTitle(){
        const member_review_items = Array.from(document.querySelectorAll("h3")).find(h3 => h3.textContent.trim() === "Members")?.parentElement.querySelectorAll(".posts-review .review-item") || []
        for (const item of member_review_items)
            item.querySelector(".title").innerHTML = item.querySelector(".title").innerHTML.replace(/\[(?!br\])(.*?)\]/g, '<$1>');
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
        const pending_count = $(".review-item:not(.approved-status):not(.rejected-status)").length
        const pending_count_text = createElement('div',{
            class: "approved-count pending-count",
            html: `<span class="${pending_count > 0 ? "active" : ""}">${pending_count}</span> Pending Changes`
        })
        document.querySelector(".approved-count").insertAdjacentElement("afterend", pending_count_text)
    },
    updateViewButtonText(){
        const review_items = document.querySelectorAll(".review-item")
        review_items.forEach((item) => {
            if(item.querySelector(".review-actions a").textContent.includes("Link")){
                const link = item.querySelector(".review-url").textContent
                const review = item.querySelector(".review-actions a")

                 //Indicate if the link is External or Internal
                if (link.indexOf("http") >= 0)
                    review.innerHTML = "Visit External Link";
                else if (link.indexOf("#") >= 0) {
                    review.innerHTML = "Section Link";
                    review.removeAttribute("href");
                    review.style = "cursor: no-drop";
                    review.classList.add("approve-item");
                    review.classList.add("active");
                    review.title = "Just a section link; This has no content.";
                }
                else {
                    review.innerHTML = "Navigation Link";
                    review.removeAttribute("href");
                    review.style = "cursor: no-drop";
                    review.classList.add("approve-item");
                    review.classList.add("active");
                    review.title = "Just a navigation link; This has no content.";
                }
            }
        })
    },
    addSiteForwardControls(){
        const approve_all_btn = createElement("a", {
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

                add_note_to_all_btn.textContent = "Adding Notes..."
                add_note_to_all_btn.classList.add("thinking")
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
                    add_note_to_all_btn.textContent = "Add Note to All"
                    add_note_to_all_btn.classList.remove("thinking")
                    this.setupReviewItemNotes()
                }).catch(error => {
                    console.error("Failed to update some revisions:", error)
                })
            }
        })
        document.querySelector(".changes-header .btn-group").appendChild(add_note_to_all_btn)

        
    },
    addClearStateButton(){
        const clear_state = createElement("a", {
            href: '#',
            class: "btn pill btn--action-default btn-clear-state",
            html: "Clear State",
            title: "Clear the state. Holding CTRL will also clear all notes."
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
        const review_item = document.querySelector(`.review-item[data-id="${review_id}"]`)

        let { status, officer, date, note, rejection } = await this.getReviewInfoFromRevisionsPage(review_id)
        if (!status || status == "")
            ({ status, officer, date, note, rejection } = await this.getReviewInfoFromAPI(review_id))

        const review_item_preview = createElement("div", {
                class: "review-item-preview",
                html: `
                ${officer ? `<p class="review-details"><span class="officer">Reviewed by: ${officer}</span> - <span class="date">${date}</span></p>` : ""}
                ${rejection ? `<div class="review-rejection"><h3>${review_item.classList.contains("rejected-status") ? "" : "Previous "}Rejection Note</h3><div class="review-html">${rejection}</div></div>` : ""}
                ${note ? `<div class="review-note"><h3>Internal Review Note</h3><div class="review-html">${note}</div></div>` : ""}
                `
            })
            
        // Remove if already existing
        review_item.querySelector(`.review-item-preview`)?.remove()

        // Add the preview to the page
        review_item.appendChild(review_item_preview)
    },
    async getReviewInfoFromRevisionsPage(review_id){
        let response = await fetch(`${baseUrl}/manage/revisions/${this.advisorId}/${review_id}`)
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
    async getReviewInfoFromAPI(review_id){
        let response = await fetch(`${baseUrl}/api/revisions/${review_id}`)
        if (!response.ok) return {}
        const data = await response.json()
        return {
            status: data.state,
            officer: "",
            date: "",
            note: data.internal_notes,
            rejection: data.notes
        }
    },
    setupLastReviewed(){
        setTimeout(() => {
            const last_reviewed_id = localStorage.getItem("last_reviewed_id")
            if (!last_reviewed_id) return

            const last_reviewed_item = document.querySelector(`a[data-id="${last_reviewed_id}"]`)
            if (!last_reviewed_item) return

            last_reviewed_item.scrollIntoView({behavior: "smooth", block: "center"} )
            localStorage.removeItem("last_reviewed_id")
        }, 1000)
    },

    // ======================= InternalDB =======================
    InternalDB:{
        advisorId: null,
        notesLoaded: false,
        statusesLoaded: false,

        init(advisor_id){
            this.advisorId = advisor_id
            this.setupEventListeners()
            this.setupNotes()
            this.setupStatuses()

        },
        setupEventListeners(){


            document.addEventListener("click", async (e) => {
                if(e.target.matches(".advisor-statuses .sidebar-module-message-icon i")){
                     let confirmation = confirm("Are you sure you want to delete this status?");
                     if (confirmation == true) {
                        const messageModule = e.target.closest(".sidebar-module-message");
                        let timeStamp = messageModule.querySelector("[data-time]").getAttribute("data-time");
                        console.log(`Deleting status for advisor ${this.advisorId} with ${timeStamp}`); // TODO: Fix, getting an error on below
                        try{
                            await database.deleteStatus(this.advisorId, timeStamp)
                            messageModule.remove()
                            console.log(`Deleted status for advisor ${this.advisorId} with ${timeStamp}`);
                        } catch (error) {
                            console.error(`Failed to delete status for advisor ${this.advisorId} with ${timeStamp}:`, error);
                        }
                    }
                  }
            });
        },
        setupNotes(){
            const note_button = createElement("div",{
                class: "sidebar-module advisor-notes",
                tabindex: "0",
                html: `
                <div class="sidebar-module-icon"><i class="far fa-pencil-alt"></i><span>Notes</span></div>
                <div class="sidebar-module-wrapper">
                    <div class="sidebar-module-header">Website Notes</div>
                    <div class="sidebar-module-body">
                        <div class="sidebar-module-message">
                            <div class="sidebar-module-message-content">
                                <textarea class="updateNotes-textarea" placeholder="Loading Notes..."></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="sidebar-module-footer">
                        <button class="btn updateNotes-button" style="display: none">Save</button>
                    </div>
                </div>`,
                onclick: ()=>{
                    this.loadNotes()
                }
            })
            document.querySelector("#advisor-details").prepend(note_button)
            document.querySelector(".updateNotes-textarea").addEventListener("input", (e) => e.target.closest(".sidebar-module").querySelector(".updateNotes-button").style.display = "block")
            document.querySelector(".updateNotes-button").addEventListener("click", async (e) => {
                const textarea = document.querySelector(".updateNotes-textarea")
                e.target.innerHTML = "Updating Notes..."
                const notes = textarea.value
                await database.updateNotes(this.advisorId, notes)
                e.target.innerHTML = "Notes Updated"
                setTimeout(() => {
                    e.target.innerHTML = "Save"
                }, 2000)
            })
        },
        async loadNotes(){
            if (this.notesLoaded) return
            const textarea = document.querySelector(".updateNotes-textarea")
            try {
                const res = await database.getNotes(this.advisorId)
                this.notesLoaded = true
                
                if (res?.message) {
                    textarea.value = res.message
                } else {
                    textarea.placeholder = "There are no notes for this website.\nClick here to add some."
                }
            } catch (error) {
                console.error("Error loading notes:", error)
                textarea.placeholder = "Unable to load notes."
            }
        },
        setupStatuses(){
            const statuses_button = createElement("div", {
                class: "sidebar-module advisor-statuses",
                tabindex: "0",
                html: `
                <div class="sidebar-module-icon"><i class="far fa-comments-alt"></i><span>Status</span></div>
                <div class="sidebar-module-wrapper">
                    <div class="sidebar-module-header">Website Status</div>
                    <div class="sidebar-module-body">
                        <div class="sidebar-module-message statusPlaceholder">
                            <div class="sidebar-module-message-content">Loading Statuses...</div>
                        </div>
                    </div>
                    <div class="sidebar-module-footer">
                        <textarea class="addStatus-input" type="text" placeholder="Add a status"></textarea>
                        <button class="btn addStatus-button">Send</button>
                    </div>
                </div>
                `,
                onclick: () => {
                    this.loadStatuses()
                }
            })
            document.querySelector("#advisor-details").prepend(statuses_button)
        },
        async loadStatuses(){
            if (this.statusesLoaded) return;
            
            try {
                const statuses = await database.getStatuses(this.advisorId);
                this.statusesLoaded = true;

                if (statuses && statuses.length > 0) {
                    statuses.forEach(status => {
                        console.log(`Loaded Status for advisor ${this.advisorId} with ${status.timestamp}`);
                        this.addStatusNode(status.officer, status.timestamp, status.message);
                    });
                } else {
                    document.querySelector(".advisor-statuses .sidebar-module-message-content").innerHTML = 
                        "There are no statuses for this website.";
                }
            } catch (error) {
                console.error("Error loading statuses:", error);
                document.querySelector(".advisor-statuses .sidebar-module-message-content").innerHTML = "Unable to load statuses.";
            }
            
            this.setupAddStatusButton();
        },
        
        setupAddStatusButton() {
            const addStatusButton = document.querySelector(".advisor-statuses .addStatus-button");
            
            addStatusButton.addEventListener("click", async (e) => {
                const messageInput = document.querySelector(".advisor-statuses .addStatus-input");
                const message = messageInput.value.trim();
                
                if (message) {
                    e.target.innerHTML = "Sending...";
                    document.querySelector(".advisor-statuses .statusPlaceholder")?.remove();
                    messageInput.value = "";
                    
                    const date = new Date().getTime();
                    const officer = officer_list.find(officer => officer._id == window.loggedInUser).display_name;

                    try {
                        await database.addStatus(this.advisorId, date, officer, message);
                        this.addStatusNode(officer, date, message);
                        e.target.innerHTML = "Send";
                    } catch (error) {
                        console.error("Error adding status:", error);
                        e.target.innerHTML = "Error";
                        setTimeout(() => {
                            e.target.innerHTML = "Send";
                        }, 2000);
                    }
                }
            });
        },
        addStatusNode(officer, timestamp, message) {
            // Remove placeholder if it exists
            document.querySelector(".advisor-statuses .statusPlaceholder")?.remove();
            
            const date = new Date(timestamp);
            const formattedDate = this.formatStatusDate(date);
            
            const statusElement = createElement("div", {
                class: "sidebar-module-message",
                html: `
                    ${officer == document.querySelector("#header").querySelector(".display-name + small").textContent ? `<div class="sidebar-module-message-icon"><i class="fas fa-trash-alt"></i></div>` : ""}
                    <div class="sidebar-module-message-info">
                        <span class="sidebar-module-message-name">${officer}</span>
                        <span class="sidebar-module-message-time" data-time="${timestamp}">${formattedDate}</span>
                    </div>
                    <div class="sidebar-module-message-content">${message}</div>
                `
            });
            
            const statusContainer = document.querySelector(".advisor-statuses .sidebar-module-body");
            const existingStatuses = Array.from(statusContainer.children);
            const insertBefore = existingStatuses.find(status => {
                const statusTime = parseInt(status.querySelector(".sidebar-module-message-time").dataset.time, 10);
                return statusTime > timestamp;
            });
            statusContainer?.insertBefore(statusElement, insertBefore || null);
        },
        
        formatStatusDate(date) {
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const year = date.getFullYear();
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours < 12 ? "am" : "pm";
            const displayHours = ((hours % 12) || 12);
            const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
            
            return `${month}/${day}/${year} - ${displayHours}:${displayMinutes}${ampm}`;
        }
    }
}

// =============================================================================
// Review Page Module
// =============================================================================
const Review = {
    advisorId: null,
    advisorInfo: null,
    reviewId: null,
    async init(){
        this.advisorId = url_parts[5]
        if (this.advisorId[this.advisorId.length - 1] === "#")
            this.advisorId = this.advisorId.slice(0, -1)
        this.reviewId = url_parts[6]
        if (this.reviewId[this.reviewId.length - 1] === "#")
            this.reviewId = this.reviewId.slice(0, -1)

        this.advisorInfo = getAdvisorInfo(this.advisorId)
        AdvisorDetails.init(this.advisorInfo)
        localStorage.setItem("last_reviewed_id", this.reviewId)

        this.setupEventListeners()
        this.addAddExtraButton()
        this.updateTagsInAdvisorTitle()
        this.FloatingTools.init(this.reviewId)
    },
    setupEventListeners(){
        // Setup event listeners for the review page
    },
    
    updateTagsInAdvisorTitle(){
        document.querySelector(".title-wrapper .title").innerHTML = document.querySelector(".title-wrapper .title").innerHTML.replace(/\[(?!br\])(.*?)\]/g, '<$1>');
    },
    addAddExtraButton(){
        const add_note_btn = createElement("button", {
            class: "btn btn--action-default revision-note",
            html: "Add Note",
            onclick: async () => {

                const note = prompt("Add your note")
                if (!note) return

                add_note_btn.textContent = "Adding Note..."
                add_note_btn.classList.add("thinking")
                
                await fetch(`${baseUrl}/api/revisions/${this.reviewId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ internal_notes: note })
                })
                add_note_btn.textContent = "Add Note"
                add_note_btn.classList.remove("thinking")
            }
        })
        document.querySelector(".review-tools").appendChild(add_note_btn)

        if (document.querySelector(".review-tools a.active")) {
            const view_revisions_btn = createElement("a", {
                class: "btn pill secondary btn-sm primary btn--action-review",
                target: "_blank",
                html: "View Revisions",
                href: window.location.href.replace("review", "revisions")
            })
            document.querySelector(".review-tools").appendChild(view_revisions_btn)
        }
    },
    FloatingTools: {
        reviewId: null,
        floatingTools: null,
        init(review_id){
            this.reviewId = review_id
            this.floatingTools = createElement("div", {
                class: "floating-review-item-wrapper"
            })
            document.querySelector(".review-header").appendChild(this.floatingTools)

            this.setupEventListeners()
            this.addNightModeToggle()
            this.setupContentReview()
        },
        setupEventListeners(){
            // Setup event listeners for the floating tools
        },
        addNightModeToggle(){
            const dark_toggle_btn = createElement("button", {
                class: "floating-review-item dark-toggle",
                title: "Toggle page preview darkness",
                html: `<i class="fas fa-moon"></i>`,
                onclick: (e) => {
                    e.target.closest("i").classList.toggle("fa-sun")
                    e.target.closest("i").classList.toggle("fa-moon")
                    document.querySelector(".change-item").classList.toggle("darken")
                }
            })
            this.floatingTools.appendChild(dark_toggle_btn)
        },
        setupContentReview() {
            this.checkIfContent(this.reviewId).then((result) => {
                if (!result.is_post) return

                this.updateContentButton(result)
            })
        },

        /**
         * Update the content button with appropriate icon and tooltip
         */
        updateContentButton(result) {

            const button = document.querySelector(".open-differences")
            if (!button) return

            const icon = button.querySelector("i")
            icon.classList.remove("fa-spinner")

            if(!result.matched_article){
                icon.classList.add("fa-edit")
                button.setAttribute("title", "This is custom content")
                return
            }

            const matched_article = result.matched_article

            // Determine tooltip based on match type
            let tooltip = `${matched_article.source} Content`
            icon.classList.add("fa-copy")

            if(matched_article.id_matches)
                tooltip = `Found matching ID in ${matched_article.source} content`
            else if(matched_article.title_matches)
                tooltip = `Found matching title in ${matched_article.source} content`
            else if(matched_article.html_matches)
                tooltip = `Found matching content in ${matched_article.source} content`
            

            if (result.edits && (result.edits.title.length > 0 || result.edits.content.length > 0)) {
                tooltip += " (Click to see differences)"
                icon.classList.remove("fa-copy")
                icon.classList.add("fa-user-edit")
                this.setupDifferencesDialog(result.edits)
            }else
                tooltip += " (No differences found)"
            
            button.setAttribute("title", tooltip)
        },

        /**
         * Setup the differences dialog for edited content
         */
        setupDifferencesDialog(edits) {
            const trigger = document.querySelector(".open-differences")
            if (!trigger) return

            const differences = this.generateDifferencesHTML(edits)

            trigger.addEventListener("click", (event) => {
                event.preventDefault()
                this.showDifferencesDialog(differences, trigger)
            })
        },

        /**
         * Generate HTML for displaying content differences
         */
        generateDifferencesHTML(edits) {
            let html = ""

            if (edits.title && edits.title.length > 0) {
                html += '<h2>📝 Title Differences</h2>'
                html += edits.title.map(edit => this.createDifferenceBlock(edit)).join("")
            }

            if (edits.content && edits.content.length > 0) {
                if (html) html += '<div style="margin: 2rem 0 1rem 0;"></div>'
                html += '<h2>📄 Content Differences</h2>'
                html += edits.content.map(edit => this.createDifferenceBlock(edit)).join("")
            }

            if (html === "") {
                html = '<div style="text-align: center; padding: 2rem; color: #666;">No differences found</div>'
            }

            return html
        },

        /**
         * Create a single difference comparison block
         */
        createDifferenceBlock(edit) {
            const escapeAndHighlight = (text) => {
                return this.escapeHTML(text)
                    .replace(/\[\[/g, '<span class="diff-highlight">')
                    .replace(/\]\]/g, '</span>')
            }

            return `
                <div class="diff-block">
                    <div class="diff-column vendor">
                        <div class="diff-label">Original</div>
                        <div class="diff-text">${escapeAndHighlight(edit.vendor)}</div>
                    </div>
                    <div class="diff-column advisor">
                        <div class="diff-label">Modified</div>
                        <div class="diff-text">${escapeAndHighlight(edit.advisor)}</div>
                    </div>
                </div>`
        },

        /**
         * Show the differences dialog
         */
        showDifferencesDialog(differences, trigger) {
            const dialog = createElement("dialog", {
                id: "differences-dialog",
                html: `
                    <div class="diff-dialog-header">
                        <h3>Content Differences</h3>
                        <button class="diff-dialog-close" title="Close">&times;</button>
                    </div>
                    <div class="diff-dialog-content">${differences}</div>
                `
            })

            document.body.appendChild(dialog)
            dialog.show()

            // Setup close handlers
            const closeBtn = dialog.querySelector(".diff-dialog-close")
            const handleClose = () => {
                dialog.close()
                dialog.remove()
                document.removeEventListener("click", handleClickOutside)
                document.removeEventListener("keydown", handleEscape)
            }

            closeBtn.addEventListener("click", handleClose)

            const handleClickOutside = (e) => {
                if (!dialog.contains(e.target)) {
                    handleClose()
                }
            }

            // Setup escape key handler
            const handleEscape = (e) => {
                if (e.key === "Escape") {
                    handleClose()
                }
            }
            
            document.addEventListener("keydown", handleEscape)

            setTimeout(() => {
                document.addEventListener("click", handleClickOutside)
            }, 0)
        },

        /**
         * Escape HTML characters for safe display
         */
        escapeHTML(str) {
            return (str || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")
        },

        /**
         * Check if the current review item is content-related
         * Returns an object with {is_post, is_custom, current_item, edits, matched_article{source, title, html, title_matches, html_matches, id_matches}}
         */
        async checkIfContent(revisionId) {
            let broker_content = null
            
            try {
                // Check if the current item is a post or not
                const current_item = await fetch(`${baseUrl}/api/revisions/${revisionId}`)
                const item_data = await current_item.json()
                
                if (item_data.location !== "post") {
                    return { is_post: false }
                }
            
                // Add spinner button
                document.querySelector(".floating-review-item.open-differences")?.remove() // Remove if already exists
                document.querySelector(".floating-review-item-wrapper")?.insertAdjacentHTML(
                    "beforeend",
                    '<button class="floating-review-item open-differences" title="Checking the file source"><i class="fas fa-spinner"></i></button>'
                )

                //Try getting the broker content
                broker_content = await this.getBrokerContent()

                // If not available, login as advisor then retry
                if (!broker_content || !broker_content.content){
                    await this.loginAsAdvisor()
                    broker_content = await this.getBrokerContent()
                }

                // Check if the current item is custom content
                const [from_siteforward, from_vendor] = await Promise.all([
                    this.getContent(item_data, broker_content),
                    this.getContent(item_data, `${baseUrl}/api/content`)
                ])
                console.log("Content Check Results:", from_siteforward, from_vendor)

                // Check the differences
                let edits = null
                let found_article = null

                // Determine which source has matches 
                if (from_siteforward.title) {
                    found_article = {
                        source: "SiteForward",
                        ...from_siteforward
                    }
                } else if (from_vendor.title) {
                    found_article = {
                        source: "Vendor",
                        ...from_vendor
                    }
                }

                if (found_article) {
                    edits = {
                        title: this.getArrayDifferences(
                            this.parseHTML(found_article.title),
                            this.parseHTML(item_data.title)
                        ),
                        content: this.getArrayDifferences(
                            this.parseHTML(found_article.html),
                            this.parseHTML(item_data.content)
                        )
                    }
                }

                return {
                    is_post: true,
                    current_item: item_data,
                    matched_article: found_article,
                    edits
                }
            } catch (error) {
                console.error("Error checking content:", error)
                this.handleContentAPIError()
                return { is_post: false }
            }
        },
        /**
         * Login as advisor to access content API
         * This gets run if the broker content is not available
         */
        async loginAsAdvisor(){
            console.log("Logging in as advisor to load content API")
            const login_url = document.querySelector(".advisor-quick-links a[target='_blank']").href
            await fetch(login_url)
            await new Promise(resolve => setTimeout(resolve, 1000))
        },
        /**
         * Get broker content from API
         */
        async getBrokerContent(){
            const response = await fetch(`${baseUrl}/api/content/broker`)
            const content_list = await response.json()
            return content_list
        },

        /**
         * Get content from API endpoint
         */
        async getContent(current_item, content_source) {
            try {
            // If content_source is a string URL, fetch the content list
            const content_list = typeof content_source === "string" 
                ? await fetch(content_source).then(res => res.json())
                : content_source

            // Validate content exists
            if (!content_list?.content) {
                throw new Error("Content not found")
            }

            // Find matches in order of preference: ID > title > HTML
            const matches = [
                { match: content_list.content.find(blog => blog._id === current_item.content_id), type: 'id_matches' },
                { match: content_list.content.find(blog => blog.title === current_item.title), type: 'title_matches' },
                { match: content_list.content.find(blog => blog.html === current_item.content || blog.html === current_item.html), type: 'html_matches' }
            ]

            const foundMatch = matches.find(m => m.match)
            if (!foundMatch) return {}

            return {
                [foundMatch.type]: true,
                title: foundMatch.match.title,
                html: foundMatch.match.html || foundMatch.match.content
            }
            } catch (error) {
            throw error
            }
        },

        /**
         * Handle content API loading errors
         */
        handleContentAPIError() {
            const button = document.querySelector(".open-differences")
            if (button) {
                button.setAttribute("title", "Error: Unable to load content API.\nPlease login as advisor to load the content API.")
                const icon = button.querySelector("i")
                icon.title = "Error: Unable to load content API.\nPlease login as advisor to load the content API."
                icon.classList.remove("fa-spinner")
                icon.classList.add("fa-exclamation-circle")
            }
        },

        /**
         * Parse HTML into an array of tags and content
         */
        parseHTML(html) {
            const regex = /(<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>)|(<p[^>]*>[\s\S]*?<\/p>)|(<li[^>]*>[\s\S]*?<\/li>)|(<img[^>]*>)|(<a[^>]*>[\s\S]*?<\/a>)|([^<>]+)/gi
            const result = []
            let match

            while ((match = regex.exec(html)) !== null) {
                if (match[0].trim()) {
                    result.push(match[0].trim())
                }
            }
            return result
        },

        /**
         * Find the first index where two strings differ
         */
        findDifferenceIndex(str1, str2) {
            for (let i = 0; i < Math.min(str1.length, str2.length); i++) {
                if (str1[i] !== str2[i]) return i
            }
            return Math.min(str1.length, str2.length)
        },

        /**
         * Compare two arrays and return differences with brackets
         */
        getArrayDifferences(arr1, arr2) {
            console.log("Comparing Arrays:", arr1, arr2)
            const differences = []
            const max_length = Math.max(arr1.length, arr2.length)
            let in_difference = false

            for (let i = 0; i < max_length; i++) {
                if (arr1[i] !== arr2[i]) {
                    if (!in_difference) {
                        const vendor_text = arr1[i] || ""
                        const advisor_text = arr2[i] || ""
                        const diff_index = this.findDifferenceIndex(vendor_text, advisor_text)

                        differences.push({
                            vendor: vendor_text.slice(0, diff_index) + "[[" + vendor_text.slice(diff_index) + "]]",
                            advisor: advisor_text.slice(0, diff_index) + "[[" + advisor_text.slice(diff_index) + "]]"
                        })

                        in_difference = true
                    }
                } else {
                    in_difference = false
                }
            }
            return differences
        }
    }
}

// ============================================================================
// Revisions Module
// ============================================================================
const Revisions = {
    init(){
        this.checkEmailInURL()
        this.adjustItemsPerPage()
    },
    checkEmailInURL(){
        const url_params = new URLSearchParams(window.location.search)
        let email = url_params.get("email")

        if (email) {
            // If an email was provided, force a search of the revisions table
            var prefixs = ["siteforwardprogram+", "digitaladvisorprogram+"]
            prefixs.forEach((prefix) => {
                if (email.indexOf(prefix) == 0) email = email.substr(prefix.length, email.length)
            })

            // Wait 2 seconds after the page loads to ensure the revisions load
            setTimeout(() => {
                // Search the table, and re-drawn it
                $("#revisions-list").DataTable().search(email).draw()
            }, 2000)
        }
    },/**
     * Function to adjust the number of items displayed per page.
     */
    adjustItemsPerPage() {
        setTimeout(() => {
            const select = document.querySelector("#revisions-list_length select")
            ;["200", "500", "999999"].forEach((val) => {
                select.appendChild(createElement("option", { value: val, html: val === "999999" ? "All" : val }))
            })
        }, 1000)
    },
}

// ============================================================================
// Content Module
// ============================================================================
const Content = {
    isBrokerBucket: false,
    async init(){

        this.isBrokerBucket = url_parts[5]?.indexOf("custom") == 0

        this.adjustItemsPerPage()
        this.setupEventListeners()
        this.updateCustomContentNav()
        this.setupSearchBar()
        if(!this.isBrokerBucket) this.hideLeadPilotContent()
        else this.addBackToVendorContentButton()
    },

    setupEventListeners(){
        // Add event listeners for content-specific actions
         $("#content-list").on(
            "draw.dt",
            debounce((e) => {
                if(!this.isBrokerBucket) this.hideLeadPilotContent()
                SearchBar.resetSearchTable()
            }, 100)
        )
    },
    /**
     * Function to adjust the number of items displayed per page.
     */
    adjustItemsPerPage() {
        setTimeout(() => {
            const select = document.querySelector("#content-list_length select, #custom-content-list_length select")
            ;["200", "500", "999999"].forEach((val) => {
                select.appendChild(createElement("option", { value: val, html: val === "999999" ? "All" : val }))
            })
        }, 1000)
    },

    addBackToVendorContentButton() {
        const add_custom_content_element = document.querySelector(".add-custom-content");
        if (add_custom_content_element) {
            const wrapper = createElement("div", {
                style: "display: flex; flex-flow: column"
            });
            
            const back_button = createElement("a", {
                href: "../content",
                class: "btn btn--action-default-outlined add-custom-content",
                style: "margin-bottom: 10px;",
                html: "Back to Vendor Content"
            });
            
            add_custom_content_element.parentNode.insertBefore(wrapper, add_custom_content_element);
            wrapper.appendChild(back_button);
            wrapper.appendChild(add_custom_content_element);
        }
    },

    updateCustomContentNav(){
        if (this.isBrokerBucket) document.querySelector(".siteforward_content_assist").parentNode.classList.add("active")
        else document.querySelector(".vendor_content_assist").parentNode.classList.add("active")
    },

    hideLeadPilotContent(){
        let hidden_lead_pilot = 0
        document.querySelectorAll("#content-list tr").forEach((row) => {
            if (row.querySelector(".content-cat").textContent == "Lead Pilot") {
                row.style.display = "none"
                hidden_lead_pilot++
            }
        })
        document.querySelector("#content-list_info").textContent += ` | Hidden Lead Pilot content: ${hidden_lead_pilot}`
    },

    /**
     * Setup the search bar for content management
     */
    setupSearchBar() {
        const search_config = {
            container: document.querySelector(".dataTables_wrapper "),
            inputId: 'search-content',
            buttonId: 'search-content-btn',
            label: 'Search Content',
            placeholder: 'Search content...',
            buttonText: 'Search',
            buttonDataCover: 'Search for Content',
            helpContent: 'Search by Name or Categories &nbsp; &nbsp; - &nbsp; &nbsp; [! = Not] &nbsp; &nbsp; [, = And] &nbsp; &nbsp; [| = Or]',
            searchFunction: this.performContentSearch.bind(this),
            hideTableFunction: () => {
                const table = document.querySelector(".dataTable ")
                if (table) table.style.display = "none"
            },
            showTableFunction: () => {
                const table = document.querySelector(".dataTable ")
                if (table) table.style.display = "block"
            }
        }

        SearchBar.init(search_config)
    },

    /**
     * Perform content search (bound to SearchBar instance)
     */
    async performContentSearch(search_term) {
        const requesting_all = search_term.indexOf("*") === 0
        const requesting_number = search_term.indexOf("#") === 0
        if (requesting_all || requesting_number) {
            search_term = search_term.substring(1)
        }

        const table = document.querySelector(".search-bar table")
        if (!table) return

        SearchBar.hideTable()


        table.innerHTML = `<thead> 
            <tr role="row">
                <th class="" tabindex="0" rowspan="1" colspan="1">#</th>
                <th class="" tabindex="0" rowspan="1" colspan="1" aria-label="">Thumbnail</th>
                <th class="" tabindex="0" rowspan="1" colspan="1" aria-label="">Title</th>
                <th class="" tabindex="0" rowspan="1" colspan="1" aria-label="">Category</th>
                <th class="" tabindex="0" rowspan="1" colspan="1" aria-label="">Created</th>
                <th class="" tabindex="0" rowspan="1" colspan="1" aria-label="">Status</th>
                <th class="" rowspan="1" colspan="1" aria-label="Actions">Actions</th>
            </tr> 
        </thead>`

        const results = this.performContentTableSearch(search_term)
        if (results.length === 0) {
            table.innerHTML += `<tr><td colspan="5">No results found - This search can only view whats on the page.<br><strong>Make sure you've changed the "Entries per page" to "All"</strong></td></tr>`
            return
        }
        
        if (requesting_number || (results.length > 100 && !requesting_all)) {
            table.innerHTML += `<tr><td colspan="5">Number of results: ${results.length}</td></tr>`
        } else {
            const tbody = document.createElement("tbody")
            results.forEach((content, i) => {
                content.prepend(createElement("td", { html: `${i + 1}.` }))
                tbody.appendChild(content)
            })
            table.appendChild(tbody)
        }
    },

    /**
     * Perform content search based on search string
     * @param {string} searchString - The search string
     * @returns {Array} - Array of matching content items
     */
    performContentTableSearch(searchString) {
        // Helper function to check if item matches a search term
        const matchesTerm = (row, search) => {
            const title = row.querySelector('.content-title')?.textContent?.toLowerCase() || ''
            const category = row.querySelector('.content-cat')?.textContent?.toLowerCase() || row.querySelector('.advisor-tags')?.textContent?.toLowerCase() || ''
            const searchLower = search.toLowerCase()

            return title.includes(searchLower) || category.includes(searchLower)
        }

        // Get all rows from content table
        const rows = Array.from(document.querySelectorAll(".dataTable tbody tr"))

        // Process each search term (split by comma for AND operations)
        return searchString
            .split(",")
            .reduce((filtered_rows, search_group) => {
                search_group = search_group.trim()

                // Process OR operations (split by |)
                return filtered_rows.filter((row) => {
                    return search_group.split("|").some((term) => {
                        term = term.trim()
                        const invert = term.startsWith("!")
                        const search_term = invert ? term.slice(1) : term
                        const matches = matchesTerm(row, search_term)
                        return invert ? !matches : matches
                    })
                })
            }, rows)
            .map((row) => row.cloneNode(true))
    }
}


/**
 * Check if the tag exists in the advisor's tags (NOT exact match)
 * @param {string} tag - The tag to check
 * @param {Object} advisor - The advisor object
 * @returns {boolean} - True if the tag exists, false otherwise
 */
function hasTag(tag, advisor) {
    if (advisor && advisor.settings && advisor.settings.broker_tags)
        return advisor
            ? advisor.settings.broker_tags.some((e) => {
                  return e.name.toLowerCase().indexOf(tag.toLowerCase()) >= 0
              })
            : false
    return false
}

/**
 * Check if status matches the advisor's current status
 * @param {string} status - The status to check
 * @param {Object} advisor - The advisor object
 * @returns {boolean} - True if status matches, false otherwise
 */
function hasStatus(status, advisor) {
    status = status.toLowerCase()
    if (advisor && advisor.display_state) {
        let advisor_status = advisor.display_state.toLowerCase()
        if (advisor.site.status === "taken_down") {
            advisor_status = "taken down"
        } else if (advisor.site.broker_reviewed && advisor.display_state === "pending_review") {
            advisor_status = "review completed"
        } else if (advisor.display_state === "pending_review") {
            advisor_status = "pending review"
        } else if (advisor.display_state === "approved") {
            advisor_status = "approved"
        } else if (advisor.display_state === "editing") {
            advisor_status = "editing"
        }
        return advisor_status.indexOf(status) >= 0
    } else return false
}

//Get the officer name from their ID
/**
 * Get the officer name from their ID
 * @param {string} id - The officer's ID
 * @returns {string|undefined} - The officer's name or "All Officers" if not found
 */
function getOfficerName(id) {
    return officer_list.find((officer) => officer._id === id)?.display_name || "All Officers"
}
