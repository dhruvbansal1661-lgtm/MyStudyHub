/* =========================================================
   MY STUDY HUB
   MAIN JAVASCRIPT
========================================================= */


/* =========================================================
   GLOBAL DATA
========================================================= */

let resources = [];

let favorites =
    JSON.parse(
        localStorage.getItem(
            "myStudyHubFavorites"
        )
    ) || [];

let tasks =
    JSON.parse(
        localStorage.getItem(
            "myStudyHubTasks"
        )
    ) || [];

let notes =
    JSON.parse(
        localStorage.getItem(
            "myStudyHubNotes"
        )
    ) || [];

let recent =
    JSON.parse(
        localStorage.getItem(
            "myStudyHubRecent"
        )
    ) || [];

let timerInterval = null;

let timerSeconds = 25 * 60;

let timerRunning = false;

let selectedNoteId = null;


/* =========================================================
   HELPERS
========================================================= */

function $(id) {

    return document.getElementById(id);

}


function save(key, value) {

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );

}


function escapeHTML(value) {

    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


function showToast(
    message,
    icon = "✓"
) {

    const toast = $("toast");

    if (!toast) return;

    $("toastIcon").textContent = icon;

    $("toastMessage").textContent =
        message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2200);

}


/* =========================================================
   NAVIGATION
========================================================= */

function showSection(sectionId) {

    document
        .querySelectorAll(".page-section")
        .forEach(section => {

            section.classList.remove(
                "active-section"
            );

        });


    const section =
        $(sectionId);

    if (section) {

        section.classList.add(
            "active-section"
        );

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

            if (
                button.dataset.section ===
                sectionId
            ) {

                button.classList.add(
                    "active"
                );

            }

        });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* Sidebar */

document
    .querySelectorAll(
        ".nav-item[data-section]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showSection(
                    button.dataset.section
                );

            }
        );

    });


/* Buttons that navigate */

document
    .querySelectorAll(
        "[data-go]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showSection(
                    button.dataset.go
                );

            }
        );

    });


/* =========================================================
   MOBILE MENU
========================================================= */

const mobileMenuButton =
    $("mobileMenuButton");

if (mobileMenuButton) {

    mobileMenuButton.addEventListener(
        "click",
        () => {

            document
                .querySelector(".sidebar")
                .classList.toggle(
                    "mobile-open"
                );

        }
    );

}


/* =========================================================
   DATE
========================================================= */

function updateDate() {

    const today =
        new Date();

    const formatted =
        today.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "short"
            }
        );

    if ($("todayDate")) {

        $("todayDate").textContent =
            formatted;

    }

}

updateDate();


/* =========================================================
   LOAD RESOURCES
========================================================= */

async function loadResources() {

    try {

        const response =
            await fetch(
                "/api/resources"
            );


        if (!response.ok) {

            throw new Error(
                "Resource API failed"
            );

        }


        resources =
            await response.json();


        resources =
            resources.map(
                resource => ({

                    ...resource,

                    id:
                        createResourceId(
                            resource
                        )

                })
            );


        updateResourceStats();

        filterResources();

        setupSubjects();

    }

    catch (error) {

        console.error(error);

        if ($("results")) {

            $("results").innerHTML = `

                <div class="loading">

                    <div style="
                        font-size:40px;
                        margin-bottom:10px;
                    ">
                        ⚠️
                    </div>

                    <h3>
                        Could not load resources
                    </h3>

                    <p>
                        Make sure Flask is running
                        and refresh the page.
                    </p>

                </div>

            `;

        }

    }

}


function createResourceId(resource) {

    return [

        resource.source,

        resource.class,

        resource.subject,

        resource.title,

        resource.topic

    ]
        .join("|")
        .toLowerCase();

}


/* =========================================================
   RESOURCE STATS
========================================================= */

function updateResourceStats() {

    if ($("resourceCount")) {

        $("resourceCount").textContent =
            resources.length;

    }


    if ($("favoriteCount")) {

        $("favoriteCount").textContent =
            favorites.length;

    }

}


/* =========================================================
   RESOURCE ICON
========================================================= */

function getIcon(resource) {

    const subject =
        String(resource.subject)
            .toLowerCase();

    const topic =
        String(resource.topic)
            .toLowerCase();


    if (subject.includes("physics"))
        return "⚛️";

    if (subject.includes("biology"))
        return "🧬";

    if (subject.includes("science"))
        return "🔬";

    if (subject.includes("math"))
        return "📐";

    if (subject.includes("english"))
        return "📖";

    if (subject.includes("computer"))
        return "💻";

    if (topic.includes("motion"))
        return "🏃";

    if (topic.includes("force"))
        return "💥";

    if (topic.includes("gravitation"))
        return "🌍";

    if (topic.includes("sound"))
        return "🔊";

    if (topic.includes("energy"))
        return "⚡";

    return "📚";

}


/* =========================================================
   DISPLAY RESOURCES
========================================================= */

function displayResources(data) {

    const results =
        $("results");

    if (!results) return;


    results.innerHTML = "";


    if ($("resultCount")) {

        $("resultCount").textContent =
            `${data.length} resources`;

    }


    if (data.length === 0) {

        results.innerHTML = `

            <div class="loading">

                <div style="
                    font-size:40px;
                    margin-bottom:10px;
                ">
                    🔎
                </div>

                <h3>
                    No resources found
                </h3>

                <p>
                    Try another search or
                    change your filters.
                </p>

            </div>

        `;

        return;

    }


    data.forEach(resource => {

        const card =
            document.createElement(
                "div"
            );


        card.className = "card";


        const isFavorite =
            favorites.includes(
                resource.id
            );


        card.innerHTML = `

            <div class="card-top">

                <div class="card-icon">
                    ${getIcon(resource)}
                </div>

                <button
                    class="
                        favorite-button
                        ${isFavorite ? "saved" : ""}
                    "
                    data-id="${escapeHTML(
                        resource.id
                    )}"
                >
                    ${isFavorite ? "★" : "☆"}
                </button>

            </div>


            <span class="badge">
                ${escapeHTML(resource.source)}
            </span>


            <h3>
                ${escapeHTML(resource.title)}
            </h3>


            <p>
                📚
                <strong>Class:</strong>
                ${escapeHTML(
                    resource.class
                )}
            </p>


            <p>
                🧠
                <strong>Subject:</strong>
                ${escapeHTML(
                    resource.subject
                )}
            </p>


            <p>
                📌
                <strong>Topic:</strong>
                ${escapeHTML(
                    resource.topic
                )}
            </p>


            <p>
                📄
                <strong>Type:</strong>
                ${escapeHTML(
                    resource.type
                )}
            </p>


            <a
                class="resource-link"
                href="${escapeHTML(
                    resource.url
                )}"
                target="_blank"
                rel="noopener noreferrer"
                data-id="${escapeHTML(
                    resource.id
                )}"
            >
                Open Resource →
            </a>

        `;


        results.appendChild(card);

    });


    setupFavoriteButtons();

    setupRecentLinks();

}


/* =========================================================
   SEARCH
========================================================= */

function filterResources() {

    const search =
        $("search");

    const classFilter =
        $("classFilter");

    const sourceFilter =
        $("sourceFilter");

    const sortFilter =
        $("sortFilter");


    const searchText =
        search
            ? search.value
                .toLowerCase()
                .trim()
            : "";


    const selectedClass =
        classFilter
            ? classFilter.value
            : "all";


    const selectedSource =
        sourceFilter
            ? sourceFilter.value
            : "all";


    const sort =
        sortFilter
            ? sortFilter.value
            : "default";


    let filtered =
        resources.filter(
            resource => {

                const text = [

                    resource.title,

                    resource.subject,

                    resource.topic,

                    resource.type,

                    resource.source

                ]
                    .join(" ")
                    .toLowerCase();


                return (

                    text.includes(
                        searchText
                    )

                    &&

                    (
                        selectedClass ===
                        "all"

                        ||

                        String(
                            resource.class
                        ) ===
                        selectedClass
                    )

                    &&

                    (
                        selectedSource ===
                        "all"

                        ||

                        resource.source ===
                        selectedSource
                    )

                );

            }
        );


    if (sort === "title") {

        filtered.sort(
            (a,b) =>
                a.title.localeCompare(
                    b.title
                )
        );

    }


    if (sort === "subject") {

        filtered.sort(
            (a,b) =>
                a.subject.localeCompare(
                    b.subject
                )
        );

    }


    if (sort === "source") {

        filtered.sort(
            (a,b) =>
                a.source.localeCompare(
                    b.source
                )
        );

    }


    if (sort === "class") {

        filtered.sort(
            (a,b) =>
                Number(a.class) -
                Number(b.class)
        );

    }


    displayResources(filtered);

}


/* Resource controls */

[
    "search",
    "classFilter",
    "sourceFilter",
    "sortFilter"
]
.forEach(id => {

    const element = $(id);

    if (element) {

        element.addEventListener(
            "input",
            filterResources
        );

        element.addEventListener(
            "change",
            filterResources
        );

    }

});


/* =========================================================
   GLOBAL SEARCH
========================================================= */

const globalSearch =
    $("globalSearch");


if (globalSearch) {

    globalSearch.addEventListener(
        "input",
        () => {

            showSection(
                "resources"
            );


            if ($("search")) {

                $("search").value =
                    globalSearch.value;

            }


            filterResources();

        }
    );

}


/* "/" shortcut */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "/" &&
            document.activeElement.tagName !==
            "INPUT" &&
            document.activeElement.tagName !==
            "TEXTAREA"
        ) {

            event.preventDefault();

            if (globalSearch) {

                globalSearch.focus();

            }

        }

    }
);


/* Clear filters */

const clearSearch =
    $("clearSearch");


if (clearSearch) {

    clearSearch.addEventListener(
        "click",
        () => {

            if ($("search"))
                $("search").value = "";

            if ($("globalSearch"))
                $("globalSearch").value = "";

            if ($("classFilter"))
                $("classFilter").value = "all";

            if ($("sourceFilter"))
                $("sourceFilter").value = "all";

            if ($("sortFilter"))
                $("sortFilter").value = "default";

            filterResources();

        }
    );

}


/* =========================================================
   FAVORITES
========================================================= */

function setupFavoriteButtons() {

    document
        .querySelectorAll(
            ".favorite-button"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    toggleFavorite(
                        button.dataset.id,
                        button
                    );

                }
            );

        });

}


function toggleFavorite(
    id,
    button
) {

    if (
        favorites.includes(id)
    ) {

        favorites =
            favorites.filter(
                item =>
                    item !== id
            );

        button.textContent = "☆";

        button.classList.remove(
            "saved"
        );

        showToast(
            "Removed from bookmarks",
            "☆"
        );

    }

    else {

        favorites.push(id);

        button.textContent = "★";

        button.classList.add(
            "saved"
        );

        showToast(
            "Resource bookmarked",
            "★"
        );

    }


    save(
        "myStudyHubFavorites",
        favorites
    );


    updateResourceStats();

}


/* =========================================================
   RECENT RESOURCES
========================================================= */

function setupRecentLinks() {

    document
        .querySelectorAll(
            ".resource-link"
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                () => {

                    const id =
                        link.dataset.id;


                    recent =
                        recent.filter(
                            item =>
                                item !== id
                        );


                    recent.unshift(id);


                    recent =
                        recent.slice(
                            0,
                            5
                        );


                    save(
                        "myStudyHubRecent",
                        recent
                    );

                }
            );

        });

}


/* =========================================================
   SUBJECT FILTERS
========================================================= */

function setupSubjects() {

    document
        .querySelectorAll(
            ".subject-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    showSection(
                        "resources"
                    );


                    if ($("search")) {

                        $("search").value =
                            card.dataset.subject;

                    }


                    filterResources();

                }
            );

        });

}


/* =========================================================
   DARK MODE
========================================================= */

const themeButton =
    $("themeButton");


function updateThemeButton() {

    if (!themeButton) return;


    const dark =
        document.body.classList.contains(
            "dark"
        );


    themeButton.innerHTML =
        dark
            ? "☀️ <span>Light Mode</span>"
            : "🌙 <span>Dark Mode</span>";

}


function loadTheme() {

    const theme =
        localStorage.getItem(
            "myStudyHubTheme"
        );


    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

    }


    updateThemeButton();

}


if (themeButton) {

    themeButton.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );


            const dark =
                document.body.classList.contains(
                    "dark"
                );


            localStorage.setItem(
                "myStudyHubTheme",
                dark
                    ? "dark"
                    : "light"
            );


            updateThemeButton();

        }
    );

}


loadTheme();


/* =========================================================
   TASK PLANNER
========================================================= */

function renderTasks() {

    const list =
        $("taskList");

    if (!list) return;


    list.innerHTML = "";


    if (tasks.length === 0) {

        list.innerHTML = `

            <div class="loading"
                 style="padding:25px">

                No tasks yet.
                Add your first task below.

            </div>

        `;

        updateTaskProgress();

        return;

    }


    tasks.forEach(task => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "task" +
            (
                task.completed
                    ? " completed"
                    : ""
            );


        item.innerHTML = `

            <input
                type="checkbox"
                ${task.completed ? "checked" : ""}
            >

            <span>
                ${escapeHTML(task.text)}
            </span>

            <button
                class="task-delete"
            >
                ×
            </button>

        `;


        item
            .querySelector(
                "input"
            )
            .addEventListener(
                "change",
                () => {

                    task.completed =
                        !task.completed;

                    saveTasks();

                    renderTasks();

                }
            );


        item
            .querySelector(
                ".task-delete"
            )
            .addEventListener(
                "click",
                () => {

                    tasks =
                        tasks.filter(
                            item =>
                                item.id !==
                                task.id
                        );

                    saveTasks();

                    renderTasks();

                }
            );


        list.appendChild(item);

    });


    updateTaskProgress();

}


function saveTasks() {

    save(
        "myStudyHubTasks",
        tasks
    );

}


function updateTaskProgress() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const percent =
        total === 0
            ? 0
            : Math.round(
                completed /
                total *
                100
            );


    if ($("taskProgress"))
        $("taskProgress")
            .textContent =
            `${percent}%`;


    if ($("taskProgressBar"))
        $("taskProgressBar")
            .style.width =
            `${percent}%`;


    if ($("bigCompletion"))
        $("bigCompletion")
            .textContent =
            `${percent}%`;


    if ($("bigProgressBar"))
        $("bigProgressBar")
            .style.width =
            `${percent}%`;

}


const taskForm =
    $("taskForm");


if (taskForm) {

    taskForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const input =
                $("taskInput");


            const text =
                input.value.trim();


            if (!text) return;


            tasks.push({

                id:
                    Date.now(),

                text,

                completed:
                    false

            });


            saveTasks();

            input.value = "";

            renderTasks();

            showToast(
                "Task added",
                "✓"
            );

        }
    );

}


renderTasks();


/* =========================================================
   STUDY TIPS
========================================================= */

const tips = [

    "Break difficult topics into smaller sections.",

    "Test yourself instead of only rereading.",

    "Study difficult subjects when your concentration is highest.",

    "Use active recall after finishing a chapter.",

    "Take short breaks during long study sessions.",

    "Explain a concept in your own words.",

    "Practice questions after learning the theory.",

    "Review older material regularly."

];


const newTip =
    $("newTip");


if (newTip) {

    newTip.addEventListener(
        "click",
        () => {

            const tip =
                tips[
                    Math.floor(
                        Math.random() *
                        tips.length
                    )
                ];


            $("studyTip").textContent =
                tip;

        }
    );

}


/* =========================================================
   NOTES
========================================================= */

function createNote() {

    const note = {

        id: Date.now(),

        title: "New Note",

        content: "",

        updated:
            new Date().toLocaleDateString()

    };


    notes.unshift(note);

    save(
        "myStudyHubNotes",
        notes
    );


    selectedNoteId =
        note.id;


    renderNotes();

    loadNote(note.id);

}


function renderNotes() {

    const list =
        $("notesList");

    if (!list) return;


    list.innerHTML = "";


    if (notes.length === 0) {

        list.innerHTML = `

            <p style="
                color:var(--muted);
                font-size:12px;
                padding:10px;
            ">
                No notes yet.
            </p>

        `;

        return;

    }


    notes.forEach(note => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "note-item" +
            (
                note.id ===
                selectedNoteId
                    ? " active"
                    : ""
            );


        item.innerHTML = `

            <strong>
                ${escapeHTML(note.title)}
            </strong>

            <small>
                ${escapeHTML(note.updated)}
            </small>

        `;


        item.addEventListener(
            "click",
            () => {

                loadNote(
                    note.id
                );

            }
        );


        list.appendChild(item);

    });

}


function loadNote(id) {

    const note =
        notes.find(
            item =>
                item.id === id
        );


    if (!note) return;


    selectedNoteId = id;


    if ($("noteTitle"))
        $("noteTitle").value =
            note.title;


    if ($("noteContent"))
        $("noteContent").value =
            note.content;


    if ($("noteSaved"))
        $("noteSaved").textContent =
            "Saved";


    renderNotes();

}


function saveCurrentNote() {

    if (!selectedNoteId) {

        createNote();

        return;

    }


    const note =
        notes.find(
            item =>
                item.id ===
                selectedNoteId
        );


    if (!note) return;


    note.title =
        $("noteTitle").value.trim()
        ||
        "Untitled Note";


    note.content =
        $("noteContent").value;


    note.updated =
        new Date().toLocaleDateString();


    save(
        "myStudyHubNotes",
        notes
    );


    renderNotes();


    if ($("noteSaved"))
        $("noteSaved").textContent =
            "Saved just now";


    showToast(
        "Note saved",
        "📝"
    );

}


if ($("newNoteButton")) {

    $("newNoteButton")
        .addEventListener(
            "click",
            createNote
        );

}


if ($("saveNote")) {

    $("saveNote")
        .addEventListener(
            "click",
            saveCurrentNote
        );

}


renderNotes();


/* =========================================================
   TIMER
========================================================= */

function updateTimerDisplay() {

    const minutes =
        Math.floor(
            timerSeconds / 60
        );


    const seconds =
        timerSeconds % 60;


    if ($("timerDisplay")) {

        $("timerDisplay")
            .textContent =
            String(minutes)
                .padStart(2,"0")
            +
            ":"
            +
            String(seconds)
                .padStart(2,"0");

    }

}


function startTimer() {

    if (timerRunning) return;


    timerRunning = true;


    timerInterval =
        setInterval(
            () => {

                if (
                    timerSeconds <= 0
                ) {

                    clearInterval(
                        timerInterval
                    );


                    timerRunning =
                        false;


                    showToast(
                        "Focus session complete!",
                        "🎉"
                    );


                    addFocusTime();

                    return;

                }


                timerSeconds--;

                updateTimerDisplay();

            },
            1000
        );

}


function pauseTimer() {

    clearInterval(
        timerInterval
    );

    timerRunning = false;

}


function resetTimer() {

    pauseTimer();

    timerSeconds =
        25 * 60;

    updateTimerDisplay();

}


if ($("startTimer")) {

    $("startTimer")
        .addEventListener(
            "click",
            startTimer
        );

}


if ($("pauseTimer")) {

    $("pauseTimer")
        .addEventListener(
            "click",
            pauseTimer
        );

}


if ($("resetTimer")) {

    $("resetTimer")
        .addEventListener(
            "click",
            resetTimer
        );

}


/* Timer presets */

document
    .querySelectorAll(
        ".timer-preset"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".timer-preset"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                button.classList.add(
                    "active"
                );


                const minutes =
                    Number(
                        button.dataset.minutes
                    );


                timerSeconds =
                    minutes * 60;


                updateTimerDisplay();

                pauseTimer();

            }
        );

    });


function addFocusTime() {

    const current =
        Number(
            localStorage.getItem(
                "myStudyHubFocusMinutes"
            )
        ) || 0;


    localStorage.setItem(
        "myStudyHubFocusMinutes",
        current + 25
    );


    updateFocusDisplay();

}


function updateFocusDisplay() {

    const minutes =
        Number(
            localStorage.getItem(
                "myStudyHubFocusMinutes"
            )
        ) || 0;


    if ($("focusMinutes")) {

        $("focusMinutes")
            .textContent =
            `${minutes} min`;

    }

}


updateTimerDisplay();

updateFocusDisplay();


/* =========================================================
   ABOUT MODAL
========================================================= */

const modal =
    $("modalOverlay");


function openModal() {

    if (modal)
        modal.classList.add(
            "show"
        );

}


function closeModal() {

    if (modal)
        modal.classList.remove(
            "show"
        );

}


if ($("aboutButton")) {

    $("aboutButton")
        .addEventListener(
            "click",
            openModal
        );

}


if ($("closeModal")) {

    $("closeModal")
        .addEventListener(
            "click",
            closeModal
        );

}


if ($("modalOkay")) {

    $("modalOkay")
        .addEventListener(
            "click",
            closeModal
        );

}


if (modal) {

    modal.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modal
            ) {

                closeModal();

            }

        }
    );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

if ($("notificationButton")) {

    $("notificationButton")
        .addEventListener(
            "click",
            () => {

                showToast(
                    "You're all caught up!",
                    "🔔"
                );

            }
        );

}


/* =========================================================
   INITIALIZE
========================================================= */

loadResources();