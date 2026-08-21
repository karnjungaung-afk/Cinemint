// js/compare.js — หน้าเปรียบเทียบหนัง (compare.html)
document.addEventListener("DOMContentLoaded", () => {
    const MAX_SLOTS = 3;
    const picker      = document.getElementById("compare-picker");
    const tableWrap    = document.getElementById("compare-table-wrap");
    const table        = document.getElementById("compare-table");
    const emptyState   = document.getElementById("compare-empty");
    const modal        = document.getElementById("picker-modal");
    const modalBackdrop= document.getElementById("picker-modal-backdrop");
    const modalList     = document.getElementById("picker-modal-list");
    const modalSearch   = document.getElementById("picker-search");
    const modalClose    = document.getElementById("picker-close");

    let slots = [null, null, null]; // เก็บ movie object หรือ null
    let activeSlotIdx = null;

    // รองรับ URL เช่น compare.html?ids=parasite,oppenheimer
    function loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const ids = (params.get("ids") || "").split(",").map(s => s.trim()).filter(Boolean);
        ids.slice(0, MAX_SLOTS).forEach((id, i) => {
            const m = movieDatabase.find(x => x.id === id);
            if (m) slots[i] = m;
        });
    }

    function posterTag(movie) {
        return posterImgTag(movie);
    }

    /* ---- Picker Slots (บนสุดของหน้า) --------------------------- */
    function renderPicker() {
        picker.innerHTML = slots.map((movie, i) => {
            if (movie) {
                return `
                    <div class="compare-slot filled">
                        <button type="button" class="compare-slot-remove" onclick="window.__compareRemove(${i})" aria-label="เอาออก">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <div class="compare-slot-poster"
                             data-title="${(movie.title||'').replace(/"/g,'&quot;')}"
                             data-year="${movie.year}">
                            ${posterTag(movie)}
                        </div>
                        <strong>${movie.title}</strong>
                        <span>${movie.year}</span>
                    </div>
                `;
            }
            return `
                <button type="button" class="compare-slot empty" onclick="window.__compareOpenPicker(${i})">
                    <i class="fa-solid fa-plus"></i>
                    <span>เลือกหนัง</span>
                </button>
            `;
        }).join('');

        if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(picker);
    }

    /* ---- Comparison Table ---------------------------------------- */
    const ROWS = [
        { key: 'rating',   label: 'คะแนน MintBot AI', render: m => `<div class="rating-leaf sm"><span>${m.rating}</span></div>` },
        { key: 'year',     label: 'ปีที่ฉาย', render: m => m.year },
        { key: 'duration', label: 'ความยาว', render: m => m.duration },
        { key: 'director', label: 'ผู้กำกับ', render: m => m.director },
        { key: 'genres',   label: 'แนวหนัง', render: m => m.genres.join(', ') },
        { key: 'cast',     label: 'นักแสดงนำ', render: m => m.cast.slice(0,3).join('<br>') },
        { key: 'pros',     label: 'จุดเด่น', render: m => `<ul class="compare-list pros">${m.pros.map(p=>`<li>${p}</li>`).join('')}</ul>` },
        { key: 'cons',     label: 'จุดด้อย', render: m => `<ul class="compare-list cons">${m.cons.map(c=>`<li>${c}</li>`).join('')}</ul>` },
    ];

    function renderTable() {
        const filled = slots.filter(Boolean);
        if (filled.length < 2) {
            tableWrap.style.display = "none";
            emptyState.style.display = "block";
            return;
        }
        tableWrap.style.display = "block";
        emptyState.style.display = "none";

        // หาคะแนนสูงสุดเพื่อไฮไลท์
        const maxRating = Math.max(...filled.map(m => m.rating));

        let html = `<div class="compare-grid" style="--cols:${filled.length}">`;

        // Header row: โปสเตอร์ + ชื่อ
        html += `<div class="compare-row compare-row-header">
            <div class="compare-label-cell"></div>
            ${filled.map(m => `
                <div class="compare-header-cell ${m.rating === maxRating ? 'winner' : ''}">
                    <div class="compare-header-poster"
                         data-title="${(m.title||'').replace(/"/g,'&quot;')}"
                         data-year="${m.year}">
                        ${posterTag(m)}
                        ${m.rating === maxRating ? '<span class="winner-badge">🏆 คะแนนสูงสุด</span>' : ''}
                    </div>
                    <a href="movie-detail.html?id=${m.id}" class="compare-header-title">${m.title}</a>
                </div>
            `).join('')}
        </div>`;

        ROWS.forEach(row => {
            html += `<div class="compare-row">
                <div class="compare-label-cell">${row.label}</div>
                ${filled.map(m => `<div class="compare-value-cell">${row.render(m)}</div>`).join('')}
            </div>`;
        });

        html += `</div>`;
        table.innerHTML = html;

        if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(table);
    }

    function renderAll() {
        renderPicker();
        renderTable();
        updateUrl();
    }

    function updateUrl() {
        const ids = slots.filter(Boolean).map(m => m.id);
        const url = ids.length ? `compare.html?ids=${ids.join(',')}` : 'compare.html';
        window.history.replaceState(null, '', url);
    }

    /* ---- Modal picker ---------------------------------------------- */
    function openPicker(slotIdx) {
        activeSlotIdx = slotIdx;
        modal.classList.add("active");
        modalSearch.value = "";
        renderModalList("");
        setTimeout(() => modalSearch.focus(), 100);
    }
    function closePicker() {
        modal.classList.remove("active");
        activeSlotIdx = null;
    }
    function renderModalList(query) {
        const q = query.trim().toLowerCase();
        const selectedIds = slots.filter(Boolean).map(m => m.id);
        let movies = movieDatabase.filter(m => !selectedIds.includes(m.id));
        if (q) {
            movies = movies.filter(m =>
                m.title.toLowerCase().includes(q) ||
                m.director.toLowerCase().includes(q) ||
                m.genres.some(g => g.toLowerCase().includes(q))
            );
        }
        movies = movies.sort((a,b) => b.rating - a.rating).slice(0, 30);

        modalList.innerHTML = movies.map(m => `
            <button type="button" class="picker-item" onclick="window.__compareSelect('${m.id}')">
                <div class="picker-item-poster"
                     data-title="${(m.title||'').replace(/"/g,'&quot;')}"
                     data-year="${m.year}">
                    ${posterTag(m)}
                </div>
                <div class="picker-item-info">
                    <strong>${m.title}</strong>
                    <span>${m.year} • ${m.genres[0]} • ⭐ ${m.rating}</span>
                </div>
            </button>
        `).join('') || `<div class="search-empty">ไม่พบหนังที่ตรงกับการค้นหา</div>`;

        if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(modalList);
    }

    modalSearch.addEventListener("input", e => renderModalList(e.target.value));
    modalClose.addEventListener("click", closePicker);
    modalBackdrop.addEventListener("click", closePicker);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closePicker(); });

    /* ---- Global handlers (เรียกจาก inline onclick) ---------------- */
    window.__compareOpenPicker = openPicker;
    window.__compareRemove = function(idx) {
        slots[idx] = null;
        renderAll();
    };
    window.__compareSelect = function(movieId) {
        const movie = movieDatabase.find(m => m.id === movieId);
        if (!movie || activeSlotIdx === null) return;
        slots[activeSlotIdx] = movie;
        closePicker();
        renderAll();
    };

    /* ---- Init -------------------------------------------------------- */
    loadFromUrl();
    renderAll();
});
