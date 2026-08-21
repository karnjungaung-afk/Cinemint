// js/search.js — Real-time search (shared across all pages)
document.addEventListener("DOMContentLoaded", () => {
    const searchInput   = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    if (!searchInput || !searchResults) return;

    function renderResults(query) {
        const q = query.trim().toLowerCase();
        if (!q) { searchResults.classList.remove("active"); searchResults.innerHTML = ""; return; }

        const matches = movieDatabase.filter(m =>
            m.title.toLowerCase().includes(q) ||
            m.director.toLowerCase().includes(q) ||
            m.genres.some(g  => g.toLowerCase().includes(q)) ||
            m.cast.some(c    => c.toLowerCase().includes(q))
        );

        if (!matches.length) {
            searchResults.innerHTML = `<div class="search-empty">ไม่พบหนังที่ตรงกับ "${query}"</div>`;
        } else {
            searchResults.innerHTML = matches.slice(0, 8).map(m => `
                <a href="movie-detail.html?id=${m.id}" class="search-result-item">
                    <div class="search-thumb"
                         data-title="${(m.title||'').replace(/"/g,'&quot;')}"
                         data-year="${m.year}">
                        ${m.poster ? `<img class="js-tmdb-poster"
                             data-tmdb-id="${m.tmdbId}"
                             src="${m.poster}"
                             alt="${m.title}"
                             loading="lazy"
                             onerror="handleImgError(this)">` : `<img class="js-tmdb-poster" data-tmdb-id="${m.tmdbId}" alt="${m.title}" loading="lazy" style="opacity:0" onerror="handleImgError(this)"><div class="search-thumb-ph">🎬</div>`}
                    </div>
                    <div class="search-result-info">
                        <strong>${m.title}</strong>
                        <span>${m.year} • ⭐ ${m.rating}</span>
                    </div>
                </a>
            `).join('');
            if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(searchResults);
        }
        searchResults.classList.add("active");
    }

    searchInput.addEventListener("input",  e => renderResults(e.target.value));
    searchInput.addEventListener("focus",  e => { if (e.target.value) renderResults(e.target.value); });
    document.addEventListener("click", e => {
        if (!e.target.closest(".search-bar")) searchResults.classList.remove("active");
    });
    searchInput.addEventListener("keydown", e => {
        if (e.key === "Escape") { searchResults.classList.remove("active"); searchInput.blur(); }
    });
});
