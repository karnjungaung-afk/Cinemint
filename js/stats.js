// js/stats.js — หน้าสถิติและข้อมูลเชิงลึก (stats.html)
// สร้างกราฟทั้งหมดด้วย native SVG ล้วนๆ ไม่พึ่งพา Chart Library ภายนอก
document.addEventListener("DOMContentLoaded", () => {

    const GENRE_COLORS = [
        "#98ffdb", "#5fcfa8", "#ff6b6b", "#ffb84d", "#7ec8ff",
        "#c792ea", "#ffd93d", "#6bffb8", "#ff8fab", "#a0e8af",
        "#89c4f4", "#f7a072", "#b8b8ff", "#ffcf9c", "#8ecae6",
        "#e9c46a", "#f4a261", "#e76f51", "#2a9d8f", "#264653",
        "#adb5bd", "#e0aaff", "#caffbf"
    ];

    /* ── 1. Summary Cards ─────────────────────────────────────────── */
    function renderSummary(precomputed) {
        let total, avgRating, genreCount, directorCount, yearSpan, topMovie;
        if (precomputed) {
            ({ total, avgRating, genreCount, directorCount, yearSpan, topMovie } = precomputed);
        } else {
            total = movieDatabase.length;
            avgRating = (movieDatabase.reduce((s,m) => s+m.rating, 0) / total).toFixed(1);
            genreCount = new Set(movieDatabase.flatMap(m => m.genres)).size;
            directorCount = new Set(movieDatabase.map(m => m.director)).size;
            const years = movieDatabase.map(m => m.year);
            yearSpan = Math.max(...years) - Math.min(...years);
            topMovie = [...movieDatabase].sort((a,b) => b.rating - a.rating)[0];
        }

        const cards = [
            { icon: '🎬', value: total, label: 'ภาพยนตร์ทั้งหมด' },
            { icon: '⭐', value: avgRating, label: 'คะแนนเฉลี่ย' },
            { icon: '🎭', value: genreCount, label: 'แนวหนัง' },
            { icon: '🎥', value: directorCount, label: 'ผู้กำกับ' },
            { icon: '📅', value: yearSpan + ' ปี', label: 'ช่วงเวลาที่ครอบคลุม' },
            { icon: '🏆', value: topMovie.rating, label: topMovie.title, isTop: true },
        ];

        document.getElementById('stats-summary').innerHTML = cards.map(c => `
            <div class="stat-card reveal-on-scroll">
                <div class="stat-card-icon">${c.icon}</div>
                <div class="stat-card-value">${c.value}</div>
                <div class="stat-card-label" ${c.isTop ? 'style="color:var(--mint-glow);"' : ''}>${c.label}</div>
            </div>
        `).join('');
    }

    /* ── 2. Genre Donut Chart (SVG) ──────────────────────────────── */
    function renderGenreDonut(precomputed) {
        let entries;
        if (precomputed) {
            entries = precomputed;
        } else {
            const counts = {};
            movieDatabase.forEach(m => m.genres.forEach(g => { counts[g] = (counts[g]||0) + 1; }));
            entries = Object.entries(counts).sort((a,b) => b[1]-a[1]);
        }
        const total = entries.reduce((s,[,c]) => s+c, 0);

        const cx = 120, cy = 120, r = 85, strokeWidth = 34;
        const circumference = 2 * Math.PI * r;
        let offset = 0;

        const svg = document.getElementById('genre-donut');
        let paths = '';
        entries.forEach(([genre, count], i) => {
            const frac = count / total;
            const dash = frac * circumference;
            const gap  = circumference - dash;
            const color = GENRE_COLORS[i % GENRE_COLORS.length];
            paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
                stroke="${color}" stroke-width="${strokeWidth}"
                stroke-dasharray="${dash} ${gap}"
                stroke-dashoffset="${-offset}"
                class="donut-segment"
                style="animation-delay:${i * 0.05}s"
                transform="rotate(-90 ${cx} ${cy})">
                <title>${genre}: ${count} เรื่อง (${(frac*100).toFixed(1)}%)</title>
            </circle>`;
            offset += dash;
        });

        svg.innerHTML = paths + `
            <text x="${cx}" y="${cy-6}" text-anchor="middle" class="donut-center-num">${total}</text>
            <text x="${cx}" y="${cy+16}" text-anchor="middle" class="donut-center-label">เรื่องทั้งหมด</text>
        `;

        // Legend
        const legend = document.getElementById('donut-legend');
        legend.innerHTML = entries.map(([genre, count], i) => `
            <div class="legend-item">
                <span class="legend-dot" style="background:${GENRE_COLORS[i % GENRE_COLORS.length]}"></span>
                <span class="legend-name">${genre}</span>
                <span class="legend-count">${count}</span>
            </div>
        `).join('');
    }

    /* ── 3. Ratings by Year Line Chart (SVG) ─────────────────────── */
    function renderYearLineChart(precomputed) {
        let years, avgByYear;
        if (precomputed) {
            years = precomputed.years;
            avgByYear = precomputed.avgByYear;
        } else {
            const byYear = {};
            movieDatabase.forEach(m => {
                if (!byYear[m.year]) byYear[m.year] = [];
                byYear[m.year].push(m.rating);
            });
            years = Object.keys(byYear).map(Number).sort((a,b) => a-b);
            avgByYear = years.map(y => {
                const arr = byYear[y];
                return arr.reduce((s,r)=>s+r,0) / arr.length;
            });
        }

        const svg = document.getElementById('year-line-chart');
        const W = 800, H = 320, padL = 50, padR = 30, padT = 30, padB = 50;
        const chartW = W - padL - padR;
        const chartH = H - padT - padB;

        const minR = 55, maxR = 100;
        const xStep = years.length > 1 ? chartW / (years.length - 1) : 0;

        function xPos(i) { return padL + i * xStep; }
        function yPos(val) { return padT + chartH - ((val - minR) / (maxR - minR)) * chartH; }

        // Grid lines + Y labels
        let gridLines = '';
        for (let v = minR; v <= maxR; v += 15) {
            const y = yPos(v);
            gridLines += `<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" class="chart-gridline"/>`;
            gridLines += `<text x="${padL-10}" y="${y+4}" text-anchor="end" class="chart-axis-label">${v}</text>`;
        }

        // X labels (year, every other one on narrow screens handled via CSS)
        let xLabels = '';
        years.forEach((y, i) => {
            xLabels += `<text x="${xPos(i)}" y="${H-padB+22}" text-anchor="middle" class="chart-axis-label">${y}</text>`;
        });

        // Line path
        const points = years.map((y, i) => `${xPos(i)},${yPos(avgByYear[i])}`).join(' ');
        // Area fill path
        const areaPoints = `${padL},${padT+chartH} ${points} ${xPos(years.length-1)},${padT+chartH}`;

        // Dots
        let dots = '';
        years.forEach((y, i) => {
            dots += `<circle cx="${xPos(i)}" cy="${yPos(avgByYear[i])}" r="5" class="chart-dot" style="animation-delay:${i*0.06}s">
                <title>${y}: คะแนนเฉลี่ย ${avgByYear[i].toFixed(1)}</title>
            </circle>`;
        });

        svg.innerHTML = `
            ${gridLines}
            <polygon points="${areaPoints}" class="chart-area-fill"/>
            <polyline points="${points}" class="chart-line"/>
            ${dots}
            ${xLabels}
        `;
    }

    /* ── 4. Rating Distribution Histogram (SVG) ──────────────────── */
    function renderRatingHistogram(precomputedBuckets) {
        const buckets = precomputedBuckets || [
            { label: '60-69', min: 60, max: 69 },
            { label: '70-79', min: 70, max: 79 },
            { label: '80-89', min: 80, max: 89 },
            { label: '90-100', min: 90, max: 100 },
        ];
        if (!precomputedBuckets) {
            buckets.forEach(b => {
                b.count = movieDatabase.filter(m => m.rating >= b.min && m.rating <= b.max).length;
            });
        }
        const maxCount = Math.max(...buckets.map(b => b.count), 1);

        const svg = document.getElementById('rating-histogram');
        const W = 800, H = 300, padL = 50, padR = 30, padT = 30, padB = 50;
        const chartW = W - padL - padR;
        const chartH = H - padT - padB;
        const barGap = 24;
        const barWidth = (chartW - barGap * (buckets.length - 1)) / buckets.length;

        let bars = '';
        buckets.forEach((b, i) => {
            const barH = (b.count / maxCount) * chartH;
            const x = padL + i * (barWidth + barGap);
            const y = padT + chartH - barH;
            bars += `
                <rect x="${x}" y="${padT+chartH}" width="${barWidth}" height="0" rx="6" class="hist-bar"
                    style="animation-delay:${i*0.1}s"
                    data-target-y="${y}" data-target-h="${barH}">
                    <title>${b.label}: ${b.count} เรื่อง</title>
                </rect>
                <text x="${x + barWidth/2}" y="${padT+chartH+24}" text-anchor="middle" class="chart-axis-label">${b.label}</text>
                <text x="${x + barWidth/2}" y="${y-10}" text-anchor="middle" class="hist-bar-count">${b.count}</text>
            `;
        });
        svg.innerHTML = bars;

        // Animate bars growing from bottom
        requestAnimationFrame(() => {
            svg.querySelectorAll('.hist-bar').forEach(bar => {
                bar.setAttribute('y', bar.dataset.targetY);
                bar.setAttribute('height', bar.dataset.targetH);
            });
        });
    }

    /* ── 5. Top Directors Bar List ────────────────────────────────── */
    function renderDirectorBars(precomputedEntries) {
        let entries;
        if (precomputedEntries) {
            entries = precomputedEntries;
        } else {
            const counts = {};
            movieDatabase.forEach(m => {
                const dirs = m.director.split(',').map(d => d.trim());
                dirs.forEach(d => { counts[d] = (counts[d]||0) + 1; });
            });
            entries = Object.entries(counts)
                .filter(([,c]) => c >= 2)
                .sort((a,b) => b[1]-a[1])
                .slice(0, 8);
        }

        if (entries.length === 0) {
            document.getElementById('director-bars').innerHTML =
                '<p style="color:var(--text-gray);">ยังไม่มีผู้กำกับที่มีหนังซ้ำมากกว่า 1 เรื่องในฐานข้อมูล</p>';
            return;
        }

        const maxCount = Math.max(...entries.map(([,c]) => c));
        document.getElementById('director-bars').innerHTML = `
            <table class="director-table">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">ผู้กำกับ</th>
                        <th scope="col">จำนวนเรื่อง</th>
                        <th scope="col">สัดส่วน</th>
                    </tr>
                </thead>
                <tbody>
                    ${entries.map(([dir, count], i) => `
                        <tr class="reveal-on-scroll" style="transition-delay:${i*0.05}s">
                            <td class="dt-rank">${i+1}</td>
                            <td>${dir}</td>
                            <td class="dt-count">${count} เรื่อง</td>
                            <td>
                                <div class="director-bar-track">
                                    <div class="director-bar-fill" style="width:${(count/maxCount)*100}%">
                                        <span class="director-bar-count">${count}</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /* ── Init — ใช้ Web Worker คำนวณสถิติแยกจาก main thread ──────────
       ถ้าเบราว์เซอร์ไม่รองรับ Web Worker (หรือโหลด worker ไม่สำเร็จ เช่น
       เปิดไฟล์ผ่าน file:// โดยตรง) จะ fallback ไปคำนวณบน main thread แทน
       เพื่อให้หน้าเว็บยังใช้งานได้ปกติ 100% ในทุกสภาพแวดล้อม
       ─────────────────────────────────────────────────────────────── */
    function renderAllDirect() {
        renderSummary();
        renderGenreDonut();
        renderYearLineChart();
        renderRatingHistogram();
        renderDirectorBars();
        if (typeof initScrollReveal === "function") initScrollReveal();
    }

    function renderAllFromWorker(data) {
        renderSummary(data.summary);
        renderGenreDonut(data.genreEntries);
        renderYearLineChart({ years: data.years, avgByYear: data.avgByYear });
        renderRatingHistogram(data.buckets);
        renderDirectorBars(data.directorEntries);
        if (typeof initScrollReveal === "function") initScrollReveal();
    }

    if (typeof Worker !== "undefined") {
        try {
            const worker = new Worker("js/stats-worker.js");
            const workerTimeout = setTimeout(() => {
                worker.terminate();
                renderAllDirect(); // worker ตอบช้าเกินไป — ใช้ main thread แทน
            }, 4000);

            worker.onmessage = (e) => {
                clearTimeout(workerTimeout);
                renderAllFromWorker(e.data);
                worker.terminate(); // งานเสร็จแล้ว ปิด worker เพื่อคืนทรัพยากร
            };
            worker.onerror = () => {
                clearTimeout(workerTimeout);
                worker.terminate();
                renderAllDirect(); // worker error (เช่น ปัญหา CORS บน file://) — fallback
            };
            worker.postMessage({ movies: movieDatabase });
        } catch (e) {
            renderAllDirect(); // สร้าง Worker ไม่สำเร็จเลย — fallback ทันที
        }
    } else {
        renderAllDirect(); // เบราว์เซอร์เก่าที่ไม่รองรับ Web Worker
    }
});
