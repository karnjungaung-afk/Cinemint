// js/now-showing.js — หน้ากำลังฉาย (now-showing.html)
document.addEventListener("DOMContentLoaded", () => {
    const MONTHS = { "ม.ค.":0,"ก.พ.":1,"มี.ค.":2,"เม.ย.":3,"พ.ค.":4,"มิ.ย.":5,
                     "ก.ค.":6,"ส.ค.":7,"ก.ย.":8,"ต.ค.":9,"พ.ย.":10,"ธ.ค.":11 };

    function parseDate(str) {
        const p = String(str).trim().split(" ");
        if (p.length !== 3) return new Date(0);
        return new Date(parseInt(p[2]), MONTHS[p[1]] ?? 0, parseInt(p[0]) || 1);
    }

    function createCard(movie) {
        const card = document.createElement("a");
        card.href = `movie-detail.html?id=${movie.id}`;
        card.className = "movie-card grid-card reveal-on-scroll";
        card.innerHTML = `
            <div class="poster-frame"
                 data-title="${(movie.title||'').replace(/"/g,'&quot;')}"
                 data-year="${movie.year}">
                ${posterImgTag(movie)}
                ${bookmarkBtnHtml(movie.id)}
            </div>
            <div class="movie-card-info">
                <div class="movie-card-title-row">
                    <strong>${movie.title}</strong>
                    <div class="rating-leaf sm"><span>${movie.rating}</span></div>
                </div>
                <span class="movie-card-sub">${movie.year} • ${movie.genres[0]} • ${movie.releaseDate}</span>
            </div>
        `;
        return card;
    }

    const grid  = document.getElementById("now-showing-grid");
    const label = document.getElementById("now-showing-count");
    const sortBtns = [...document.querySelectorAll(".sort-btn")];

    function render(mode) {
        let movies = [...movieDatabase];
        if (mode === "rating") movies.sort((a, b) => b.rating - a.rating);
        else if (mode === "title") movies.sort((a, b) => a.title.localeCompare(b.title));
        else movies.sort((a, b) => parseDate(b.releaseDate) - parseDate(a.releaseDate));

        grid.innerHTML = "";
        movies.forEach(m => grid.appendChild(createCard(m)));
        if (label) label.textContent = `ทั้งหมด ${movies.length} เรื่อง`;
        if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(grid);
        if (typeof initScrollReveal === "function") initScrollReveal();
    }

    sortBtns.forEach(btn => btn.addEventListener("click", () => {
        sortBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        render(btn.dataset.sort);
    }));

    render("latest");
});
