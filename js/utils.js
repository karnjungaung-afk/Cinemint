// js/utils.js — CineMint Shared Utilities
// โหลดไฟล์นี้ก่อน JS อื่นๆ ในทุกหน้า

// -------------------------------------------------------
// handleImgError — เรียกจาก onerror ของ <img> ทุกตัว
// เมื่อ TMDB CDN โหลดไม่สำเร็จ จะแสดง placeholder
// ที่มีชื่อหนังและปีแทน (ดีกว่ากรอบว่างเปล่า)
// -------------------------------------------------------
window.handleImgError = function(img) {
    if (img.dataset.errHandled) return;
    img.dataset.errHandled = "1";

    const frame = img.closest('.poster-frame, .detail-poster-frame');
    if (!frame) { img.style.opacity = '0'; return; }

    img.style.display = 'none';
    if (frame.querySelector('.poster-placeholder')) return;

    const title = frame.dataset.title || '';
    const year  = frame.dataset.year  || '';
    const ph = document.createElement('div');
    ph.className = 'poster-placeholder';
    ph.innerHTML = `
        <div class="poster-ph-icon">🎬</div>
        ${title ? `<div class="poster-ph-title">${title}</div>` : ''}
        ${year  ? `<div class="poster-ph-year">${year}</div>`   : ''}
    `;
    frame.appendChild(ph);
};

// -------------------------------------------------------
// applyBackdrop — ระบบ Backdrop 3 ชั้น กัน "พื้นหลังว่างเปล่า"
//   1) พยายามโหลด movie.backdrop ก่อน (ภาพ landscape จริง)
//   2) ถ้าล้มเหลว ลองใช้ movie.poster แทน (portrait, ครอบด้วย blur+scale)
//   3) ถ้าล้มเหลวทั้งคู่ ใช้ gradient scene ที่สร้างจากแนวหนัง (genre) แทน
// เนื่องจาก CSS background-image ไม่มี onerror event ในตัว จึงต้อง
// preload ด้วย JS Image() object ก่อนเสมอ
// -------------------------------------------------------
const GENRE_HUES = {
    "Action": 355, "Adventure": 28, "Animation": 190, "Biography": 45,
    "Black Comedy": 280, "Comedy": 48, "Courtroom": 210, "Crime": 0,
    "Drama": 260, "Family": 150, "Fantasy": 270, "History": 35,
    "Horror": 5, "Music": 320, "Musical": 330, "Mystery": 245,
    "Romance": 340, "Sci-Fi": 195, "Sport": 130, "Survival": 90,
    "Thriller": 225, "War": 20, "Western": 30
};

function genreGradient(genres) {
    const g = (genres && genres[0]) || "Drama";
    const hue = GENRE_HUES[g] !== undefined ? GENRE_HUES[g] : 160;
    return `radial-gradient(circle at 75% 30%, hsl(${hue},45%,16%) 0%, transparent 55%),
            linear-gradient(160deg, hsl(${hue},30%,9%) 0%, #0a0e0c 65%)`;
}

window.applyBackdrop = function(el, movie) {
    if (!el || !movie) return;

    function preload(src) {
        return new Promise(resolve => {
            if (!src) { resolve(null); return; }
            const probe = new Image();
            const timer = setTimeout(() => resolve(null), 7000);
            probe.onload  = () => { clearTimeout(timer); resolve(src); };
            probe.onerror = () => { clearTimeout(timer); resolve(null); };
            probe.src = src;
        });
    }

    el.classList.add('backdrop-loading');

    preload(movie.backdrop).then(bd => {
        if (bd) {
            el.style.backgroundImage = `url('${bd}')`;
            el.classList.remove('backdrop-loading', 'backdrop-fallback', 'backdrop-from-poster');
            return;
        }
        // ชั้นที่ 2: ใช้โปสเตอร์แทน (blur + scale ให้ดูเป็นฉากหลังได้)
        preload(movie.poster).then(pos => {
            if (pos) {
                el.style.backgroundImage = `url('${pos}')`;
                el.classList.add('backdrop-from-poster');
                el.classList.remove('backdrop-loading', 'backdrop-fallback');
                return;
            }
            // ชั้นที่ 3: gradient scene ตามแนวหนัง
            el.style.backgroundImage = genreGradient(movie.genres);
            el.classList.add('backdrop-fallback');
            el.classList.remove('backdrop-loading', 'backdrop-from-poster');
        });
    });
};

// -------------------------------------------------------
// embedToWatch — แปลง YouTube embed URL → watch URL
// -------------------------------------------------------
window.embedToWatch = function(embedUrl) {
    const m = (embedUrl || '').match(/embed\/([^?&/]+)/);
    return m ? `https://www.youtube.com/watch?v=${m[1]}` : embedUrl;
};

// -------------------------------------------------------
// posterImgTag — สร้าง <img> สำหรับโปสเตอร์ ใช้ร่วมกันทุกหน้า
// -------------------------------------------------------
window.posterImgTag = function(movie) {
    const title = (movie.title || '').replace(/"/g, '&quot;');
    const year  = movie.year || '';
    const hasPoster = movie.poster && movie.poster.trim().length > 0;

    if (!hasPoster) {
        // ไม่มี URL โปสเตอร์สำรอง (เช่น หนังใหม่ที่ยังไม่ได้ยืนยัน path)
        // แสดง placeholder ทันทีโดยไม่ต้องรอ onerror (ซึ่ง src="" ทำงานไม่แน่นอนในบางเบราว์เซอร์)
        // แต่ยังคง <img> ที่มี data-tmdb-id ไว้ (ซ่อนอยู่) เผื่อ TMDB API hydration เติมรูปจริงเข้ามาทีหลัง
        return `<img class="js-tmdb-poster" data-tmdb-id="${movie.tmdbId}"
                     alt="${title}" loading="lazy" style="opacity:0"
                     onerror="handleImgError(this)">
                <div class="poster-placeholder">
                    <div class="poster-ph-icon">🎬</div>
                    ${title ? `<div class="poster-ph-title">${title}</div>` : ''}
                    ${year  ? `<div class="poster-ph-year">${year}</div>`   : ''}
                </div>`;
    }

    return `<img class="js-tmdb-poster"
                 data-tmdb-id="${movie.tmdbId}"
                 src="${movie.poster}"
                 alt="${title}"
                 loading="lazy"
                 onerror="handleImgError(this)">`;
};

// =========================================================
// Watchlist — บันทึกหนังที่สนใจไว้ดูภายหลัง (localStorage)
// =========================================================
const Watchlist = (() => {
    const KEY = "cinemint_watchlist_v1";

    function getAll() {
        try {
            const raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }

    function save(list) {
        try { localStorage.setItem(KEY, JSON.stringify(list)); }
        catch { /* localStorage เต็มหรือถูกปิด */ }
    }

    function has(movieId) {
        return getAll().includes(movieId);
    }

    function toggle(movieId) {
        let list = getAll();
        const idx = list.indexOf(movieId);
        if (idx >= 0) {
            list.splice(idx, 1);
        } else {
            list.push(movieId);
        }
        save(list);
        document.dispatchEvent(new CustomEvent('watchlist-changed', { detail: { movieId, added: idx < 0 } }));
        return idx < 0; // true = เพิ่งเพิ่มเข้าไป
    }

    function remove(movieId) {
        let list = getAll().filter(id => id !== movieId);
        save(list);
        document.dispatchEvent(new CustomEvent('watchlist-changed', { detail: { movieId, added: false } }));
    }

    function count() { return getAll().length; }

    function getMovies() {
        if (typeof movieDatabase === "undefined") return [];
        const ids = getAll();
        return ids.map(id => movieDatabase.find(m => m.id === id)).filter(Boolean);
    }

    return { getAll, has, toggle, remove, count, getMovies };
})();
window.Watchlist = Watchlist;

// -------------------------------------------------------
// bookmarkBtnHtml — ปุ่มบุ๊คมาร์ครูปหัวใจ ใช้แปะบนการ์ดหนัง
// -------------------------------------------------------
window.bookmarkBtnHtml = function(movieId) {
    const active = Watchlist.has(movieId);
    return `<button type="button"
                class="bookmark-btn ${active ? 'active' : ''}"
                data-movie-id="${movieId}"
                aria-label="บันทึกลงรายการที่ต้องการดู"
                onclick="event.preventDefault(); event.stopPropagation(); toggleBookmark(this)">
                <i class="fa-solid fa-bookmark"></i>
            </button>`;
};

window.toggleBookmark = function(btn) {
    const id = btn.dataset.movieId;
    const added = Watchlist.toggle(id);
    btn.classList.toggle('active', added);
    // เล่นแอนิเมชัน pop
    btn.classList.remove('pop');
    void btn.offsetWidth; // force reflow
    btn.classList.add('pop');
    if (typeof showToast === 'function') {
        showToast(added ? '🍃 เพิ่มลงรายการที่ต้องการดูแล้ว' : 'ลบออกจากรายการแล้ว');
    }
};

// -------------------------------------------------------
// showToast — แจ้งเตือนเล็กๆ มุมล่างขวา
// -------------------------------------------------------
window.showToast = function(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 350);
    }, 2600);
};

// =========================================================
// Scroll Reveal — เลื่อนแล้วค่อยๆ ปรากฏ (Intersection Observer)
// =========================================================
window.initScrollReveal = function(selector) {
    const els = document.querySelectorAll(selector || '.reveal-on-scroll');
    if (!els.length || !('IntersectionObserver' in window)) {
        els.forEach(el => el.classList.add('revealed'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
};

// =========================================================
// Header Watchlist Badge — inject ปุ่มบุ๊คมาร์คพร้อมตัวเลขนับใน header
// เรียกอัตโนมัติเมื่อ DOM โหลดเสร็จทุกหน้า (ถ้ามี header อยู่)
// =========================================================
document.addEventListener("DOMContentLoaded", function() {
    var header = document.querySelector("header");
    if (!header || document.getElementById("watchlist-nav-btn")) return;

    var searchBar = header.querySelector(".search-bar");
    var btn = document.createElement("a");
    btn.href = "watchlist.html";
    btn.id = "watchlist-nav-btn";
    btn.className = "watchlist-nav-btn";
    btn.setAttribute("aria-label", "รายการที่บันทึกไว้");
    btn.innerHTML = '<i class="fa-solid fa-bookmark"></i><span class="watchlist-count-badge" id="watchlist-count-badge"></span>';

    if (searchBar) {
        header.insertBefore(btn, searchBar);
    } else {
        header.appendChild(btn);
    }

    function updateBadge() {
        var badge = document.getElementById("watchlist-count-badge");
        if (!badge) return;
        var n = (typeof Watchlist !== "undefined") ? Watchlist.count() : 0;
        badge.textContent = n > 0 ? n : "";
        badge.style.display = n > 0 ? "flex" : "none";
    }
    updateBadge();
    document.addEventListener("watchlist-changed", updateBadge);

    //audio
    const audio = document.getElementById('bg-audio');
    const audioBtn = document.getElementById('audio-toggle-btn');
    const audioIcon = document.getElementById('audio-icon');

    if (!audio || !audioBtn) return;

    audio.volume = 0.5;

    audioBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play().then(() => {
                audioIcon.textContent = '🔊';
                audioBtn.classList.add('playing');
            }).catch(err => {
                console.error('ไม่สามารถเล่นเสียงได้:', err);
                alert('เกิดข้อผิดพลาดในการโหลดไฟล์เสียง กรุณาตรวจสอบ Console (F12)');
            });
        } else {
            audio.pause();
            audioIcon.textContent = '🔇';
            audioBtn.classList.remove('playing');
        }
    });
});

// =========================================================
// View Transition helper — เปลี่ยนหน้าแบบ fade ด้วย View Transitions API
// (เบราว์เซอร์ที่ไม่รองรับจะ fallback ไปที่การนำทางปกติโดยอัตโนมัติ)
// =========================================================
window.navigateWithTransition = function(url) {
    if (document.startViewTransition) {
        document.startViewTransition(function() { window.location.href = url; });
    } else {
        window.location.href = url;
    }
};
