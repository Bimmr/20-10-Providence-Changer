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
    NightMode.init()
    PageTabs.init()
    Editor.init()
    Chat.init()
    Archives.init()
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
// Page Tab Module
// =============================================================================
const PageTabs = {
    /**
     * Initialize the page tabs module.
     */
    init() {
        this.previewIframe = document.getElementById("previewIframe")
        this.updatePageTab()
        this.setupObservers()
    },

    /**
     * Update the page tab based on the current iframe URL.
     */
    updatePageTab() {
        this.colorPageTab(this.previewIframe.src)
    },

    /**
     * Setup observers for dynamic content changes.
     */
    setupObservers() {
        new MutationObserver(() => this.updatePageTab()).observe(document.querySelector(".browser .title"), {
            subtree: true,
            childList: true,
        })

        this.previewIframe.addEventListener("load", () => this.updatePageTab())
    },

    /**
     * Color the page tab based on the iframe URL.
     * @param {*} frameURL
     */
    colorPageTab(frameURL) {
        const urlParts = frameURL.split("/")
        const normalizedURL =
            urlParts.length <= 4 && (!urlParts[3] || urlParts[3] === "home")
                ? ""
                : urlParts.length > 4
                ? `${urlParts[3]}/${urlParts[4]}`
                : urlParts[3]

        const activeTab = document.querySelector(".active-page-tab")
        if (activeTab) activeTab.classList.remove("active-page-tab")

        const newActiveTab = document.querySelector(`#pagesWrapper .title[data-url="${normalizedURL}"]`)
        if (newActiveTab) newActiveTab.parentElement.classList.add("active-page-tab")
    },
}

// =============================================================================
// Editor Module
// =============================================================================
const Editor = {
    /**
     * Initialize the editor module.
     */
    init() {
        if (!localStorage.getItem("IsSiteForward")) return
        this.setupEditorStop()
        this.setupEditDropdown()
    },

    /**
     * Setup global event listeners.
     */
    setupEditorStop() {
        ;["keypress", "mousedown"].forEach((event) => {
            document.addEventListener(event, () => {
                if (this.isEditing)
                    this.isEditing = false
            })
        })
    },

    /**
     * Setup the edit dropdown menu.
     */
    setupEditDropdown() {
        const editDropdown = this.createEditDropdown()
        document.querySelector(".browser-bar--right").appendChild(editDropdown)
        this.setupEventListeners(editDropdown)
    },

    /**
     * Create the edit dropdown element.
     * @returns {HTMLElement} - The created dropdown element.
     */
    createEditDropdown() {
        return createElement("div", {
            class: "tot_dropdown",
            style: { marginLeft: "0.5em" },
            html: `
        <a href="#" class="popout-preview">Mark As Edited</a>
        <div class="tot_droplist is-far-right">
          <ul>
            <li><a href="#" class="edit-nav-pages" data-size="desktop">Edit Pages</a></li>
            <li><a href="#" class="edit-nav-members" data-size="tablet">Edit Members</a></li>
            <li><a href="#" class="edit-nav-posts" data-size="mobile">Edit Posts</a></li>
            <li><a href="#" class="edit-nav-all">Edit All</a></li>
          </ul>
        </div>`,
        })
    },

    /**
     * Setup event listeners for the edit dropdown.
     * @param {HTMLElement} editDropdown - The edit dropdown element.
     */
    setupEventListeners(editDropdown) {
        const actions = {
            "edit-nav-pages": () => this.editPages(),
            "edit-nav-members": () => this.editMembers(),
            "edit-nav-posts": () => this.editPosts(),
            "edit-nav-all": () => this.editAll(),
        }

        editDropdown.addEventListener("click", async (e) => {
            const target = e.target.closest("a")
            if (!target) return
            e.preventDefault()
            const action = actions[target.className]
            if (action) await action()
        })
    },

    /**
     * Edit all sections.
     */
    async editAll() {
        await this.editPages()
        await this.editMembers()
        await this.editPosts()
    },

    /**
     * Handle overlays that appear on the side
     * Runs as: Wait for style, wait for class, perform action, wait for !class, wait for style
     * Waits for overlay to open, does an action, and then waits for it to close
     * @param {string} overlayId - The ID of the overlay element.
     * @param {Function} action - The action to perform on the overlay.
     * @param {number} timeBeforeAction - Time to wait before performing the action.
     */
    async handleSidebarOverlay(selector, action, timeBeforeAction = 0) {
        const overlay = document.querySelector(selector)
        await waitForStyleAsync(true, overlay, "display", "block")
        await waitForClassAsync(true, overlay, "ready")
        if (timeBeforeAction > 0) await new Promise((r) => setTimeout(r, timeBeforeAction))
        await action(overlay)
        await waitForClassAsync(false, document.body, "overlay-active")
        await waitForStyleAsync(true, overlay, "display", "none")
    },
    /**
     * Handle larger overlays
     * Runs as: Wait for class, perform action, wait for !class
     * Waits for overlay to open, does an action, and then waits for it to close
     * @param {string} selector - CSS selector for the overlay element.
     * @param {Function} action - The action to perform on the overlay.
     * @param {number} timeBeforeAction - Time to wait before performing the action.
     */
    async handleLargerOverlay(selector, action, timeBeforeAction = 0) {
        const overlay = document.querySelector(selector)
        await waitForClassAsync(true, overlay, "velocity-animating")
        await waitForClassAsync(false, overlay, "velocity-animating")
        if (timeBeforeAction > 0) await new Promise((r) => setTimeout(r, timeBeforeAction))
        await action(overlay)
        await waitForClassAsync(true, overlay, "velocity-animating")
        await waitForClassAsync(false, overlay, "velocity-animating")
    },

    /**
     * Edit the pages section.
     */
    async editPages() {
        this.isEditing = true
        const pagesArray = Array.from(document.querySelectorAll(".page-settings")).map((e) => e.dataset.id)

        for (const pageId of pagesArray) {
            if (!this.isEditing) break
            const page_settings = getItemById("page-settings", pageId)
            if (!page_settings) continue

            page_settings.click()
            await this.handleSidebarOverlay("#page-settings-overlay", (overlay) => {
                overlay.querySelector(".save").click()
            })
        }
    },

    /**
     * Edit the members section.
     */
    async editMembers() {
        this.isEditing = true
        const membersArray = Array.from(document.querySelectorAll(".manage-members")).map((e) => e.dataset.id)

        for (const memberId of membersArray) {
            if (!this.isEditing) break
            await this.handleMemberSection(memberId)
        }
    },

    /**
     * Handle member section interactions.
     * @param {string} memberId - The ID of the member element.
     */
    async handleMemberSection(memberId) {
        const manage_member = getItemById("manage-members", memberId)
        if (!manage_member) return

        manage_member.click()
        await this.handleSidebarOverlay("#page-settings-overlay", async () => {
            const memberIds = Array.from(document.querySelectorAll(".member")).map((e) => e.dataset.id)
            for (const memberId of memberIds) {
                if (!this.isEditing) break
                await this.editMember(memberId)
            }
            document.querySelector("#page-settings-overlay").querySelector(".cancel").click()
        })
    },

    /**
     * Edit a single member.
     * @param {string} memberId - The ID of the member element.
     */
    async editMember(memberId) {
        const member = getItemById("member", memberId)
        if (!member) return

        member.click()
        await this.handleLargerOverlay(
            ".edit-member-pane",
            (overlay) => {
                overlay.querySelector(".save").click()
            },
            2000
        )
    },

    async editPosts() {
        this.isEditing = true
        const postsArray = Array.from(document.querySelectorAll(".manage-posts")).map((e) => e.dataset.id)

        for (const pageId of postsArray) {
            if (!this.isEditing) break
            await this.handlePostSection(pageId)
        }
    },

    /**
     * Handle post section interactions.
     * @param {string} postId - The ID of the post element.
     */
    async handlePostSection(postId) {
        const manage_posts = getItemById("manage-posts", postId)
        if (!manage_posts) return

        manage_posts.click()
        await this.handleSidebarOverlay("#page-settings-overlay", async () => {
            const postIds = Array.from(document.querySelectorAll(".post")).map((e) => e.dataset.id)
            for (const postId of postIds) {
                if (!this.isEditing) break
                await this.editSinglePost(postId)
            }
            document.querySelector("#page-settings-overlay").querySelector(".cancel").click()
        })
    },

    /**
     * Edit a single post.
     * @param {string} postId - The ID of the post element.
     */
    async editSinglePost(postId) {
        const post = getItemById("post", postId)
        if (!post) return

        post.click()
        await this.handleLargerOverlay(
            ".edit-post-pane",
            (overlay) => {
                overlay.querySelector(".save").click()
            },
            2000
        )
    },
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
        document.querySelectorAll(".open-chat, #open-chat").forEach((el) => {
            el.addEventListener("click", () => this.handleChatOpen())
        })
    },

    /**
     * Handle chat open interactions.
     */
    async handleChatOpen() {
        try {
            await this.waitForChatLoad()
            await this.setupRejectionHandling()
            this.setupSavedMessageHandling()
            this.setupChatEventListeners()
        } catch (err) {
            console.error("Error initializing chat:", err)
        }
    },

    /**
     * Wait for the chat to load.
     */
    async waitForChatLoad() {
        await waitForCondition(() => {
            const chatWrapper = document.querySelector(".chat-wrapper")
            return chatWrapper && !chatWrapper.classList.contains("loading")
        })
    },

    /**
     * Setup rejection handling.
     */
    async setupRejectionHandling() {
        const advisorId = window.loggedInUser
        const rejections = await getRejections(advisorId)

        this.addRejectionCheckboxes(rejections)
        this.setupRejectionChangeListener(advisorId)
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
     * Setup rejection change listener.
     * @param {string} advisorId - The ID of the advisor.
     */
    setupRejectionChangeListener(advisorId) {
        document.addEventListener(
            "change",
            (e) => {
                if (!e.target.matches(".rejection-completed")) return
                this.handleRejectionChange(e.target, advisorId)
            },
            { capture: true }
        )
    },

    /**
     * Handle rejection change events.
     * @param {HTMLInputElement} checkbox - The checkbox element.
     * @param {string} advisorId - The ID of the advisor.
     */
    handleRejectionChange(checkbox, advisorId) {
        const rejectionWrapper = checkbox.closest(".rejection-notice")
        const rejectionId = rejectionWrapper.dataset.id
        const rejectionArray = Array.from(rejectionWrapper.querySelectorAll(".rejected-item")).map(
            (item) => item.querySelector(".rejection-completed").checked
        )

        updateRejection(advisorId, rejectionId, rejectionArray)
    },

    /**
     * Setup saved message handling.
     */
    setupSavedMessageHandling() {
        const savedMsg = localStorage.getItem("savedChatMsg")
        const chatMessage = document.querySelector("#chatMessage")

        if (savedMsg && savedMsg !== "null" && savedMsg !== "undefined") {
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
        })

        document.querySelector(".chat-tools .send-message").addEventListener("click", () => {
            localStorage.setItem("savedChatMsg", null)
            document.getElementById("loadLastMessage").style.display = "none"
        })
    },
}

// =============================================================================
// Archives Module
// =============================================================================
const Archives = {
    /**
     * Initialize the archives module.
     */
    init() {
        this.setupArchiveOpenListener()
        console.log("Archives Module Initialized")
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
        await waitForCondition(() => {
            const archivesOverlay = document.querySelector("#archives-overlay")
            return archivesOverlay && !archivesOverlay.classList.contains("loading")
        })
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
