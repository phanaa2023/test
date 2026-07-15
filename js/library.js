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

/* Mở popup */
installButton?.addEventListener("click", () => {
    // Cách nhận diện iOS/iPadOS chính xác nhất hiện nay
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
        popupTitle.textContent = "📱 Thêm vào màn hình chính";
        popupContent.innerHTML = `
            <p>
                Để cài <strong>Một Góc Phật Pháp</strong> vào màn hình chính:
            </p>
            <ol style="text-align: left; margin: 15px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Nhấn nút <strong>Chia sẻ</strong> (biểu tượng <span style="font-size: 18px;">⎋</span> hoặc hình vuông có mũi tên chỉ lên) trên thanh công cụ của Safari.</li>
                <li style="margin-bottom: 8px;">Cuộn xuống dưới và chọn <strong>"Thêm vào Màn hình chính"</strong> (Add to Home Screen).</li>
                <li>Nhấn <strong>"Thêm"</strong> (Add) ở góc trên bên phải để hoàn tất.</li>
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

        document.getElementById("confirmInstall")?.addEventListener("click", async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            deferredPrompt = null;
            if (outcome === "accepted") {
                installSection?.style.display = "none";
            }
            closeInstall();
        });
    } else {
        popupTitle.textContent = "📱 Hướng dẫn cài đặt";
        popupContent.innerHTML = `
            <p>
                Để cài ứng dụng này lên màn hình chính:
            </p>
            <ul style="text-align: left; margin: 15px 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;"><strong>Trên Android:</strong> Mở trang web bằng <strong>Google Chrome</strong>, nhấn vào biểu tượng 3 chấm ở góc trên và chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào màn hình chính"</strong>.</li>
                <li><strong>Trên iPhone:</strong> Hãy chắc chắn rằng bạn đang mở trang web bằng trình duyệt <strong>Safari</strong> gốc để thực hiện cài đặt.</li>
            </ul>
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