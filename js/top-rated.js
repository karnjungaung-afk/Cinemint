// js/top-rated.js — หน้าคะแนนสูงสุด & แนวหนัง (top-rated.html)
document.addEventListener("DOMContentLoaded", () => {

    function createCard(movie, rank) {
        const card = document.createElement("a");
        card.href = `movie-detail.html?id=${movie.id}`;
        card.className = "movie-card grid-card reveal-on-scroll";
        card.innerHTML = `
            <div class="poster-frame"
                 data-title="${(movie.title||'').replace(/"/g,'&quot;')}"
                 data-year="${movie.year}">
                ${rank ? `<span class="rank-badge">#${rank}</span>` : ""}
                ${posterImgTag(movie)}
                ${bookmarkBtnHtml(movie.id)}
            </div>
            <div class="movie-card-info">
                <div class="movie-card-title-row">
                    <strong>${movie.title}</strong>
                    <div class="rating-leaf sm"><span>${movie.rating}</span></div>
                </div>
                <span class="movie-card-sub">${movie.year} • ${movie.genres.join(', ')}</span>
            </div>
        `;
        return card;
    }

    const grid   = document.getElementById("top-rated-grid");
    const label  = document.getElementById("top-rated-count");
    const chips  = document.getElementById("genre-chips");

    const allGenres = [...new Set(movieDatabase.flatMap(m => m.genres))].sort();

    function buildChips() {
        chips.innerHTML = ["ทั้งหมด", ...allGenres].map((g, i) =>
            `<button class="genre-chip ${i===0?'active':''}" data-genre="${g}">${g}</button>`
        ).join('');
    }

    function render(genre) {
        let movies = [...movieDatabase].sort((a, b) => b.rating - a.rating);
        if (genre && genre !== "ทั้งหมด") movies = movies.filter(m => m.genres.includes(genre));

        grid.innerHTML = "";
        if (!movies.length) {
            grid.innerHTML = `<div class="search-empty" style="grid-column:1/-1;padding:60px 0">ไม่พบหนังในแนวนี้</div>`;
        } else {
            const showRank = !genre || genre === "ทั้งหมด";
            movies.forEach((m, i) => grid.appendChild(createCard(m, showRank ? i+1 : null)));
        }
        if (label) label.textContent = genre && genre !== "ทั้งหมด"
            ? `แนว "${genre}" — ${movies.length} เรื่อง`
            : `จัดอันดับทั้งหมด ${movies.length} เรื่อง`;
        if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(grid);
        if (typeof initScrollReveal === "function") initScrollReveal();
    }

    buildChips();

    chips.addEventListener("click", e => {
        const chip = e.target.closest(".genre-chip");
        if (!chip) return;
        [...chips.querySelectorAll(".genre-chip")].forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        render(chip.dataset.genre);
    });

    // รองรับ ?genre=Horror จาก URL
    const preset = new URLSearchParams(window.location.search).get("genre");
    if (preset && allGenres.includes(preset)) {
        const target = chips.querySelector(`.genre-chip[data-genre="${preset}"]`);
        if (target) {
            [...chips.querySelectorAll(".genre-chip")].forEach(c => c.classList.remove("active"));
            target.classList.add("active");
            target.scrollIntoView({ block:"nearest", inline:"center" });
        }
        render(preset);
    } else {
        render("ทั้งหมด");
    }
});
