function updateLibraryProgress() {

    document.querySelectorAll(".book").forEach(book => {

        const bookId = book.dataset.book;

        if (!bookId) return;

        const percent = Number(
            localStorage.getItem(bookId + "_percent")
        ) || 0;

        const bar = book.querySelector(".progress-bar");
        const percentText = book.querySelector(".progress-percent");
        const button = book.querySelector(".book-left a");

        if (bar) {

            bar.style.width = percent + "%";

        }

        if (percentText) {

            percentText.textContent = percent + "%";

        }

        if (button) {

            if (percent <= 0) {

    button.onclick = null;
    button.textContent = "Đọc ebook";

} else if (percent >= 100) {

    button.textContent = "Đọc lại";

    button.onclick = () => {

        localStorage.removeItem(bookId + "_position");
        localStorage.setItem(bookId + "_restart", "1");

    };

} else {

    button.onclick = null;

                button.textContent = "Đọc tiếp";

            }

        }

    });

}

document.addEventListener("DOMContentLoaded", updateLibraryProgress);

window.addEventListener("pageshow", updateLibraryProgress);

/* ==================================================
   Service Worker
================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    if (!("serviceWorker" in navigator)) return;

    try {

        const registration = await navigator.serviceWorker.register("/service-worker.js");

        await navigator.serviceWorker.ready;

        const books = new Set();

        document.querySelectorAll('a[href^="books/"], a[href^="/books/"]').forEach(link => {

            books.add(new URL(link.href).pathname);

        });

        const sw = navigator.serviceWorker.controller || registration.active;

        if (sw) {

            sw.postMessage({

                type: "CACHE_BOOKS",

                books: [...books]

            });

        }

    } catch (error) {

        console.error("Service Worker:", error);

    }

});
