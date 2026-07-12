document.addEventListener("DOMContentLoaded", () => {

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

                button.textContent = "Bắt đầu đọc";

            } else if (percent >= 100) {

                button.textContent = "Đọc lại";

            } else {

                button.textContent = "Đọc tiếp";

            }

        }

    });

});