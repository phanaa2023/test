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
	
	updateStudyButton();

    if (!floatingProgress) return;

    floatingProgress.classList.add("show");

    clearTimeout(hideTimer);

    hideTimer = setTimeout(() => {

        floatingProgress.classList.remove("show");

    }, 1200);

});
/* ======================
   Study Mode
====================== */

const studyButton =
    document.getElementById("studyModeButton");

const studyBlocks =
    document.querySelectorAll(".study-block");


/* ======================
   Tìm block đang đọc
====================== */

function getCurrentStudyBlock() {

    const marker =
        window.innerHeight * 0.35;

    for (const block of studyBlocks) {

        const rect =
            block.getBoundingClientRect();

        if (
            rect.top <= marker &&
            rect.bottom > marker
        ) {
            return block;
        }

    }

    return null;
}


/* ======================
   Chờ layout ổn định
   rồi giữ nguyên block
====================== */

function keepStudyPosition(block, oldTop) {

    if (
        !block ||
        oldTop === undefined
    ) {
        return;
    }


    /*
       Chờ nhiều frame để:

       TEXT → TABLE
       hoặc
       TABLE → TEXT

       có đủ thời gian thay đổi
       chiều cao và reflow layout.
    */

    let frame = 0;

    const maxFrames = 6;


    function adjust() {

        const newTop =
            block.getBoundingClientRect().top;


        /*
           Căn block hiện tại về đúng
           vị trí cũ trên màn hình.
        */

        const difference =
            newTop - oldTop;


        if (Math.abs(difference) > 0.5) {

            window.scrollBy(
                0,
                difference
            );

        }


        frame++;


        /*
           Tiếp tục kiểm tra thêm vài frame.

           Điều này quan trọng trên mobile
           vì layout có thể tiếp tục thay đổi
           sau lần reflow đầu tiên.
        */

        if (frame < maxFrames) {

            requestAnimationFrame(adjust);

        }

    }


    requestAnimationFrame(adjust);

}


/* ======================
   Hiển thị nút Study Mode
====================== */

function updateStudyButton() {

    if (!studyButton) return;


    if (studyBlocks.length === 0) {

        studyButton.style.display = "none";

        return;

    }


    let visible = false;


    for (const block of studyBlocks) {

        const rect =
            block.getBoundingClientRect();


        if (
            rect.bottom > 0 &&
            rect.top < window.innerHeight
        ) {

            visible = true;

            break;

        }

    }


    studyButton.classList.toggle(
        "show",
        visible
    );

}


updateStudyButton();


/* ======================
   Chuyển TEXT ↔ TABLE
====================== */

studyButton?.addEventListener(
    "click",
    () => {


        /* ======================
           1. Xác định block hiện tại
        ====================== */

        const currentBlock =
            getCurrentStudyBlock();


        if (!currentBlock) return;


        /* ======================
           2. Ghi lại vị trí block
        ====================== */

        const oldTop =
            currentBlock.getBoundingClientRect().top;


        /* ======================
           3. Đổi chế độ
        ====================== */

        document.body.classList.toggle(
            "study-mode"
        );


        /* ======================
           4. Đợi layout ổn định
              rồi căn lại vị trí
        ====================== */

        keepStudyPosition(
            currentBlock,
            oldTop
        );


        /* ======================
           5. Đổi tên nút
        ====================== */

        const active =
            document.body.classList.contains(
                "study-mode"
            );


        studyButton.textContent =
            active
                ? "Đọc thường"
                : "Sơ đồ học thuộc";


        /* ======================
           6. Cập nhật trạng thái nút
        ====================== */

        updateStudyButton();

    }
);