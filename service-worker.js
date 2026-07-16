    /* ==================================================
       Một Góc Phật Pháp
       Service Worker v2
    ================================================== */

    const CACHE_NAME = "mot-goc-phat-phap-v2.6";

/* ==================================================
   Cài đặt
================================================== */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

            .then(cache =>

                cache.addAll([

                    "/",
                    "/index.html"

                ])

            )

            .catch(error => {

                console.error("Service Worker install failed:", error);

            })

    );

    self.skipWaiting();

});

    self.addEventListener("activate", event => {
        event.waitUntil(
            caches.keys().then(keys =>
                Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
            )
        );
        self.clients.claim();
    });

    self.addEventListener("message", async event => {
        if (!event.data || event.data.type !== "CACHE_BOOKS") return;

        const cache = await caches.open(CACHE_NAME);
        const books = Array.isArray(event.data.books)
    ? event.data.books
    : [];

        for (const url of books) {
            try {
                const res = await fetch(url, { cache: "no-cache" });
                if (res.ok) await cache.put(url, res.clone());
            } catch {}
        }

        const metaRequest = new Request("/__books__");
        const old = await cache.match(metaRequest);

        let oldBooks = [];
        if (old) {
            try { oldBooks = await old.json(); } catch {}
        }

        for (const book of oldBooks) {
            if (!books.includes(book)) {
                await cache.delete(book);
            }
        }

        await cache.put(
    metaRequest,
    new Response(JSON.stringify(books), {
        headers: {
            "Content-Type": "application/json"
        }
    })
);
    });

    self.addEventListener("fetch", event => {

        if (event.request.method !== "GET") return;

        const url = new URL(event.request.url);

        if (url.origin !== location.origin) return;

        const isHTML =
            event.request.mode === "navigate" ||
            url.pathname.endsWith(".html") ||
            url.pathname === "/";

        if (isHTML) {

            event.respondWith(
                fetch(event.request)
                    .then(async response => {

                        if (response.ok) {
                            const cache = await caches.open(CACHE_NAME);
                            cache.put(event.request, response.clone());
                        }

                        return response;

                    })
                    .catch(() =>
                        caches.match(event.request)
                            .then(r => r || caches.match("/index.html"))
                    )
            );

            return;
        }

        event.respondWith(
            caches.match(event.request)
                .then(async cached => {

                    if (cached) return cached;

                    const response = await fetch(event.request);

                    if (response.ok) {
                        const cache = await caches.open(CACHE_NAME);
                        cache.put(event.request, response.clone());
                    }

                    return response;

                })
        );

    });
