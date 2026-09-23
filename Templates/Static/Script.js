let resources = [];


// ========================================
// LOAD RESOURCES
// ========================================

async function loadResources() {

    try {

        const response = await fetch("/api/resources");

        if (!response.ok) {
            throw new Error("Could not load resources");
        }

        resources = await response.json();

        // Show total resource count
        document.getElementById("resourceCount").textContent =
            resources.length;

        filterResources();

    } catch (error) {

        console.error("Resource loading error:", error);

        document.getElementById("results").innerHTML = `
            <div class="loading">
                ❌ Could not load resources.
                <br><br>
                Please refresh the page.
            </div>
        `;
    }
}


// ========================================
// DISPLAY RESOURCES
// ========================================

function displayResources(data) {

    const results = document.getElementById("results");

    results.innerHTML = "";

    // Update result counter
    document.getElementById("resultCount").textContent =
        `${data.length} resources`;


    // No results
    if (data.length === 0) {

        results.innerHTML = `
            <div class="loading">

                <div style="font-size: 35px;">
                    🔎
                </div>

                <h3>No resources found</h3>

                <p>
                    Try another search or change your filters.
                </p>

            </div>
        `;

        return;
    }


    // Create cards
    data.forEach((resource, index) => {

        const card = document.createElement("div");

        card.className = "card";


        // ========================================
        // CHOOSE ICON
        // ========================================

        let icon = "📚";

        const subject =
            resource.subject.toLowerCase();

        const topic =
            resource.topic.toLowerCase();


        if (subject.includes("physics")) {
            icon = "⚛️";
        }

        else if (subject.includes("science")) {
            icon = "🔬";
        }

        else if (subject.includes("math")) {
            icon = "📐";
        }

        else if (subject.includes("english")) {
            icon = "📖";
        }

        else if (topic.includes("motion")) {
            icon = "🏃";
        }

        else if (topic.includes("force")) {
            icon = "💥";
        }

        else if (topic.includes("gravitation")) {
            icon = "🌍";
        }

        else if (topic.includes("sound")) {
            icon = "🔊";
        }


        // ========================================
        // CARD HTML
        // ========================================

        card.innerHTML = `

            <div class="card-top">

                <div class="card-icon">
                    ${icon}
                </div>

                <button
                    class="favorite-button"
                    data-index="${index}"
                    title="Bookmark resource"
                >
                    ☆
                </button>

            </div>


            <span class="badge">
                ${resource.source}
            </span>


            <h3>
                ${resource.title}
            </h3>


            <p>
                📚
                <strong>Class:</strong>
                ${resource.class}
            </p>


            <p>
                🧠
                <strong>Subject:</strong>
                ${resource.subject}
            </p>


            <p>
                📌
                <strong>Topic:</strong>
                ${resource.topic}
            </p>


            <p>
                📄
                <strong>Type:</strong>
                ${resource.type}
            </p>


            <a
                href="${resource.url}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Open Resource →
            </a>

        `;


        results.appendChild(card);

    });


    setupFavoriteButtons();

}


// ========================================
// SEARCH + FILTER
// ========================================

function filterResources() {

    const searchElement =
        document.getElementById("search");

    const classElement =
        document.getElementById("classFilter");

    const sourceElement =
        document.getElementById("sourceFilter");


    const searchText =
        searchElement.value
            .toLowerCase()
            .trim();


    const selectedClass =
        classElement.value;


    const selectedSource =
        sourceElement.value;


    const filtered = resources.filter(resource => {


        const title =
            resource.title.toLowerCase();

        const subject =
            resource.subject.toLowerCase();

        const topic =
            resource.topic.toLowerCase();

        const type =
            resource.type.toLowerCase();


        // Search
        const matchesSearch =
            title.includes(searchText) ||
            subject.includes(searchText) ||
            topic.includes(searchText) ||
            type.includes(searchText);


        // Class
        const matchesClass =
            selectedClass === "all" ||
            String(resource.class) === selectedClass;


        // Source
        const matchesSource =
            selectedSource === "all" ||
            resource.source === selectedSource;


        return (
            matchesSearch &&
            matchesClass &&
            matchesSource
        );

    });


    displayResources(filtered);
}


// ========================================
// SEARCH LISTENER
// ========================================

document
    .getElementById("search")
    .addEventListener(
        "input",
        filterResources
    );


// ========================================
// CLASS FILTER
// ========================================

document
    .getElementById("classFilter")
    .addEventListener(
        "change",
        filterResources
    );


// ========================================
// SOURCE FILTER
// ========================================

document
    .getElementById("sourceFilter")
    .addEventListener(
        "change",
        filterResources
    );


// ========================================
// DARK MODE
// ========================================

const themeButton =
    document.getElementById("themeButton");


themeButton.addEventListener(
    "click",
    () => {

        document.body.classList.toggle("dark");


        // Change button text
        if (
            document.body.classList.contains("dark")
        ) {

            themeButton.innerHTML =
                "☀️ <span>Light Mode</span>";

        } else {

            themeButton.innerHTML =
                "🌙 <span>Dark Mode</span>";

        }

    }
);


// ========================================
// FAVORITES / BOOKMARKS
// ========================================

let favorites =
    JSON.parse(
        localStorage.getItem("myStudyHubFavorites")
    ) || [];



function setupFavoriteButtons() {

    const buttons =
        document.querySelectorAll(
            ".favorite-button"
        );


    buttons.forEach(button => {

        const index =
            Number(button.dataset.index);


        // Check if already bookmarked
        if (favorites.includes(index)) {

            button.textContent = "★";

            button.classList.add("saved");

        }


        button.addEventListener(
            "click",
            () => {

                toggleFavorite(
                    index,
                    button
                );

            }
        );

    });

}



function toggleFavorite(
    index,
    button
) {

    if (favorites.includes(index)) {

        favorites =
            favorites.filter(
                item => item !== index
            );

        button.textContent = "☆";

        button.classList.remove("saved");

    }

    else {

        favorites.push(index);

        button.textContent = "★";

        button.classList.add("saved");

    }


    localStorage.setItem(
        "myStudyHubFavorites",
        JSON.stringify(favorites)
    );

}


// ========================================
// START APPLICATION
// ========================================

loadResources();