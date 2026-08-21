// js/tierlist.js — หน้า Tier List (tierlist.html)
// จัดกลุ่มภาพยนตร์ทั้งหมดเป็นระดับ S/A/B/C/D ตามคะแนน MintBot AI
// ใช้ <ol> (ordered list) แสดงลำดับหนังภายในแต่ละ Tier ตามคะแนนจากมากไปน้อย
// รองรับโหมด "จัดเรียงเอง" ด้วย HTML5 Drag and Drop API — ผู้ใช้ลากการ์ดหนัง
// ข้าม Tier ได้ตามใจชอบ และบันทึกการจัดเรียงส่วนตัวไว้ใน localStorage
document.addEventListener("DOMContentLoaded", () => {

    const TIERS = [
        { key: 'S', label: 'S', name: 'มาสเตอร์พีซ', min: 90, max: 100, cls: 'tier-s' },
        { key: 'A', label: 'A', name: 'ยอดเยี่ยม',   min: 80, max: 89,  cls: 'tier-a' },
        { key: 'B', label: 'B', name: 'ดี',          min: 70, max: 79,  cls: 'tier-b' },
        { key: 'C', label: 'C', name: 'พอใช้',        min: 60, max: 69,  cls: 'tier-c' },
        { key: 'D', label: 'D', name: 'ผ่าน',         min: 0,  max: 59,  cls: 'tier-d' },
    ];
    const TIER_KEYS = TIERS.map(t => t.key);

    const wrap        = document.getElementById("tierlist-wrap");
    const chips        = document.getElementById("tier-genre-chips");
    const allGenres     = [...new Set(movieDatabase.flatMap(m => m.genres))].sort();

    /* ================================================================
       Custom Tier Overrides — เก็บการจัดเรียงส่วนตัวของผู้ใช้ไว้ใน localStorage
       รูปแบบ: { "movie-id": "S" }  — ถ้าไม่มี key ของหนังเรื่องไหน จะใช้ tier
       ที่คำนวณอัตโนมัติจากคะแนนแทน
       ================================================================ */
    const CUSTOM_KEY = "cinemint_custom_tiers_v1";
    let customMode = false;

    function loadOverrides() {
        try {
            const raw = localStorage.getItem(CUSTOM_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    }
    function saveOverrides(overrides) {
        try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(overrides)); }
        catch { /* localStorage เต็มหรือถูกปิด — ไม่ critical */ }
    }
    let overrides = loadOverrides();

    function autoTierOf(movie) {
        return TIERS.find(t => movie.rating >= t.min && movie.rating <= t.max).key;
    }
    function tierOf(movie) {
        return overrides[movie.id] || autoTierOf(movie);
    }

    function posterTag(movie) {
        return posterImgTag(movie);
    }

    function buildChips() {
        chips.innerHTML = ["ทั้งหมด", ...allGenres].map((g, i) =>
            `<button class="genre-chip ${i===0?'active':''}" data-genre="${g}">${g}</button>`
        ).join('');
    }

    let currentGenreFilter = "ทั้งหมด";

    function render() {
        let movies = [...movieDatabase];
        if (currentGenreFilter && currentGenreFilter !== "ทั้งหมด") {
            movies = movies.filter(m => m.genres.includes(currentGenreFilter));
        }

        wrap.innerHTML = "";

        TIERS.forEach((tier, tierIdx) => {
            const tierMovies = movies
                .filter(m => tierOf(m) === tier.key)
                .sort((a, b) => b.rating - a.rating);

            const row = document.createElement("div");
            row.className = `tier-row ${tier.cls} reveal-on-scroll`;
            row.style.transitionDelay = `${tierIdx * 0.06}s`;
            row.dataset.tierKey = tier.key;

            const listItems = tierMovies.map((m, i) => `
                <li class="tier-item ${customMode ? 'draggable' : ''}"
                    data-movie-id="${m.id}"
                    ${customMode ? 'draggable="true"' : ''}>
                    <a href="movie-detail.html?id=${m.id}" ${customMode ? 'onclick="return false;" tabindex="-1"' : ''}>
                        <div class="tier-item-poster"
                             data-title="${(m.title||'').replace(/"/g,'&quot;')}"
                             data-year="${m.year}">
                            ${posterTag(m)}
                            ${!customMode ? bookmarkBtnHtml(m.id) : ''}
                            <span class="tier-item-rank">#${i+1}</span>
                            ${customMode ? '<span class="tier-drag-hint"><i class="fa-solid fa-up-down-left-right"></i></span>' : ''}
                        </div>
                        <div class="tier-item-title">${m.title}</div>
                        <div class="tier-item-score">${m.rating}</div>
                    </a>
                </li>
            `).join('');

            row.innerHTML = `
                <div class="tier-label-col">
                    <div class="tier-badge">${tier.label}</div>
                    <div class="tier-badge-name">${tier.name}</div>
                    <div class="tier-badge-count">${tierMovies.length} เรื่อง</div>
                </div>
                <div class="tier-items-col">
                    ${tierMovies.length > 0
                        ? `<ol class="tier-item-list" data-tier-key="${tier.key}">${listItems}</ol>`
                        : `<ol class="tier-item-list tier-item-list-empty" data-tier-key="${tier.key}"><div class="tier-empty-msg">ไม่มีภาพยนตร์ในระดับนี้${currentGenreFilter!=="ทั้งหมด" ? ` สำหรับแนว "${currentGenreFilter}"` : ''}${customMode ? ' — ลากการ์ดมาวางที่นี่ได้' : ''}</div></ol>`
                    }
                </div>
            `;
            wrap.appendChild(row);
        });

        if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(wrap);
        if (typeof initScrollReveal === "function") initScrollReveal();

        if (customMode) attachDragHandlers();
    }

    /* ================================================================
       HTML5 Drag and Drop API
       ================================================================ */
    function attachDragHandlers() {
        // ทุกการ์ดหนังที่ลากได้: dragstart ใส่ movie id ลงใน dataTransfer
        wrap.querySelectorAll(".tier-item[draggable='true']").forEach(item => {
            item.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", item.dataset.movieId);
                e.dataTransfer.effectAllowed = "move";
                setTimeout(() => item.classList.add("dragging"), 0);
            });
            item.addEventListener("dragend", () => {
                item.classList.remove("dragging");
                wrap.querySelectorAll(".tier-item-list").forEach(l => l.classList.remove("drag-over"));
            });
        });

        // ทุก Tier row เป็นพื้นที่วาง (drop zone)
        wrap.querySelectorAll(".tier-item-list").forEach(list => {
            list.addEventListener("dragover", (e) => {
                e.preventDefault(); // จำเป็นเพื่ออนุญาตให้ drop ได้
                e.dataTransfer.dropEffect = "move";
                list.classList.add("drag-over");
            });
            list.addEventListener("dragleave", () => {
                list.classList.remove("drag-over");
            });
            list.addEventListener("drop", (e) => {
                e.preventDefault();
                list.classList.remove("drag-over");
                const movieId = e.dataTransfer.getData("text/plain");
                const targetTier = list.dataset.tierKey;
                if (!movieId || !targetTier || !TIER_KEYS.includes(targetTier)) return;

                const movie = movieDatabase.find(m => m.id === movieId);
                if (!movie) return;

                // ถ้าลากไปวางใน Tier ที่ตรงกับค่าอัตโนมัติอยู่แล้ว ให้ลบ override ออก
                // (กลับไปใช้ค่าที่คำนวณจากคะแนนแทน เพื่อไม่ให้ localStorage บวมโดยไม่จำเป็น)
                if (targetTier === autoTierOf(movie)) {
                    delete overrides[movieId];
                } else {
                    overrides[movieId] = targetTier;
                }
                saveOverrides(overrides);
                showToast(`🍃 ย้าย "${movie.title}" ไปที่ Tier ${targetTier} แล้ว`);
                render();
            });
        });
    }

    /* ================================================================
       Custom Mode Toggle + Reset
       ================================================================ */
    function buildModeControls() {
        const controls = document.createElement("div");
        controls.className = "tier-mode-controls";
        controls.innerHTML = `
            <button type="button" id="tier-custom-toggle" class="btn-outline ${customMode ? 'active' : ''}">
                <i class="fa-solid fa-hand-pointer"></i>
                <span>${customMode ? 'กำลังจัดเรียงเอง — กดเพื่อออก' : 'โหมดจัดเรียงเอง'}</span>
            </button>
            <button type="button" id="tier-reset-btn" class="btn-outline btn-danger-outline" style="${Object.keys(overrides).length ? '' : 'display:none;'}">
                <i class="fa-solid fa-rotate-right"></i> รีเซ็ตเป็นค่าอัตโนมัติ
            </button>
            <span class="tier-mode-hint">${customMode ? 'ลากการ์ดหนังข้าม Tier เพื่อจัดอันดับตามใจคุณ' : ''}</span>
        `;
        chips.insertAdjacentElement("afterend", controls);

        document.getElementById("tier-custom-toggle").addEventListener("click", () => {
            customMode = !customMode;
            document.querySelectorAll(".tier-mode-controls").forEach(c => c.remove());
            buildModeControls();
            render();
        });

        const resetBtn = document.getElementById("tier-reset-btn");
        resetBtn.addEventListener("click", () => {
            if (!confirm("ต้องการล้างการจัดเรียงที่กำหนดเองทั้งหมด และกลับไปใช้ค่าอัตโนมัติตามคะแนนใช่หรือไม่?")) return;
            overrides = {};
            saveOverrides(overrides);
            showToast("รีเซ็ตเป็นค่าอัตโนมัติแล้ว");
            document.querySelectorAll(".tier-mode-controls").forEach(c => c.remove());
            buildModeControls();
            render();
        });
    }

    buildChips();
    buildModeControls();

    chips.addEventListener("click", e => {
        const chip = e.target.closest(".genre-chip");
        if (!chip) return;
        [...chips.querySelectorAll(".genre-chip")].forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        currentGenreFilter = chip.dataset.genre;
        render();
    });

    render();
});
