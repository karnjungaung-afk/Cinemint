// js/detail.js — หน้ารายละเอียดหนัง (movie-detail.html)
document.addEventListener("DOMContentLoaded", () => {
    const params   = new URLSearchParams(window.location.search);
    const movieId  = params.get('id');
    const movie    = movieDatabase.find(m => m.id === movieId);
    const pageContainer = document.getElementById("detail-page-content");

    // ตัวอย่างการใส่ src ของ iframe ตอน render หน้าหนัง
    trailerIframe.src = `${movie.trailerEmbed}?enablejsapi=1`;
    trailerIframe.id = "trailer-video";

    if (!movie) {
        pageContainer.innerHTML = `
            <div class="not-found">
                <div class="not-found-icon">🎬</div>
                <h2>ไม่พบข้อมูลภาพยนตร์</h2>
                <p style="color:var(--text-gray);margin-bottom:28px;">
                    รหัส "${movieId || ''}" ไม่มีอยู่ในฐานข้อมูล CineMint
                </p>
                <a href="index.html" class="btn-mint">← กลับหน้าหลัก</a>
            </div>`;
        return;
    }

    document.title = `${movie.title} — CineMint`;

    /* ---- YouTube helpers ---------------------------------------- */
    function watchUrl(embedUrl) {
        const m = (embedUrl || '').match(/embed\/([^?&/]+)/);
        return m ? `https://www.youtube.com/watch?v=${m[1]}` : embedUrl;
    }

    /* ---- Poster img tag with fallback ---------------------------- */
    function detailPosterTag(m) {
        return posterImgTag(m);
    }

    /* ---- Related movies (same genre, sorted by rating) ----------- */
    function buildRelated(current) {
        const related = movieDatabase
            .filter(m => m.id !== current.id)
            .map(m => ({ ...m, _match: m.genres.filter(g => current.genres.includes(g)).length }))
            .filter(m => m._match > 0)
            .sort((a, b) => b._match - a._match || b.rating - a.rating)
            .slice(0, 8);

        if (!related.length) return '';

        const cards = related.map(m => `
            <a href="movie-detail.html?id=${m.id}" class="movie-card">
                <div class="poster-frame"
                     data-title="${(m.title||'').replace(/"/g,'&quot;')}"
                     data-year="${m.year}">
                    ${posterImgTag(m)}
                    ${bookmarkBtnHtml(m.id)}
                </div>
                <div class="movie-card-info">
                    <div class="movie-card-title-row">
                        <strong>${m.title}</strong>
                        <div class="rating-leaf sm"><span>${m.rating}</span></div>
                    </div>
                    <span class="movie-card-sub">${m.year} • ${m.genres[0]}</span>
                </div>
            </a>
        `).join('');

        return `
            <section class="related-section">
                <div class="movie-row-head" style="padding:0;margin-bottom:20px;">
                    <h3 style="margin:0;font-size:1.35rem;">ภาพยนตร์ที่คุณอาจชอบ</h3>
                    <a href="top-rated.html?genre=${encodeURIComponent(current.genres[0])}"
                       class="row-link">
                        ดูทั้งหมดแนว ${current.genres[0]}
                        <i class="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
                <div class="movie-grid" id="related-grid">
                    ${cards}
                </div>
            </section>
        `;
    }

    /* ---- Trailer section ---------------------------------------- */
    function buildTrailer(m) {
        if (!m.trailerEmbed) return '';
        return `
            <h3 style="margin-top:30px;">ตัวอย่างภาพยนตร์</h3>
            <div class="video-wrapper">
                <div class="video-container">
                    <iframe src="${m.trailerEmbed}"
                            title="${m.title} Official Trailer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen
                            loading="lazy"></iframe>
                </div>
                <div class="trailer-fallback">
                    <a href="${watchUrl(m.trailerEmbed)}"
                       target="_blank" rel="noopener noreferrer"
                       class="btn-outline btn-yt">
                        <i class="fa-brands fa-youtube"></i>
                        ดูตัวอย่างบน YouTube
                    </a>
                </div>
            </div>
        `;
    }

    /* ---- Main render --------------------------------------------- */
    pageContainer.innerHTML = `
        <div class="detail-hero js-tmdb-backdrop" id="detail-hero-bg"
             data-tmdb-id="${movie.tmdbId}">
            <div class="detail-hero-overlay"></div>
            <div class="grain-overlay"></div>
            <div class="detail-hero-inner">
                <div class="detail-poster-frame"
                     data-title="${(movie.title||'').replace(/"/g,'&quot;')}"
                     data-year="${movie.year}">
                    ${detailPosterTag(movie)}
                </div>
                <div class="detail-title-block">
                    <h1>${movie.title}</h1>
                    <p class="meta-row">
                        🗓️ ${movie.year} &nbsp;•&nbsp;
                        ⏱️ ${movie.duration} &nbsp;•&nbsp;
                        🎬 ${movie.director}
                    </p>
                    <div class="genre-row">
                        ${movie.genres.map(g =>
                            `<a href="top-rated.html?genre=${encodeURIComponent(g)}"
                               class="genre-tag genre-tag-link">${g}</a>`
                        ).join('')}
                    </div>
                    <div class="detail-rating-block">
                        <div class="rating-leaf lg"><span>${movie.rating}</span></div>
                        <div class="label">
                            <strong>MintBot AI</strong>
                            <span>วิเคราะห์โดย AI อย่างเป็นกลาง</span>
                        </div>
                        <button type="button"
                            class="watchlist-toggle-btn ${Watchlist.has(movie.id) ? 'active' : ''}"
                            onclick="const added = Watchlist.toggle('${movie.id}'); this.classList.toggle('active', added); this.querySelector('span').textContent = added ? 'บันทึกแล้ว' : 'บันทึกไว้ดู'; showToast(added ? '🍃 เพิ่มลงรายการที่ต้องการดูแล้ว' : 'ลบออกจากรายการแล้ว');">
                            <i class="fa-solid fa-bookmark"></i>
                            <span>${Watchlist.has(movie.id) ? 'บันทึกแล้ว' : 'บันทึกไว้ดู'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="detail-grid">
            <div>
                <h3>เรื่องย่อ</h3>
                <p class="lede">${movie.synopsis}</p>

                ${buildTrailer(movie)}

                <div class="ai-review-box">
                    <h3>🤖 รีวิวโดย MintBot AI</h3>
                    <blockquote class="ai-review-quote">
                        <p>${movie.aiReview}</p>
                        <cite>— MintBot AI, วิเคราะห์อย่างเป็นกลาง</cite>
                    </blockquote>
                </div>

                <div class="pros-cons">
                    <div class="pros-box">
                        <h4>✔ จุดเด่น</h4>
                        <ul>${movie.pros.map(p => `<li>${p}</li>`).join('')}</ul>
                    </div>
                    <div class="cons-box">
                        <h4>✖ จุดด้อย</h4>
                        <ul>${movie.cons.map(c => `<li>${c}</li>`).join('')}</ul>
                    </div>
                </div>

                <div class="external-ratings-box" id="external-ratings-box" style="display:none;">
                    <h3><i class="fa-solid fa-scale-unbalanced"></i> คะแนนจากแหล่งอื่น</h3>
                    <div class="external-ratings-grid" id="external-ratings-grid"></div>
                    <p class="external-ratings-credit">ข้อมูลจาก OMDb API — บางส่วนดึงมาจาก IMDb</p>
                </div>
            </div>

            <aside class="side-panel">
                <h4>นักแสดงและทีมงาน</h4>
                <p class="info-block" style="margin-bottom:6px;">
                    <strong>ผู้กำกับ:</strong><br>${movie.director}
                </p>
                <strong class="info-block" style="display:block;margin:14px 0 6px;">นักแสดงนำ:</strong>
                <ol class="cast-list">
                    ${movie.cast.map(actor => `<li>${actor}</li>`).join('')}
                </ol>
                <h4 style="margin-top:24px;">ข้อมูลหนัง</h4>
                <table class="spec-table">
                    <tbody>
                        <tr><th scope="row">วันฉาย</th><td>${movie.releaseDate}</td></tr>
                        <tr><th scope="row">ความยาว</th><td>${movie.duration}</td></tr>
                        <tr><th scope="row">แนวหนัง</th><td>${movie.genres.join(', ')}</td></tr>
                        <tr><th scope="row">สถานะ</th><td><span class="status-pill">${movie.status}</span></td></tr>
                    </tbody>
                </table>
                <div style="margin-top:24px;padding-top:20px;border-top:1px solid var(--border-soft);">
                    ${movie.trailerEmbed ? `
                    <a href="${watchUrl(movie.trailerEmbed)}"
                       target="_blank" rel="noopener"
                       class="btn-outline btn-yt" style="width:100%;justify-content:center;font-size:0.88rem;">
                        <i class="fa-brands fa-youtube"></i> ดูตัวอย่างบน YouTube
                    </a>` : ''}
                    <button type="button" id="find-cinema-btn"
                        class="btn-outline" style="width:100%;justify-content:center;font-size:0.88rem;margin-top:10px;">
                        <i class="fa-solid fa-location-dot"></i> ดูโรงหนังใกล้คุณ
                    </button>
                </div>
            </aside>
        </div>

        ${buildRelated(movie)}
    `;

    /* TMDB images */
    if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(pageContainer);

    /* Backdrop 3-layer fallback (backdrop → poster → gradient) */
    const heroBg = document.getElementById("detail-hero-bg");
    if (heroBg && typeof applyBackdrop === "function") applyBackdrop(heroBg, movie);

    /* hydrate related grid เพิ่มเติม */
    const relatedGrid = document.getElementById("related-grid");
    if (relatedGrid && typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(relatedGrid);

    /* OMDb — คะแนนจากแหล่งอื่น (IMDb / Rotten Tomatoes / Metacritic) */
    if (typeof OMDbAPI !== "undefined" && OMDbAPI.isEnabled()) {
        const box  = document.getElementById("external-ratings-box");
        const grid = document.getElementById("external-ratings-grid");
        OMDbAPI.getRatings(movie).then(r => {
            const badges = [];
            if (r.imdbRating) badges.push({
                icon: '<i class="fa-brands fa-imdb"></i>', label: 'IMDb',
                value: r.imdbRating, sub: r.imdbVotes ? r.imdbVotes + ' โหวต' : '', cls: 'imdb'
            });
            if (r.rottenTomatoes) badges.push({
                icon: '🍅', label: 'Rotten Tomatoes',
                value: r.rottenTomatoes, sub: '', cls: 'rt'
            });
            if (r.metacritic) badges.push({
                icon: '🅼', label: 'Metacritic',
                value: r.metacritic + '/100', sub: '', cls: 'meta'
            });
            if (badges.length === 0) return; // ไม่มีข้อมูลให้แสดง — ซ่อนกล่องไว้เหมือนเดิม

            grid.innerHTML = badges.map(b => `
                <div class="ext-rating-badge ext-${b.cls}">
                    <div class="ext-rating-icon">${b.icon}</div>
                    <div class="ext-rating-value">${b.value}</div>
                    <div class="ext-rating-label">${b.label}</div>
                    ${b.sub ? `<div class="ext-rating-sub">${b.sub}</div>` : ''}
                </div>
            `).join('');
            box.style.display = "block";
        }).catch(() => {
            // ดึงข้อมูลไม่สำเร็จ (อาจไม่พบหนังเรื่องนี้ใน OMDb) — ซ่อนกล่องไว้เงียบๆ ไม่รบกวนผู้ใช้
        });
    }

    /* Geolocation API — ดูโรงหนังใกล้คุณ */
    const cinemaBtn = document.getElementById("find-cinema-btn");
    if (cinemaBtn) {
        cinemaBtn.addEventListener("click", () => {
            if (!("geolocation" in navigator)) {
                showToast("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง");
                return;
            }
            const originalHtml = cinemaBtn.innerHTML;
            cinemaBtn.disabled = true;
            cinemaBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> กำลังค้นหาตำแหน่ง...`;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const query = encodeURIComponent(`โรงภาพยนตร์ ${movie.title}`);
                    // เปิด Google Maps ค้นหาโรงภาพยนตร์ใกล้ตำแหน่งผู้ใช้
                    const mapsUrl = `https://www.google.com/maps/search/${query}/@${latitude},${longitude},13z`;
                    window.open(mapsUrl, "_blank", "noopener");
                    cinemaBtn.disabled = false;
                    cinemaBtn.innerHTML = originalHtml;
                },
                (error) => {
                    cinemaBtn.disabled = false;
                    cinemaBtn.innerHTML = originalHtml;
                    const messages = {
                        1: "กรุณาอนุญาตการเข้าถึงตำแหน่งเพื่อค้นหาโรงหนังใกล้คุณ",
                        2: "ไม่สามารถระบุตำแหน่งได้ในขณะนี้",
                        3: "การค้นหาตำแหน่งใช้เวลานานเกินไป กรุณาลองใหม่",
                    };
                    showToast(messages[error.code] || "ไม่สามารถระบุตำแหน่งได้");
                },
                { timeout: 10000, maximumAge: 300000 }
            );
        });
    }
});
