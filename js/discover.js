// js/discover.js — หน้าค้นพบหนัง (discover.html)
// ระบบปัดการ์ดแบบ Tinder: ปัดขวา=บันทึก, ปัดซ้าย=ข้าม, ปัดขึ้น=ดูรายละเอียด
document.addEventListener("DOMContentLoaded", () => {
    const STORAGE_KEY = "cinemint_discover_seen_v1";
    const stage        = document.getElementById("swipe-stage");
    const counterEl     = document.getElementById("discover-counter");
    const progressBar   = document.getElementById("discover-progress-bar");
    const emptyState    = document.getElementById("discover-empty");
    const totalCountEl  = document.getElementById("discover-total-count");
    const btnSkip = document.getElementById("btn-skip");
    const btnInfo = document.getElementById("btn-info");
    const btnSave = document.getElementById("btn-save");
    const btnRestart = document.getElementById("btn-restart");

    let deck = [];       // หนังที่เหลือให้ดู
    let seenIds = [];    // หนังที่ดูไปแล้วในรอบนี้ (เก็บใน sessionStorage)
    let totalMovies = movieDatabase.length;

    function loadSeen() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }
    function saveSeen() {
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(seenIds)); } catch {}
    }

    function buildDeck() {
        seenIds = loadSeen();
        deck = movieDatabase
            .filter(m => !seenIds.includes(m.id))
            .sort(() => Math.random() - 0.5);
    }

    function updateProgress() {
        const done = totalMovies - deck.length;
        const pct  = totalMovies ? Math.round((done / totalMovies) * 100) : 0;
        progressBar.style.width = pct + "%";
        counterEl.textContent = `ดูแล้ว ${done} จาก ${totalMovies} เรื่อง`;
    }

    function posterOrBackdrop(movie) {
        return movie.poster || movie.backdrop || "";
    }

    function renderCard(movie, depth) {
        const card = document.createElement("div");
        card.className = "swipe-card";
        card.style.zIndex = String(10 - depth);
        card.style.setProperty("--depth", depth);
        card.dataset.movieId = movie.id;

        card.innerHTML = `
            <div class="swipe-card-media"
                 data-title="${(movie.title||'').replace(/"/g,'&quot;')}"
                 data-year="${movie.year}">
                <img class="js-tmdb-poster swipe-card-img"
                     data-tmdb-id="${movie.tmdbId}"
                     src="${posterOrBackdrop(movie)}"
                     alt="${movie.title}"
                     draggable="false"
                     onerror="handleImgError(this)">
                <div class="swipe-card-gradient"></div>
                <div class="swipe-stamp swipe-stamp-save">บันทึก</div>
                <div class="swipe-stamp swipe-stamp-skip">ข้าม</div>
            </div>
            <div class="swipe-card-info">
                <div class="swipe-card-title-row">
                    <h3>${movie.title}</h3>
                    <div class="rating-leaf sm"><span>${movie.rating}</span></div>
                </div>
                <p class="swipe-card-meta">${movie.year} • ${movie.duration} • ${movie.director}</p>
                <div class="swipe-card-genres">
                    ${movie.genres.map(g => `<span class="genre-tag">${g}</span>`).join('')}
                </div>
                <p class="swipe-card-synopsis">${movie.synopsis}</p>
            </div>
        `;
        return card;
    }

    function renderStage() {
        stage.innerHTML = "";
        if (deck.length === 0) {
            emptyState.style.display = "block";
            totalCountEl.textContent = totalMovies;
            document.querySelector(".swipe-controls").style.display = "none";
            updateProgress();
            return;
        }
        emptyState.style.display = "none";
        document.querySelector(".swipe-controls").style.display = "flex";

        // แสดง 3 ใบซ้อนกัน (ใบบนสุด = deck[0])
        const visibleCount = Math.min(3, deck.length);
        for (let i = visibleCount - 1; i >= 0; i--) {
            const card = renderCard(deck[i], i);
            stage.appendChild(card);
            if (i === 0) attachDrag(card);
        }
        updateProgress();
        if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(stage);
    }

    function markSeen(movieId) {
        if (!seenIds.includes(movieId)) seenIds.push(movieId);
        saveSeen();
    }

    function popTop(direction) {
        if (deck.length === 0) return;
        const movie = deck[0];
        const topCard = stage.querySelector('.swipe-card:last-child') || stage.lastElementChild;

        if (topCard) {
            topCard.classList.add(direction === 'right' ? 'flying-right' : direction === 'left' ? 'flying-left' : 'flying-up');
        }

        if (direction === 'right') {
            if (!Watchlist.has(movie.id)) Watchlist.toggle(movie.id);
            showToast('🍃 บันทึก "' + movie.title + '" ไว้ดูแล้ว');
        } else if (direction === 'left') {
            showToast('ข้าม "' + movie.title + '"');
        }

        markSeen(movie.id);
        deck.shift();

        setTimeout(() => {
            renderStage();
        }, direction ? 320 : 0);
    }

    /* ---- Drag / Swipe handling (mouse + touch) ------------------- */
    function attachDrag(card) {
        let startX = 0, startY = 0, curX = 0, curY = 0, dragging = false;

        function onDown(x, y) {
            dragging = true;
            startX = x; startY = y;
            card.classList.add("dragging");
        }
        function onMove(x, y) {
            if (!dragging) return;
            curX = x - startX;
            curY = y - startY;
            const rot = curX * 0.06;
            card.style.transform = `translate(${curX}px, ${curY}px) rotate(${rot}deg)`;

            const saveStamp = card.querySelector('.swipe-stamp-save');
            const skipStamp = card.querySelector('.swipe-stamp-skip');
            const intensity = Math.min(Math.abs(curX) / 100, 1);
            if (curX > 20) { saveStamp.style.opacity = intensity; skipStamp.style.opacity = 0; }
            else if (curX < -20) { skipStamp.style.opacity = intensity; saveStamp.style.opacity = 0; }
            else { saveStamp.style.opacity = 0; skipStamp.style.opacity = 0; }
        }
        function onUp() {
            if (!dragging) return;
            dragging = false;
            card.classList.remove("dragging");

            const threshold = 110;
            if (curX > threshold) {
                popTop('right');
            } else if (curX < -threshold) {
                popTop('left');
            } else if (curY < -threshold && Math.abs(curX) < 60) {
                // ปัดขึ้น = ดูรายละเอียด
                const movieId = card.dataset.movieId;
                window.location.href = `movie-detail.html?id=${movieId}`;
                return;
            } else {
                // สปริงกลับตำแหน่งเดิม
                card.style.transition = "transform 0.35s var(--ease-premium)";
                card.style.transform = "translate(0,0) rotate(0)";
                card.querySelector('.swipe-stamp-save').style.opacity = 0;
                card.querySelector('.swipe-stamp-skip').style.opacity = 0;
                setTimeout(() => { card.style.transition = ""; }, 350);
            }
            curX = 0; curY = 0;
        }

        // Mouse events
        card.addEventListener("mousedown", e => { onDown(e.clientX, e.clientY); e.preventDefault(); });
        window.addEventListener("mousemove", e => onMove(e.clientX, e.clientY));
        window.addEventListener("mouseup", onUp);

        // Touch events
        card.addEventListener("touchstart", e => { const t = e.touches[0]; onDown(t.clientX, t.clientY); }, { passive: true });
        card.addEventListener("touchmove", e => { const t = e.touches[0]; onMove(t.clientX, t.clientY); }, { passive: true });
        card.addEventListener("touchend", onUp);
    }

    /* ---- Control buttons ------------------------------------------ */
    btnSkip.addEventListener("click", () => popTop('left'));
    btnSave.addEventListener("click", () => popTop('right'));
    btnInfo.addEventListener("click", () => {
        if (deck.length === 0) return;
        window.location.href = `movie-detail.html?id=${deck[0].id}`;
    });
    btnRestart.addEventListener("click", () => {
        seenIds = [];
        saveSeen();
        buildDeck();
        renderStage();
    });

    /* ---- Keyboard support ------------------------------------------ */
    document.addEventListener("keydown", e => {
        if (deck.length === 0) return;
        if (e.key === "ArrowRight") popTop('right');
        else if (e.key === "ArrowLeft") popTop('left');
        else if (e.key === "ArrowUp") { window.location.href = `movie-detail.html?id=${deck[0].id}`; }
    });

    /* ---- Init -------------------------------------------------------- */
    buildDeck();
    renderStage();
});
