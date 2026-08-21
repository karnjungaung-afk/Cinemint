// js/watchlist.js — หน้ารายการที่บันทึกไว้ (watchlist.html)
document.addEventListener("DOMContentLoaded", () => {
    const grid       = document.getElementById("watchlist-grid");
    const emptyState = document.getElementById("watchlist-empty");
    const countEl    = document.getElementById("watchlist-page-count");
    const actionsEl  = document.getElementById("watchlist-actions");
    const clearBtn   = document.getElementById("clear-watchlist-btn");

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
                <span class="movie-card-sub">${movie.year} • ${movie.genres[0]}</span>
            </div>
        `;
        return card;
    }

    function render() {
        const movies = Watchlist.getMovies();

        if (countEl) {
            countEl.textContent = movies.length > 0 ? `— ${movies.length} เรื่อง` : '';
        }

        if (movies.length === 0) {
            grid.innerHTML = "";
            emptyState.style.display = "block";
            actionsEl.style.display = "none";
            return;
        }

        emptyState.style.display = "none";
        actionsEl.style.display = "flex";
        grid.innerHTML = "";
        movies.forEach(m => grid.appendChild(createCard(m)));

        // อัปเดตลิงก์เปรียบเทียบให้พาไปหน้า compare.html พร้อม id หนังสูงสุด 3 เรื่องแรก
        const compareLink = actionsEl.querySelector('a[href^="compare.html"]');
        if (compareLink) {
            const ids = movies.slice(0, 3).map(m => m.id).join(',');
            compareLink.href = `compare.html?ids=${ids}`;
        }

        if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(grid);
        if (typeof initScrollReveal === "function") initScrollReveal();
    }

    clearBtn.addEventListener("click", () => {
        if (!confirm("ต้องการล้างรายการที่บันทึกไว้ทั้งหมดใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้")) return;
        Watchlist.getAll().forEach(id => Watchlist.remove(id));
        showToast("ล้างรายการทั้งหมดแล้ว");
        render();
    });

    document.addEventListener("watchlist-changed", render);

    render();
});
