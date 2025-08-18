let database = null

$(async function () {
    try {
        await waitForCondition(() => typeof isSiteForward === "function" && typeof DatabaseClient != "undefined", 5000)
        database = new DatabaseClient()
        console.log("Providence Changer Loaded")
        ready()
    } catch (error) {
        alert("Unable to load Extension, please reload the page to try enabling the extension again.")
    }
})

/**
 * Wait for a specific condition to be met.
 * @param {*} condition_fn - The condition function to evaluate.
 * @param {*} timeout - The maximum time to wait (in milliseconds).
 * @param {*} interval - The interval between checks (in milliseconds).
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
        const has_night_mode = localStorage.getItem("nightMode-p") === "true"
        document.body.classList.toggle("nightMode", has_night_mode)
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
     * @param {*} frame_url
     */
    colorPageTab(frame_url) {
        const url_parts = frame_url.split("/")
        const normalized_url =
            url_parts.length <= 4 && (!url_parts[3] || url_parts[3] === "home")
                ? ""
                : url_parts.length > 4
                ? `${url_parts[3]}/${url_parts[4]}`
                : url_parts[3]

        const active_tab = document.querySelector(".active-page-tab")
        if (active_tab) active_tab.classList.remove("active-page-tab")

        const new_active_tab = document.querySelector(`#pagesWrapper .title[data-url="${normalized_url}"]`)
        if (new_active_tab) new_active_tab.parentElement.classList.add("active-page-tab")
    },
}

// =============================================================================
// Editor Module
// =============================================================================
const Editor = {
    isEditing: false,
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
                if (this.isEditing) this.isEditing = false
            })
        })
    },

    /**
     * Setup the edit dropdown menu.
     */
    setupEditDropdown() {
        const edit_dropdown = this.createEditDropdown()
        document.querySelector(".browser-bar--right").appendChild(edit_dropdown)
        this.setupEventListeners(edit_dropdown)
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
     * @param {HTMLElement} edit_dropdown - The edit dropdown element.
     */
    setupEventListeners(edit_dropdown) {
        const actions = {
            "edit-nav-pages": () => this.editPages(),
            "edit-nav-members": () => this.editMembers(),
            "edit-nav-posts": () => this.editPosts(),
            "edit-nav-all": () => this.editAll(),
        }

        edit_dropdown.addEventListener("click", async (e) => {
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
     * @param {string} selector - The ID of the overlay element.
     * @param {Function} action - The action to perform on the overlay.
     * @param {number} time_before_action - Time to wait before performing the action.
     */
    async handleSidebarOverlay(selector, action, time_before_action = 0) {
        const overlay = document.querySelector(selector)
        await waitForStyleAsync(true, overlay, "display", "block")
        await waitForClassAsync(true, overlay, "ready")
        if (time_before_action > 0) await new Promise((r) => setTimeout(r, time_before_action))
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
     * @param {number} time_before_action - Time to wait before performing the action.
     */
    async handleLargerOverlay(selector, action, time_before_action = 0) {
        const overlay = document.querySelector(selector)
        await waitForClassAsync(true, overlay, "velocity-animating")
        await waitForClassAsync(false, overlay, "velocity-animating")
        if (time_before_action > 0) await new Promise((r) => setTimeout(r, time_before_action))
        await action(overlay)
        await waitForClassAsync(true, overlay, "velocity-animating")
        await waitForClassAsync(false, overlay, "velocity-animating")
    },

    /**
     * Edit the pages section.
     */
    async editPages() {
        this.isEditing = true
        const pages_array = Array.from(document.querySelectorAll(".page-settings")).map((e) => e.dataset.id)

        for (const page_id of pages_array) {
            if (!this.isEditing) break
            const page_settings = getItemById("page-settings", page_id)
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
        const members_array = Array.from(document.querySelectorAll(".manage-members")).map((e) => e.dataset.id)

        for (const member_id of members_array) {
            if (!this.isEditing) break
            await this.handleMemberSection(member_id)
        }
    },

    /**
     * Handle member section interactions.
     * @param {string} member_id - The ID of the member element.
     */
    async handleMemberSection(member_id) {
        const manage_member = getItemById("manage-members", member_id)
        if (!manage_member) return

        manage_member.click()
        await this.handleSidebarOverlay("#page-settings-overlay", async () => {
            const member_ids = Array.from(document.querySelectorAll(".member")).map((e) => e.dataset.id)
            for (const member_id of member_ids) {
                if (!this.isEditing) break
                await this.editMember(member_id)
            }
            document.querySelector("#page-settings-overlay").querySelector(".cancel").click()
        })
    },

    /**
     * Edit a single member.
     * @param {string} member_id - The ID of the member element.
     */
    async editMember(member_id) {
        const member = getItemById("member", member_id)
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
        const posts_array = Array.from(document.querySelectorAll(".manage-posts")).map((e) => e.dataset.id)

        for (const page_id of posts_array) {
            if (!this.isEditing) break
            await this.handlePostSection(page_id)
        }
    },

    /**
     * Handle post section interactions.
     * @param {string} post_id - The ID of the post element.
     */
    async handlePostSection(post_id) {
        const manage_posts = getItemById("manage-posts", post_id)
        if (!manage_posts) return

        manage_posts.click()
        await this.handleSidebarOverlay("#page-settings-overlay", async () => {
            const post_ids = Array.from(document.querySelectorAll(".post")).map((e) => e.dataset.id)
            for (const post_id of post_ids) {
                if (!this.isEditing) break
                await this.editSinglePost(post_id)
            }
            document.querySelector("#page-settings-overlay").querySelector(".cancel").click()
        })
    },

    /**
     * Edit a single post.
     * @param {string} post_id - The ID of the post element.
     */
    async editSinglePost(post_id) {
        const post = getItemById("post", post_id)
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
            this.setupSavedMessageHandling()
            this.setupChatEventListeners()
            await this.setupRejectionHandling()
        } catch (err) {
            console.error("Error initializing chat:", err)
        }
    },

    /**
     * Wait for the chat to load.
     */
    async waitForChatLoad() {
        await waitForCondition(() => {
            const chat_wrapper = document.querySelector(".chat-wrapper")
            return chat_wrapper && !chat_wrapper.classList.contains("loading")
        })
    },

    /**
     * Setup rejection handling.
     */
    async setupRejectionHandling() {
        const advisor_id = window.loggedInUser
        const rejections = await database.getRejections(advisor_id)

        this.addRejectionCheckboxes(rejections, advisor_id)
    },

    /**
     * Add rejection checkboxes to the rejection notices.
     * @param {Array} rejections - The list of rejections.
     * @param {string} advisor_id - The ID of the advisor.
     */
    addRejectionCheckboxes(rejections, advisor_id) {
        document.querySelectorAll(".rejection-notice").forEach((notice) => {
            const rejection_id = notice.dataset.id
            notice.dataset.advisorId = advisor_id
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

        if (saved_msg && saved_msg !== "null" && saved_msg !== "undefined") {
            chat_message.querySelector(".fr-wrapper").classList.remove("show-placeholder")
            chat_message.querySelector(".fr-element").innerHTML = saved_msg
        }
    },

    /**
     * Setup chat event listeners.
     */
    setupChatEventListeners() {
        const chat_message = document.querySelector("#chatMessage")

        document.querySelector(".close-chat").addEventListener("click", () => {
            localStorage.setItem("savedChatMsg", chat_message.querySelector(".fr-element").innerHTML)
        })

        document.querySelector(".chat-tools .send-message").addEventListener("click", () => {
            localStorage.setItem("savedChatMsg", null)
            document.getElementById("loadLastMessage").style.display = "none"
        })

        document.addEventListener(
                "change",
                (e) => {
                    if (!e.target.matches(".rejection-completed")) return;
                    
                    const checkbox = e.target;
                    const rejection_wrapper = checkbox.closest(".rejection-notice");
                    if (!rejection_wrapper) return;

                    const rejection_id = rejection_wrapper.dataset.id;
                    const advisor_id = rejection_wrapper.dataset.advisorId;
                    
                    if (!rejection_id || !advisor_id) {
                        console.warn("Missing rejection or advisor ID for rejection change");
                        return;
                    }

                    const rejection_array = Array.from(rejection_wrapper.querySelectorAll(".rejected-item"))
                        .map(item => item.querySelector(".rejection-completed").checked);

                    database.updateRejection(advisor_id, rejection_id, rejection_array);
                }
            );
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
            const archives_overlay = document.querySelector("#archives-overlay")
            return archives_overlay && !archives_overlay.classList.contains("loading")
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
