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

/* ==================================================
   Chia sẻ website
================================================== */

const shareButton = document.getElementById("shareBtn");

if (shareButton) {

    shareButton.addEventListener("click", async () => {

        const shareData = {
            title: document.title,
            text: "Những ebook Phật pháp miễn phí giúp ứng dụng lời Phật dạy vào cuộc sống hằng ngày.",
            url: window.location.origin
        };

        // Trình duyệt hỗ trợ chia sẻ (Android, iPhone...)
        if (navigator.share) {

            try {
                await navigator.share(shareData);
            } catch (error) {
                // Người dùng đóng cửa sổ chia sẻ
            }

            return;
        }

        // Trình duyệt không hỗ trợ -> Sao chép liên kết
        try {

            await navigator.clipboard.writeText(shareData.url);
            alert("Đã sao chép liên kết website.");

        } catch (error) {

            alert("Không thể chia sẻ trên trình duyệt này.");

        }

    });

}

document.addEventListener("DOMContentLoaded", () => {

    const installSection = document.getElementById("installSection");

    const guideButton = document.getElementById("guideButton");

    const guideOverlay = document.getElementById("guideOverlay");

    const closeGuide = document.getElementById("closeGuide");

    const guideTitle = document.getElementById("guideTitle");

    const guideContent = document.getElementById("guideContent");

    if (
        !installSection ||
        !guideButton ||
        !guideOverlay
    ) return;

    // Chỉ hiện trên điện thoại

    const ua = navigator.userAgent.toLowerCase();

const isAndroid = ua.includes("android");

const isIOS =
    /iphone|ipad|ipod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (!isAndroid && !isIOS) {

        installSection.style.display = "yes";

        return;

    }

    guideButton.addEventListener("click", () => {

        if (isAndroid) {

            guideTitle.textContent =
                "Android";

            guideContent.innerHTML = `

<ol>

<li>Mở <strong style="color:#34A853;">Trang chủ</strong> bằng <strong style="color:#34A853;">Google Chrome</strong>.</li>

<li>Nhấn nút <strong>⋮</strong></li>

<li>Chọn <strong>Thêm vào màn hình chính</strong> hoặc <strong>Cài đặt ứng dụng</strong>.</li>

<li>Nhấn <strong>Thêm</strong> hoặc <strong>Cài đặt</strong>.</li>

<li>Nếu muốn, đổi tên thành <strong>Phật Pháp</strong>.</li>

</ol>

`;

        } else {

            guideTitle.textContent =
                "iPhone";

            guideContent.innerHTML = `

<ol>

<li>Mở <strong style="color:#0A84FF;">Trang chủ</strong> bằng <strong style="color:#0A84FF;">Safari</strong>.</li>

<li>Nhấn nút <strong>Chia sẻ</strong> (hình vuông có mũi tên hướng lên ở giữa).</li>

<li>Chọn <strong>Thêm vào Màn hình chính</strong>.</li>

<li>Nếu cần, đổi tên thành <strong>Phật Pháp</strong>.</li>

<li>Nhấn <strong>Thêm</strong>.</li>

</ol>

`;

        }

        guideOverlay.classList.add("show");

    });

    closeGuide.addEventListener("click", () => {

        guideOverlay.classList.remove("show");

    });

    guideOverlay.addEventListener("click", (e) => {

        if (e.target === guideOverlay) {

            guideOverlay.classList.remove("show");

        }

    });

});