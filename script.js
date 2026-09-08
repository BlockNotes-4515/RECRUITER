/* =========================================================
   RECRUITER
   Company Management System
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "recruiter_companies";


/* =========================================================
   DEFAULT DATA
========================================================= */

const defaultCompanies = [{
        id: generateId(),
        name: "Accenture",
        role: "Software Engineer Intern",
        location: "Gurugram, India",
        salary: "16.1 LPA",
        status: "applied",
        date: "2026-08-22",
        applications: 1,
        interviews: 0
    },

    {
        id: generateId(),
        name: "Amazon",
        role: "SDE Intern",
        location: "Bangalore, India",
        salary: "18 LPA",
        status: "active",
        date: "2026-08-25",
        applications: 1,
        interviews: 0
    },

    {
        id: generateId(),
        name: "IBM",
        role: "Software Developer",
        location: "Noida, India",
        salary: "12 LPA",
        status: "interview",
        date: "2026-08-28",
        applications: 1,
        interviews: 1
    },

    {
        id: generateId(),
        name: "Microsoft",
        role: "Software Engineer",
        location: "Hyderabad, India",
        salary: "24 LPA",
        status: "active",
        date: "2026-08-30",
        applications: 1,
        interviews: 0
    }
];


/* =========================================================
   LOAD DATA
========================================================= */

let companies = loadCompanies();


function loadCompanies() {

    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {

        try {

            return JSON.parse(stored);

        } catch (error) {

            console.error(
                "Could not read stored companies.",
                error
            );

        }

    }

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultCompanies)
    );

    return defaultCompanies;
}


/* =========================================================
   SAVE DATA
========================================================= */

function saveToStorage() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(companies)
    );

}


/* =========================================================
   ID GENERATOR
========================================================= */

function generateId() {

    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8)
    );

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderCompanies();

        updateStats();

        updateAnalytics();

    }
);


/* =========================================================
   RENDER COMPANIES
========================================================= */

function renderCompanies() {

    const tbody =
        document.getElementById(
            "companyTableBody"
        );

    const emptyState =
        document.getElementById(
            "emptyState"
        );

    const search =
        document.getElementById(
            "searchInput"
        ).value
        .trim()
        .toLowerCase();

    const status =
        document.getElementById(
            "statusFilter"
        ).value;

    const sort =
        document.getElementById(
            "sortFilter"
        ).value;


    let filtered =
        companies.filter(
            company => {

                const matchesSearch =
                    company.name
                    .toLowerCase()
                    .includes(search) ||

                    company.role
                    .toLowerCase()
                    .includes(search) ||

                    company.location
                    .toLowerCase()
                    .includes(search);


                const matchesStatus =
                    status === "all" ||
                    company.status === status;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    /* =====================================================
       SORT
    ===================================================== */

    if (sort === "name") {

        filtered.sort(
            (a, b) =>
            a.name.localeCompare(b.name)
        );

    } else if (sort === "recent") {

        filtered.sort(
            (a, b) =>
            new Date(b.date) -
            new Date(a.date)
        );

    } else if (sort === "salary") {

        filtered.sort(
            (a, b) =>
            extractSalary(b.salary) -
            extractSalary(a.salary)
        );

    }


    tbody.innerHTML = "";


    if (filtered.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    filtered.forEach(
        company => {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    <div class="company-name">

                        <div class="company-logo">
                            ${getInitials(company.name)}
                        </div>

                        <span>
                            ${escapeHTML(company.name)}
                        </span>

                    </div>
                </td>


                <td>
                    ${escapeHTML(company.role)}
                </td>


                <td>
                    ${escapeHTML(company.location || "—")}
                </td>


                <td>
                    ${escapeHTML(company.salary || "—")}
                </td>


                <td>
                    <span class="status ${company.status}">
                        ${formatStatus(company.status)}
                    </span>
                </td>


                <td>
                    ${formatDate(company.date)}
                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="icon-btn"
                            title="Edit"
                            onclick="editCompany('${company.id}')"
                        >
                            ✎
                        </button>

                        <button
                            class="icon-btn delete"
                            title="Delete"
                            onclick="deleteCompany('${company.id}')"
                        >
                            ×
                        </button>

                    </div>

                </td>

            `;


            tbody.appendChild(row);

        }
    );

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(name) {

    return name
        .split(" ")
        .slice(0, 2)
        .map(
            word =>
            word.charAt(0).toUpperCase()
        )
        .join("");

}


/* =========================================================
   STATUS FORMAT
========================================================= */

function formatStatus(status) {

    const labels = {

        active: "Active",

        applied: "Applied",

        interview: "Interview",

        selected: "Selected",

        rejected: "Rejected"

    };

    return labels[status] || status;

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date) {

    if (!date) {
        return "—";
    }

    const d =
        new Date(date);

    return d.toLocaleDateString(
        "en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   SALARY PARSER
========================================================= */

function extractSalary(value) {

    if (!value) {
        return 0;
    }

    const match =
        value.match(
            /[\d.]+/
        );

    return match ?
        parseFloat(match[0]) :
        0;

}


/* =========================================================
   MODAL
========================================================= */

function openModal(company = null) {

    const modal =
        document.getElementById("modal");

    const title =
        document.getElementById("modalTitle");


    document.getElementById(
        "companyForm"
    ).reset();


    document.getElementById(
        "companyId"
    ).value = "";


    if (company) {

        title.textContent =
            "Edit Company";

        document.getElementById(
            "companyId"
        ).value = company.id;

        document.getElementById(
            "companyName"
        ).value = company.name;

        document.getElementById(
            "companyRole"
        ).value = company.role;

        document.getElementById(
            "companyLocation"
        ).value = company.location;

        document.getElementById(
            "companySalary"
        ).value = company.salary;

        document.getElementById(
            "companyStatus"
        ).value = company.status;

        document.getElementById(
            "companyDate"
        ).value = company.date;

    } else {

        title.textContent =
            "Add Company";

        document.getElementById(
                "companyDate"
            ).value =
            new Date()
            .toISOString()
            .split("T")[0];

    }


    modal.classList.add("active");


    setTimeout(
        () => {

            document
                .getElementById("companyName")
                .focus();

        },
        100
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal() {

    document
        .getElementById("modal")
        .classList.remove("active");

}


/* =========================================================
   SAVE COMPANY
========================================================= */

function saveCompany(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "companyId"
        ).value;


    const company = {

        id: id ||
            generateId(),

        name: document.getElementById(
            "companyName"
        ).value.trim(),

        role: document.getElementById(
            "companyRole"
        ).value.trim(),

        location: document.getElementById(
            "companyLocation"
        ).value.trim(),

        salary: document.getElementById(
            "companySalary"
        ).value.trim(),

        status: document.getElementById(
            "companyStatus"
        ).value,

        date: document.getElementById(
            "companyDate"
        ).value,

        applications: 1,

        interviews: document.getElementById(
                "companyStatus"
            ).value === "interview" ?
            1 :
            0

    };


    if (id) {

        const index =
            companies.findIndex(
                item =>
                item.id === id
            );


        if (index !== -1) {

            company.applications =
                companies[index]
                .applications || 1;

            company.interviews =
                company.status === "interview" ?
                Math.max(
                    1,
                    companies[index]
                    .interviews || 0
                ) :
                companies[index]
                .interviews || 0;


            companies[index] =
                company;

        }

        showToast(
            "Company updated successfully"
        );

    } else {

        companies.push(company);

        showToast(
            "Company added successfully"
        );

    }


    saveToStorage();

    renderCompanies();

    updateStats();

    updateAnalytics();

    closeModal();

}


/* =========================================================
   EDIT COMPANY
========================================================= */

function editCompany(id) {

    const company =
        companies.find(
            item =>
            item.id === id
        );


    if (!company) {
        return;
    }


    openModal(company);

}


/* =========================================================
   DELETE COMPANY
========================================================= */

function deleteCompany(id) {

    const company =
        companies.find(
            item =>
            item.id === id
        );


    if (!company) {
        return;
    }


    const confirmed =
        confirm(
            `Delete ${company.name} from your database?`
        );


    if (!confirmed) {
        return;
    }


    companies =
        companies.filter(
            item =>
            item.id !== id
        );


    saveToStorage();

    renderCompanies();

    updateStats();

    updateAnalytics();


    showToast(
        "Company deleted"
    );

}


/* =========================================================
   STATS
========================================================= */

function updateStats() {

    const total =
        companies.length;


    const active =
        companies.filter(
            company =>
            company.status === "active"
        ).length;


    const applications =
        companies.reduce(
            (total, company) =>
            total +
            Number(
                company.applications || 0
            ),
            0
        );


    const interviews =
        companies.reduce(
            (total, company) =>
            total +
            Number(
                company.interviews || 0
            ),
            0
        );


    animateNumber(
        "totalCompanies",
        total
    );

    animateNumber(
        "activeCompanies",
        active
    );

    animateNumber(
        "totalApplications",
        applications
    );

    animateNumber(
        "totalInterviews",
        interviews
    );

}


/* =========================================================
   NUMBER ANIMATION
========================================================= */

function animateNumber(
    elementId,
    target
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {
        return;
    }


    const start =
        Number(
            element.textContent
        ) || 0;


    const duration = 500;

    const startTime =
        performance.now();


    function update(time) {

        const progress =
            Math.min(
                (time - startTime) /
                duration,
                1
            );


        const value =
            Math.round(
                start +
                (target - start) *
                progress
            );


        element.textContent =
            value;


        if (progress < 1) {

            requestAnimationFrame(
                update
            );

        }

    }


    requestAnimationFrame(update);

}


/* =========================================================
   ANALYTICS
========================================================= */

function updateAnalytics() {

    const total =
        companies.length;


    if (total === 0) {

        setProgress(
            "pipelineProgress",
            "pipelinePercent",
            0
        );

        setProgress(
            "interviewProgress",
            "interviewPercent",
            0
        );

        setProgress(
            "selectionProgress",
            "selectionPercent",
            0
        );

        return;

    }


    const active =
        companies.filter(
            company =>
            company.status === "active" ||
            company.status === "applied"
        ).length;


    const interviews =
        companies.filter(
            company =>
            company.status === "interview" ||
            company.status === "selected"
        ).length;


    const selected =
        companies.filter(
            company =>
            company.status === "selected"
        ).length;


    const pipeline =
        Math.round(
            (active / total) * 100
        );


    const interviewRate =
        Math.round(
            (interviews / total) * 100
        );


    const selectionRate =
        Math.round(
            (selected / total) * 100
        );


    setProgress(
        "pipelineProgress",
        "pipelinePercent",
        pipeline
    );


    setProgress(
        "interviewProgress",
        "interviewPercent",
        interviewRate
    );


    setProgress(
        "selectionProgress",
        "selectionPercent",
        selectionRate
    );

}


/* =========================================================
   PROGRESS
========================================================= */

function setProgress(
    barId,
    textId,
    value
) {

    const bar =
        document.getElementById(
            barId
        );

    const text =
        document.getElementById(
            textId
        );


    if (bar) {

        setTimeout(
            () => {

                bar.style.width =
                    `${value}%`;

            },
            100
        );

    }


    if (text) {

        text.textContent =
            `${value}%`;

    }

}


/* =========================================================
   EXPORT JSON
========================================================= */

function exportData() {

    const data =
        JSON.stringify(
            companies,
            null,
            4
        );


    const blob =
        new Blob(
            [data], {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        "recruiter-companies.json";


    document.body.appendChild(
        link
    );

    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "Company data exported"
    );

}


/* =========================================================
   IMPORT JSON
========================================================= */

function importData(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function(e) {

            try {

                const imported =
                    JSON.parse(
                        e.target.result
                    );


                if (!Array.isArray(
                        imported
                    )) {

                    throw new Error(
                        "Invalid format"
                    );

                }


                const valid =
                    imported.every(
                        item =>
                        item.name &&
                        item.role
                    );


                if (!valid) {

                    throw new Error(
                        "Invalid company data"
                    );

                }


                companies =
                    imported.map(
                        company => ({

                            ...company,

                            id: company.id ||
                                generateId(),

                            applications: company.applications ||
                                1,

                            interviews: company.interviews ||
                                0

                        })
                    );


                saveToStorage();

                renderCompanies();

                updateStats();

                updateAnalytics();


                showToast(
                    "Company data imported"
                );

            } catch (error) {

                alert(
                    "Invalid JSON file."
                );

                console.error(
                    error
                );

            }


            event.target.value = "";

        };


    reader.readAsText(file);

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    const toastMessage =
        document.getElementById(
            "toastMessage"
        );


    toastMessage.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2600
        );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === undefined ||
        value === null) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   CLOSE MODAL WITH ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   CLOSE MODAL OUTSIDE
========================================================= */

document
    .getElementById("modal")
    .addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "modal"
            ) {

                closeModal();

            }

        }
    );