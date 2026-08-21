// js/main.js — หน้าแรก (index.html)
document.addEventListener("DOMContentLoaded", () => {

    /* ── 1. Hero Banner ─────────────────────────────────────────── */
    function getFeaturedMovie() {
        const pool = movieDatabase.filter(function(m){ return m.rating >= 88; });
        const src  = pool.length ? pool : movieDatabase;
        const day  = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        return src[day % src.length];
    }

    const featured    = getFeaturedMovie();
    const heroSection = document.getElementById("hero-section");
    const heroContent = document.getElementById("hero-content");

    if (heroSection && heroContent) {
        heroSection.classList.add("js-tmdb-backdrop");
        heroSection.dataset.tmdbId = featured.tmdbId;

        // ระบบ Backdrop 3 ชั้น: backdrop → poster → gradient (utils.js)
        if (typeof applyBackdrop === "function") applyBackdrop(heroSection, featured);

        heroContent.innerHTML =
            '<span class="hero-eyebrow">🍃 แนะนำโดย AI ประจำวันนี้</span>' +
            '<h1>' + featured.title + '</h1>' +
            '<div class="hero-meta">' +
                '<div class="rating-leaf lg"><span>' + featured.rating + '</span></div>' +
                '<span>' + featured.year + ' • ' + featured.duration + ' • กำกับโดย ' + featured.director + '</span>' +
            '</div>' +
            '<div class="hero-genres">' +
                featured.genres.map(function(g){ return '<span class="genre-tag">' + g + '</span>'; }).join('') +
            '</div>' +
            '<p class="synopsis">' + featured.synopsis + '</p>' +
            '<div class="hero-actions">' +
                '<a href="movie-detail.html?id=' + featured.id + '" class="btn-mint"><i class="fa-solid fa-play"></i> ดูรีวิว AI</a>' +
                '<a href="now-showing.html" class="btn-outline"><i class="fa-solid fa-film"></i> สำรวจหนังทั้งหมด</a>' +
                bookmarkBtnHtml(featured.id) +
            '</div>';
    }

    /* ── 2. Hero Poster Slideshow ────────────────────────────────
       ภาพ backdrop เดี่ยวขนาดใหญ่ฝั่งขวา สุ่มสลับทุก 5 วินาที
       ─────────────────────────────────────────────────────────── */
    function buildPosterSlideshow() {
        if (!heroSection || window.innerWidth <= 900) return;

        var pool = movieDatabase
            .filter(function(m){ return !!m.backdrop; })
            .sort(function(){ return Math.random() - 0.5; });

        // ต้องมีอย่างน้อย 2 ภาพจึงจะสลับได้อย่างมีความหมาย
        if (pool.length < 2) return;

        var poolIdx = 0;

        var container = document.createElement("div");
        container.className = "hero-poster-mosaic";
        container.setAttribute("aria-hidden", "true");

        var imgA = document.createElement("img");
        var imgB = document.createElement("img");
        imgA.className = "pm-slide";
        imgB.className = "pm-slide";
        imgA.alt = ""; imgB.alt = "";
        imgA.draggable = false; imgB.draggable = false;
        container.appendChild(imgA);
        container.appendChild(imgB);

        var overlay = heroSection.querySelector(".hero-overlay");
        heroSection.insertBefore(container, overlay || heroSection.firstChild);

        var activeLayer = 0;
        var layers = [imgA, imgB];
        var consecutiveFails = 0;
        var MAX_CONSECUTIVE_FAILS = pool.length;

        // ล็อคป้องกัน race condition: ถ้ากำลังเปลี่ยนภาพอยู่ (preload หรือ transition
        // ยังไม่เสร็จ) จะไม่ยอมให้เริ่มรอบใหม่ซ้อนขึ้นมา ซึ่งเป็นสาเหตุที่ทำให้
        // เกิดภาพซ้อนทับกัน 2 ภาพพร้อมกันเมื่อเน็ตช้าหรือ interval ยิงซ้อน
        var isTransitioning = false;

        function preload(src) {
            return new Promise(function(resolve) {
                var probe = new Image();
                var timer = setTimeout(function(){ resolve(null); }, 8000);
                probe.onload  = function(){ clearTimeout(timer); resolve(src); };
                probe.onerror = function(){ clearTimeout(timer); resolve(null); };
                probe.src = src;
            });
        }

        function nextSrc() {
            var movie = pool[poolIdx % pool.length];
            poolIdx++;
            return movie.backdrop;
        }

        function applySlide(src) {
            return new Promise(function(resolveSlide) {
                var next = activeLayer === 0 ? 1 : 0;
                layers[next].src = src;
                requestAnimationFrame(function() {
                    requestAnimationFrame(function() {
                        layers[next].classList.add("active");
                        layers[activeLayer].classList.remove("active");
                        activeLayer = next;
                        // รอให้ transition ของ opacity (1.5s ใน CSS) จบก่อนปลดล็อค
                        setTimeout(resolveSlide, 1550);
                    });
                });
            });
        }

        function showNext() {
            if (isTransitioning) return; // กันการเรียกซ้อนขณะกำลังเปลี่ยนภาพอยู่
            if (consecutiveFails >= MAX_CONSECUTIVE_FAILS) return;

            isTransitioning = true;
            var src = nextSrc();
            preload(src).then(function(loaded) {
                if (!loaded) {
                    consecutiveFails++;
                    isTransitioning = false;
                    if (consecutiveFails < MAX_CONSECUTIVE_FAILS) showNext();
                    return;
                }
                consecutiveFails = 0;
                applySlide(loaded).then(function() {
                    isTransitioning = false;
                });
            });
        }

        showNext();
        setInterval(showNext, 6000);
    }

    buildPosterSlideshow();

    /* ── 3. Movie card factory ──────────────────────────────────── */
    function createCard(movie) {
        var card = document.createElement("a");
        card.href = "movie-detail.html?id=" + movie.id;
        card.className = "movie-card reveal-on-scroll";
        card.innerHTML =
            '<div class="poster-frame"' +
            ' data-title="' + (movie.title||'').replace(/"/g,'&quot;') + '"' +
            ' data-year="' + movie.year + '">' +
            posterImgTag(movie) +
            bookmarkBtnHtml(movie.id) +
            '</div>' +
            '<div class="movie-card-info">' +
                '<div class="movie-card-title-row">' +
                    '<strong>' + movie.title + '</strong>' +
                    '<div class="rating-leaf sm"><span>' + movie.rating + '</span></div>' +
                '</div>' +
                '<span class="movie-card-sub">' + movie.year + ' • ' + movie.genres[0] + '</span>' +
            '</div>';
        return card;
    }

    function renderRow(id, movies) {
        var grid = document.getElementById(id);
        if (!grid) return;
        grid.innerHTML = "";
        movies.forEach(function(m){ grid.appendChild(createCard(m)); });
    }

    /* ── 4. New Releases ────────────────────────────────────────── */
    var latestYear = Math.max.apply(null, movieDatabase.map(function(m){ return m.year; }));
    var newReleases = movieDatabase
        .filter(function(m){ return m.year === latestYear; })
        .sort(function(a, b){ return b.rating - a.rating; })
        .slice(0, 8);
    renderRow("new-releases-grid", newReleases.length ? newReleases : movieDatabase.slice(0, 8));

    /* ── 5. AI Top Picks ────────────────────────────────────────── */
    var topPicks = movieDatabase.slice().sort(function(a, b){ return b.rating - a.rating; }).slice(0, 8);
    renderRow("top-picks-grid", topPicks);

    /* ── 6. TMDB real-poster hydration ─────────────────────────── */
    if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(document);

    /* ── 7. Scroll reveal animations ──────────────────────────── */
    if (typeof initScrollReveal === "function") initScrollReveal();
});
