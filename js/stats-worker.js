// js/stats-worker.js — Web Worker สำหรับคำนวณสถิติหนัก (aggregation)
// แยกออกจาก main thread เพื่อไม่ให้หน้าเว็บกระตุกขณะประมวลผลข้อมูล
// รับ movieDatabase ทั้งหมดผ่าน postMessage แล้วส่งผลลัพธ์ที่คำนวณเสร็จกลับไป

self.onmessage = function (e) {
    const movies = e.data.movies || [];

    // ---- 1. Genre counts (สำหรับ Donut Chart) ----
    const genreCounts = {};
    movies.forEach(m => {
        m.genres.forEach(g => { genreCounts[g] = (genreCounts[g] || 0) + 1; });
    });
    const genreEntries = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);

    // ---- 2. Average rating by year (สำหรับ Line Chart) ----
    const byYear = {};
    movies.forEach(m => {
        if (!byYear[m.year]) byYear[m.year] = [];
        byYear[m.year].push(m.rating);
    });
    const years = Object.keys(byYear).map(Number).sort((a, b) => a - b);
    const avgByYear = years.map(y => {
        const arr = byYear[y];
        return arr.reduce((s, r) => s + r, 0) / arr.length;
    });

    // ---- 3. Rating distribution buckets (สำหรับ Histogram) ----
    const buckets = [
        { label: '60-69', min: 60, max: 69 },
        { label: '70-79', min: 70, max: 79 },
        { label: '80-89', min: 80, max: 89 },
        { label: '90-100', min: 90, max: 100 },
    ];
    buckets.forEach(b => {
        b.count = movies.filter(m => m.rating >= b.min && m.rating <= b.max).length;
    });

    // ---- 4. Director counts (สำหรับตาราง) ----
    const directorCounts = {};
    movies.forEach(m => {
        const dirs = m.director.split(',').map(d => d.trim());
        dirs.forEach(d => { directorCounts[d] = (directorCounts[d] || 0) + 1; });
    });
    const directorEntries = Object.entries(directorCounts)
        .filter(([, c]) => c >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    // ---- 5. Summary numbers ----
    const total = movies.length;
    const avgRating = (movies.reduce((s, m) => s + m.rating, 0) / total).toFixed(1);
    const genreCount = Object.keys(genreCounts).length;
    const directorCount = new Set(movies.map(m => m.director)).size;
    const yearSpan = Math.max(...movies.map(m => m.year)) - Math.min(...movies.map(m => m.year));
    const topMovie = [...movies].sort((a, b) => b.rating - a.rating)[0];

    // ส่งผลลัพธ์ที่คำนวณเสร็จทั้งหมดกลับไปที่ main thread
    self.postMessage({
        genreEntries,
        years,
        avgByYear,
        buckets,
        directorEntries,
        summary: { total, avgRating, genreCount, directorCount, yearSpan, topMovie },
    });
};
