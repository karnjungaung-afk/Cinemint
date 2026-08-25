// js/main.js — หน้าแรก (index.html)
document.addEventListener("DOMContentLoaded", () => {

    /* ── 1. Hero Banner ─────────────────────────────────────────── */
    function getFeaturedMovie() {
        const pool = movieDatabase.filter(function (m) { return m.rating >= 88; });
        const src = pool.length ? pool : movieDatabase;
        const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        return src[day % src.length];
    }

    const featured = getFeaturedMovie();
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
            featured.genres.map(function (g) { return '<span class="genre-tag">' + g + '</span>'; }).join('') +
            '</div>' +
            '<p class="synopsis">' + featured.synopsis + '</p>' +
            '<div class="hero-actions">' +
            '<a href="movie-detail.html?id=' + featured.id + '" class="btn-mint"><i class="fa-solid fa-play"></i> ดูรีวิว AI</a>' +
            '<a href="now-showing.html" class="btn-outline"><i class="fa-solid fa-film"></i> สำรวจหนังทั้งหมด</a>' +
            bookmarkBtnHtml(featured.id) +
            '</div>';
    }

    /* ── 2. Hero Poster Slideshow ────────────────────────────────
       ภาพ backdrop เดี่ยวขนาดใหญ่ฝั่งขวา สุ่มสลับทุก 6 วินาที
       ─────────────────────────────────────────────────────────── */
    // =========================================================
// แก้ไขฟังก์ชัน Hero Slideshow และ Render ภาพ
// =========================================================

function buildPosterSlideshow(posters) {
    const heroSection = document.getElementById('hero-section');
    const mosaicContainer = document.querySelector('.hero-poster-mosaic');
    
    if (!heroSection || !mosaicContainer || !posters || !posters.length) return;

    // 1. ล้างภาพ static เดิมของ hero-section เพื่อไม่ให้ภาพพื้นหลังเดิมซ้อนทะลุขึ้นมา
    heroSection.style.backgroundImage = 'none';

    // 2. เคลียร์ Timer เก่าทิ้ง ป้องกันสคริปต์รันซ้ำแล้วเกิด Timer ซ้อนกันหลายตัว
    if (window.slideshowTimer) {
        clearInterval(window.slideshowTimer);
        window.slideshowTimer = null;
    }

    const slides = mosaicContainer.querySelectorAll('.pm-slide');
    if (slides.length === 0) return;

    let currentIndex = 0;

    // 3. ฟังก์ชันสลับ Slide แบบล้าง Class ทิ้งทั้งหมดก่อน
    function changeSlide() {
        // ถอด active ออกจากสไลด์ทั้งหมดก่อน
        slides.forEach(slide => slide.classList.remove('active'));

        // คำนวณ index ถัดไป
        currentIndex = (currentIndex + 1) % slides.length;

        // ใส่ active ให้เฉพาะสไลด์ปัจจุบัน
        slides[currentIndex].classList.add('active');
    }

    // รีเซ็ตสไลด์แรก
    slides.forEach(slide => slide.classList.remove('active'));
    slides[0].classList.add('active');

    // 4. เริ่มต้น Interval ใหม่
    window.slideshowTimer = setInterval(changeSlide, 5000);
}

// ฟังก์ชันสำหรับฉีดภาพ Poster ลง Container (ล้าง DOM เก่าก่อนเสมอ)
function setPosterImage(containerElement, imageUrl, altText = '') {
    if (!containerElement) return;

    // ล้างแท็ก <img> หรือ SVG เดิมที่ค้างอยู่ออกทั้งหมด
    containerElement.innerHTML = '';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = altText;
    
    containerElement.appendChild(img);
}
    
    /* ── 3. Movie card factory ──────────────────────────────────── */
    function createCard(movie) {
        var card = document.createElement("a");
        card.href = "movie-detail.html?id=" + movie.id;
        card.className = "movie-card reveal-on-scroll";
        card.innerHTML =
            '<div class="poster-frame"' +
            ' data-title="' + (movie.title || '').replace(/"/g, '&quot;') + '"' +
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
        movies.forEach(function (m) { grid.appendChild(createCard(m)); });
    }

    /* ── 4. New Releases ────────────────────────────────────────── */
    var latestYear = Math.max.apply(null, movieDatabase.map(function (m) { return m.year; }));
    var newReleases = movieDatabase
        .filter(function (m) { return m.year === latestYear; })
        .sort(function (a, b) { return b.rating - a.rating; })
        .slice(0, 8);
    renderRow("new-releases-grid", newReleases.length ? newReleases : movieDatabase.slice(0, 8));

    /* ── 5. AI Top Picks ────────────────────────────────────────── */
    var topPicks = movieDatabase.slice().sort(function (a, b) { return b.rating - a.rating; }).slice(0, 8);
    renderRow("top-picks-grid", topPicks);

    /* ── 6. TMDB real-poster hydration ─────────────────────────── */
    if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(document);

    /* ── 7. Scroll reveal animations ──────────────────────────── */
    if (typeof initScrollReveal === "function") initScrollReveal();
});
