/* ==================================================
   Ebook Reader v1
================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const drawer = document.getElementById("drawer");
    const overlay = document.getElementById("overlay");

    const menuButton = document.getElementById("menuButton");
    const closeDrawer = document.getElementById("closeDrawer");

    const tocList = document.getElementById("tocList");

    const article = document.getElementById("articleContent");

    const fontDown = document.getElementById("fontDown");
    const fontUp = document.getElementById("fontUp");

    const progressBar = document.getElementById("progressBar");
    const readingPercent = document.getElementById("readingPercent");
	const floatingProgress = document.getElementById("floatingProgress");
	const bookTitle = document.querySelector(".reader h1");

    const bookId = document.body.dataset.book || "ebook";

    /* ======================
       Drawer
    ====================== */

    function openDrawer() {

        drawer?.classList.add("open");
        overlay?.classList.add("show");

    }

    function closeMenu() {

        drawer?.classList.remove("open");
        overlay?.classList.remove("show");

    }

    menuButton?.addEventListener("click", openDrawer);
    closeDrawer?.addEventListener("click", closeMenu);
    overlay?.addEventListener("click", closeMenu);

    /* ======================
       Auto TOC
    ====================== */

const sections = article?.querySelectorAll("section[id]") || [];

sections.forEach(section => {

    const title = section.querySelector("h2");
    if (!title) return;

    const a = document.createElement("a");

    a.href = "#" + section.id;
    a.textContent = title.textContent;

    a.addEventListener("click", (e) => {

        e.preventDefault();

        closeMenu();

section.scrollIntoView({
    behavior: "smooth",
    block: "start"
});

    });

    tocList?.appendChild(a);

});

    /* ======================
       Font Size
    ====================== */

    let fontSize = Number(localStorage.getItem("fontSize")) || 20;

    function updateFont() {

    if (article) {
        article.style.fontSize = fontSize + "px";
    }

    localStorage.setItem("fontSize", fontSize);

}

    updateFont();

    fontUp?.addEventListener("click", () => {

        if (fontSize < 26) {

            fontSize++;

            updateFont();

        }

    });

    fontDown?.addEventListener("click", () => {

        if (fontSize > 16) {

            fontSize--;

            updateFont();

        }

    });

    /* ======================
       Progress
    ====================== */

    function getPercent() {

        const scrollTop = window.scrollY;

        const height =
            document.documentElement.scrollHeight -
            window.innerHeight;

        if (height <= 0) return 100;

        return Math.min(
            100,
            Math.round(scrollTop / height * 100)
        );

    }

    function updateProgress() {

        const percent = getPercent();

        if (progressBar)
            progressBar.style.width = percent + "%";

        if (readingPercent)
            readingPercent.textContent = percent + "%";

    }

    /* ======================
       Save
    ====================== */

function savePosition() {

    let percent = getPercent();

    if (percent >= 98) {
        percent = 100;
    }

    localStorage.setItem(
        bookId + "_position",
        window.scrollY
    );

    localStorage.setItem(
        bookId + "_percent",
        percent
    );

}

    /* ======================
       Restore
    ====================== */

const restart = localStorage.getItem(
    bookId + "_restart"
);

if (restart) {

    localStorage.removeItem(bookId + "_restart");

    window.scrollTo(0, 0);

} else {

    const saved = localStorage.getItem(
        bookId + "_position"
    );

    if (saved !== null) {

        window.scrollTo(0, Number(saved));

    }

}

	updateProgress();


let hideTimer;

window.addEventListener("scroll", () => {

    updateProgress();

    savePosition();

    if (!floatingProgress) return;

    floatingProgress.classList.add("show");

    clearTimeout(hideTimer);

    hideTimer = setTimeout(() => {

        floatingProgress.classList.remove("show");

    }, 1200);

});
});