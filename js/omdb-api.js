// js/omdb-api.js — CineMint × OMDb API
//
// ====================================================================
// เพิ่มคะแนนจากแหล่งอื่น (IMDb, Rotten Tomatoes, Metacritic) ในหน้ารายละเอียดหนัง
// เพื่อให้ผู้ชมเปรียบเทียบกับคะแนนของ MintBot AI ได้ — เพิ่มความน่าเชื่อถือ
// และมุมมองที่รอบด้านมากขึ้นให้กับเว็บไซต์
// ====================================================================
//
// วิธีเปิดใช้งาน (ฟรี, ใช้เวลาไม่ถึง 1 นาที):
//   1. ไปที่ https://www.omdbapi.com/apikey.aspx
//   2. เลือกแบบ FREE (1,000 คำขอ/วัน) แล้วกรอกอีเมลเพื่อรับ API Key ทันที
//   3. เช็คอีเมลแล้วคลิกลิงก์ยืนยัน (สำคัญ — ต้องยืนยันก่อนถึงจะใช้งานได้)
//   4. คัดลอก API Key มาวางแทนค่าว่างด้านล่าง แล้วบันทึกไฟล์
//
// ถ้าไม่ตั้งค่า API Key เว็บไซต์จะยังทำงานได้ปกติ 100% เพียงแต่จะไม่แสดง
// ส่วน "คะแนนจากแหล่งอื่น" ในหน้ารายละเอียดหนังเท่านั้น
//
// เครดิต: ข้อมูลจาก OMDb API (https://www.omdbapi.com) ซึ่งดึงข้อมูลบางส่วนมาจาก IMDb
// ====================================================================

const OMDB_KEY = ""; // <-- ใส่ OMDb API Key ตรงนี้ เช่น "a1b2c3d4"

const OMDbAPI = (() => {
    const CACHE_KEY  = "cinemint_omdb_v1";
    const CACHE_DAYS = 21;

    function isEnabled() {
        return typeof OMDB_KEY === "string" && OMDB_KEY.trim().length >= 6;
    }

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

    // แปลงผลลัพธ์ดิบจาก OMDb ให้เป็นรูปแบบที่ใช้งานง่าย
    function normalize(json) {
        const out = {
            imdbRating: json.imdbRating && json.imdbRating !== "N/A" ? json.imdbRating : null,
            imdbVotes:  json.imdbVotes  && json.imdbVotes  !== "N/A" ? json.imdbVotes  : null,
            imdbID:     json.imdbID || null,
            rottenTomatoes: null,
            metacritic: null,
            awards: json.Awards && json.Awards !== "N/A" ? json.Awards : null,
            boxOffice: json.BoxOffice && json.BoxOffice !== "N/A" ? json.BoxOffice : null,
            rated: json.Rated && json.Rated !== "N/A" ? json.Rated : null,
        };
        (json.Ratings || []).forEach(r => {
            if (r.Source === "Rotten Tomatoes") out.rottenTomatoes = r.Value;
            if (r.Source === "Metacritic") out.metacritic = r.Value.split("/")[0];
        });
        return out;
    }

    async function fetchByTitle(title, year) {
        const url = `https://www.omdbapi.com/?apikey=${OMDB_KEY}&t=${encodeURIComponent(title)}&y=${year}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`OMDb HTTP ${res.status}`);
        const json = await res.json();
        if (json.Response === "False") throw new Error(json.Error || "ไม่พบข้อมูล");
        return normalize(json);
    }

    /** ดึงคะแนนของหนังหนึ่งเรื่อง (เช็คแคชก่อนยิง API จริง) */
    async function getRatings(movie) {
        const cacheKey = movie.id;
        const cache = loadCache();
        if (cache[cacheKey]) return cache[cacheKey];

        const fresh = await fetchByTitle(movie.title, movie.year);
        const updated = loadCache();
        updated[cacheKey] = fresh;
        saveCache(updated);
        return fresh;
    }

    return { isEnabled, getRatings };
})();
window.OMDbAPI = OMDbAPI;
