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

document.addEventListener("DOMContentLoaded", () => {

/* =========================
   Install Popup
========================= */

const installSection = document.getElementById("installSection");
const installButton = document.getElementById("installButton");

const installOverlay = document.getElementById("installOverlay");
const closeInstallPopup = document.getElementById("closeInstallPopup");

const popupTitle = document.getElementById("popupTitle");
const popupContent = document.getElementById("popupContent");

/* Android Install Prompt */

let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {

    e.preventDefault();

    deferredPrompt = e;

});

/* Đã cài ứng dụng? */

const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;

if (isStandalone && installSection) {

    installSection.style.display = "none";

}

/* Mở popup */

installButton?.addEventListener("click", () => {

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

    if (isIOS) {

        popupTitle.textContent = "📱 Thêm vào màn hình chính";

        popupContent.innerHTML = `
            <p>
                Để cài <strong>Một Góc Phật Pháp</strong> vào màn hình chính:
            </p>

            <ol>
                <li>Nhấn nút <strong>Chia sẻ</strong> (□↑) trên Safari.</li>
                <li>Chọn <strong>"Thêm vào Màn hình chính"</strong>.</li>
                <li>Nhấn <strong>"Thêm"</strong> để hoàn tất.</li>
            </ol>

            <p class="popup-note">
                Sau khi thêm, website sẽ mở như một ứng dụng và có thể đọc ebook ngay cả khi không có mạng.
            </p>
        `;

    } else if (deferredPrompt) {

        popupTitle.textContent = "📱 Cài ứng dụng";

        popupContent.innerHTML = `
            <p>
                Bạn có thể cài <strong>Một Góc Phật Pháp</strong> vào màn hình chính để mở nhanh như một ứng dụng.
            </p>

            <div class="popup-actions">
                <button id="confirmInstall">
                    Cài đặt
                </button>
            </div>

            <p class="popup-note">
                Chỉ mất vài giây để hoàn tất.
            </p>
        `;

        document
    .getElementById("confirmInstall")
    ?.addEventListener("click", async () => {

        if (!deferredPrompt) return;

deferredPrompt.prompt();

const { outcome } = await deferredPrompt.userChoice;

// Event này chỉ dùng được một lần
deferredPrompt = null;

if (outcome === "accepted") {

    installSection?.style.display = "none";

}

        closeInstall();

    });

    } else {

        popupTitle.textContent = "📱 Chưa hỗ trợ";

        popupContent.innerHTML = `
            <p>
                Chưa thể hiển thị tùy chọn cài đặt.
            </p>

            <p class="popup-note">
                Nếu đang dùng Android, hãy mở website bằng <strong>Google Chrome</strong> để cài đặt.
            </p>
        `;

    }

    installOverlay.classList.add("show");

});

/* Đóng popup */

function closeInstall() {

    installOverlay.classList.remove("show");

}

closeInstallPopup?.addEventListener("click", closeInstall);

installOverlay?.addEventListener("click", (e) => {

    if (e.target === installOverlay) {

        closeInstall();

    }

});
/* Đã cài ứng dụng */

window.addEventListener("appinstalled", () => {

    deferredPrompt = null;

    installSection?.style.display = "none";

    closeInstall();

});
});