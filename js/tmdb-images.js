// js/tmdb-images.js — CineMint
// ดึงโปสเตอร์และแบ็คดรอปจริงจาก The Movie Database (TMDB) แบบอัตโนมัติ
//
// ================================ วิธีใช้งาน ================================
// 1. สมัคร TMDB ฟรีที่ https://www.themoviedb.org/signup (ใช้เวลา ~2 นาที)
// 2. ไปที่ Settings > API > Create API Key (เลือก Developer)
// 3. ใส่ API Key ในช่องด้านล่าง แล้วบันทึก — รูปภาพจะโหลดทันที
// ============================================================================

// V1 runs as public browser code. Do not place private credentials in this file.
const TMDB_KEY = ""; // Keep empty in the public static build; use a server-side proxy in V2.

// TMDB CDN: public, ไม่ต้องใช้ key สำหรับโหลดรูป (ต้องการ key เพื่อดึง path เท่านั้น)
const TMDB_IMG = "https://image.tmdb.org/t/p/";

const TMDBImages = (() => {
    const CACHE_KEY  = "cinemint_tmdb_v3";
    const CACHE_DAYS = 30;

    function loadCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            if (Date.now() - (parsed._ts || 0) > CACHE_DAYS * 864e5) return {};
            return parsed;
        } catch { return {}; }
    }

    function saveCache(data) {
        try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ...data, _ts: Date.now() })); }
        catch { /* localStorage เต็ม — ไม่ critical */ }
    }

    // ดึงข้อมูล poster_path + backdrop_path จาก TMDB API สำหรับหนังหนึ่งเรื่อง
    async function fetchMovie(tmdbId, key) {
        const url = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${key}`;
        const res  = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        return {
            poster:   json.poster_path   ? TMDB_IMG + "w500"  + json.poster_path   : null,
            backdrop: json.backdrop_path ? TMDB_IMG + "w1280" + json.backdrop_path : null,
        };
    }

    // ใส่ภาพ (preload ก่อนเพื่อไม่ให้กระพริบ)
    function applyImage(el, url) {
        if (!url || !el) return;
        const probe = new Image();
        probe.onload = () => {
            if (el.tagName === "IMG") {
                el.style.opacity = "0";
                el.src = url;
                el.style.transition = "opacity 0.4s ease";
                setTimeout(() => { el.style.opacity = "1"; }, 30);
                // ถ้ามี placeholder ค้างอยู่ (จากกรณีไม่มี URL สำรองตั้งแต่แรก) ให้เอาออก
                // เพราะตอนนี้มีรูปจริงจาก TMDB API มาแสดงแทนแล้ว
                const placeholder = el.parentElement && el.parentElement.querySelector(".poster-placeholder, .search-thumb-ph");
                if (placeholder) placeholder.remove();
            } else {
                el.style.transition = "background-image 0.4s ease";
                el.style.backgroundImage = `url('${url}')`;
            }
        };
        probe.onerror = () => { /* ภาพโหลดไม่ได้ — คงภาพเดิม */ };
        probe.src = url;
    }

    // โหลดรูปจาก TMDB API แล้ว apply กับทุก element ในหน้า
    async function hydrateAll(root) {
        const apiKey = (TMDB_KEY || "").trim();
        // V1 has no server-side credential proxy. Use the verified image URLs
        // already stored in movies-data.js instead of prompting users to expose a key.
        if (!apiKey) return;

        const scope = root || document;
        const cache = loadCache();
        const updated = { ...cache };
        let changed = false;

        // รวบรวม tmdbId ทั้งหมดที่ต้องการในหน้านี้
        const allEls = [
            ...scope.querySelectorAll("[data-tmdb-id]")
        ];
        const idSet = [...new Set(allEls.map(el => el.dataset.tmdbId).filter(Boolean))];

        await Promise.all(idSet.map(async id => {
            if (!cache[id]) {
                try {
                    const imgs = await fetchMovie(id, apiKey);
                    updated[id] = imgs;
                    changed = true;
                } catch { /* API call ล้มเหลว — ข้ามไป */ }
            }

            const imgs = updated[id] || {};
            // poster elements
            scope.querySelectorAll(`img.js-tmdb-poster[data-tmdb-id="${id}"]`)
                 .forEach(el => imgs.poster && applyImage(el, imgs.poster));
            // backdrop elements
            scope.querySelectorAll(`.js-tmdb-backdrop[data-tmdb-id="${id}"]`)
                 .forEach(el => imgs.backdrop && applyImage(el, imgs.backdrop));
        }));

        if (changed) saveCache(updated);
    }

    return { hydrateAll };
})();
