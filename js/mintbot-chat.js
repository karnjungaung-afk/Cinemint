// js/mintbot-chat.js — MintBot Chat: ผู้ช่วย AI ตอบคำถามเกี่ยวกับหนัง
//
// ====================================================================
// สถาปัตยกรรม: ระบบค้นคืนข้อมูลในเครื่อง (Local Retrieval) ไม่ใช้ API
// ภายนอกที่ต้องใช้คีย์ลับ เพราะเว็บนี้เป็น Static Site ล้วนๆ การฝัง
// API Key ของบริการ AI แบบเสียเงินไว้ใน JavaScript ฝั่งเบราว์เซอร์จะทำให้
// ทุกคนที่เข้าเว็บเห็นคีย์ได้ทันที (ต่างจาก TMDB ที่เป็น public image CDN)
// ดังนั้น MintBot Chat จึงวิเคราะห์คำถามด้วยกฎ + ค้นข้อมูลจริงจาก
// movieDatabase ทั้งหมด แล้วประกอบคำตอบแบบ Template — ทำงานได้ทันที
// ไม่ต้องตั้งค่าอะไรเลย และไม่มีความเสี่ยงด้านความปลอดภัยใดๆ
// ====================================================================

(function() {

    /* ================================================================
       1. GENRE / DIRECTOR KEYWORD MAPS (ภาษาไทย ↔ ชื่อแนวหนังจริงในฐานข้อมูล)
       ================================================================ */
    const GENRE_KEYWORDS = {
        "Action": ["แอ็คชั่น","แอคชั่น","แอคชัน","action","บู๊"],
        "Adventure": ["ผจญภัย","adventure"],
        "Animation": ["แอนิเมชัน","การ์ตูน","animation","anime","อนิเมะ"],
        "Biography": ["ชีวประวัติ","biography","biopic"],
        "Black Comedy": ["ตลกร้าย","black comedy"],
        "Comedy": ["ตลก","คอมเมดี้","comedy","ขำขัน"],
        "Courtroom": ["ศาล","courtroom","คดี"],
        "Crime": ["อาชญากรรม","crime","โจร","ฆาตกรรม"],
        "Drama": ["ดราม่า","drama"],
        "Family": ["ครอบครัว","family","เด็ก"],
        "Fantasy": ["แฟนตาซี","fantasy","เวทมนตร์"],
        "History": ["ประวัติศาสตร์","history"],
        "Horror": ["สยองขวัญ","ผี","horror","หลอน","น่ากลัว"],
        "Music": ["ดนตรี","music","เพลง"],
        "Musical": ["มิวสิคัล","musical","เพลงประกอบ"],
        "Mystery": ["ปริศนา","ลึกลับ","mystery"],
        "Romance": ["รัก","โรแมนติก","romance","romantic"],
        "Sci-Fi": ["ไซไฟ","วิทยาศาสตร์","sci-fi","scifi","science fiction","อวกาศ"],
        "Sport": ["กีฬา","sport"],
        "Survival": ["เอาชีวิตรอด","survival"],
        "Thriller": ["ระทึกขวัญ","thriller","ลุ้นระทึก"],
        "War": ["สงคราม","war"],
        "Western": ["คาวบอย","western"]
    };

    const MOOD_TO_GENRE = {
        "เศร้า": ["Drama"], "ร้องไห้": ["Drama","Romance"],
        "หัวเราะ": ["Comedy"], "สนุก": ["Action","Adventure","Comedy"],
        "กลัว": ["Horror"], "ตื่นเต้น": ["Thriller","Action"],
        "คิด": ["Mystery","Drama","Sci-Fi"], "ผ่อนคลาย": ["Comedy","Animation","Family"],
        "engaged": ["Romance"], "โรแมนติก": ["Romance"]
    };

    function detectGenre(q) {
        for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
            if (keywords.some(kw => q.includes(kw.toLowerCase()))) return genre;
        }
        for (const [mood, genres] of Object.entries(MOOD_TO_GENRE)) {
            if (q.includes(mood)) return genres[0];
        }
        return null;
    }

    function detectDirector(q) {
        const directors = [...new Set(movieDatabase.flatMap(m => m.director.split(',').map(d => d.trim())))];
        return directors.find(d => q.includes(d.toLowerCase()));
    }

    /* ================================================================
       2. FUZZY MOVIE TITLE MATCHING
       ================================================================ */
    function findMovieByTitle(q) {
        const qLower = q.toLowerCase();
        // ตรงเป๊ะหรือเป็นส่วนหนึ่งของ query
        let hit = movieDatabase.find(m => qLower.includes(m.title.toLowerCase()));
        if (hit) return hit;
        // ลองแบบคำสำคัญ (เผื่อพิมพ์ไทยปนอังกฤษ หรือสะกดใกล้เคียง)
        const words = qLower.split(/\s+/).filter(w => w.length >= 4);
        for (const w of words) {
            hit = movieDatabase.find(m => m.title.toLowerCase().includes(w));
            if (hit) return hit;
        }
        return null;
    }

    function findCastMention(q) {
        const qLower = q.toLowerCase();
        for (const m of movieDatabase) {
            for (const actor of m.cast) {
                if (qLower.includes(actor.toLowerCase())) return { movie: m, actor };
            }
        }
        return null;
    }

    /* ================================================================
       3. RESPONSE BUILDERS — คืนค่า { text, movies (optional) }
       ================================================================ */
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

    function greetingResponse() {
        return { text: pick([
            "สวัสดีครับ! 🍃 ผม MintBot ผู้ช่วยแนะนำหนังของ CineMint ถามอะไรเกี่ยวกับหนังในฐานข้อมูลได้เลยครับ เช่น \"แนะนำหนังสยองขวัญ\" หรือ \"Parasite เกี่ยวกับอะไร\"",
            "หวัดดีครับ 🎬 อยากดูหนังแนวไหนวันนี้ ลองบอกอารมณ์หรือแนวที่อยากดูได้เลย ผมช่วยหาให้ได้จากฐานข้อมูล " + movieDatabase.length + " เรื่อง",
        ]) };
    }

    function randomMovieResponse() {
        const m = pick(movieDatabase);
        return {
            text: `งั้นลองเรื่องนี้ดูครับ 🎲 สุ่มมาให้แบบไม่มีลำเอียง!`,
            movies: [m]
        };
    }

    function topRatedResponse(genre) {
        let pool = movieDatabase;
        let label = "คะแนนสูงสุดในฐานข้อมูล";
        if (genre) { pool = pool.filter(m => m.genres.includes(genre)); label = `คะแนนสูงสุดในแนว ${genre}`; }
        const top = [...pool].sort((a,b) => b.rating - a.rating).slice(0, 3);
        if (top.length === 0) return { text: `ขออภัยครับ ไม่พบหนังแนว ${genre} ในฐานข้อมูลตอนนี้` };
        return {
            text: `นี่คือหนัง${label} 3 อันดับแรกครับ 🏆`,
            movies: top
        };
    }

    function genreResponse(genre) {
        const pool = movieDatabase.filter(m => m.genres.includes(genre)).sort((a,b) => b.rating - a.rating);
        if (pool.length === 0) return { text: `ขออภัยครับ ตอนนี้ยังไม่มีหนังแนว ${genre} ในฐานข้อมูลของ CineMint` };
        const top = pool.slice(0, 3);
        return {
            text: `หนังแนว ${genre} ที่คะแนนสูงสุดในฐานข้อมูลครับ (ทั้งหมด ${pool.length} เรื่อง) 🎭`,
            movies: top,
            link: { href: `top-rated.html?genre=${encodeURIComponent(genre)}`, label: `ดูหนังแนว ${genre} ทั้งหมด →` }
        };
    }

    function directorResponse(director) {
        const pool = movieDatabase.filter(m => m.director.includes(director)).sort((a,b) => b.rating - a.rating);
        if (pool.length === 0) return { text: `ขออภัยครับ ไม่พบหนังของผู้กำกับ ${director} ในฐานข้อมูล` };
        return {
            text: `ผลงานของ ${director} ในฐานข้อมูล CineMint มี ${pool.length} เรื่องครับ 🎥`,
            movies: pool.slice(0, 4)
        };
    }

    function similarMoviesResponse(movie) {
        const related = movieDatabase
            .filter(m => m.id !== movie.id)
            .map(m => ({ ...m, _match: m.genres.filter(g => movie.genres.includes(g)).length }))
            .filter(m => m._match > 0)
            .sort((a,b) => b._match - a._match || b.rating - a.rating)
            .slice(0, 3);
        if (related.length === 0) return { text: `ขออภัยครับ ยังไม่พบหนังที่คล้ายกับ "${movie.title}" ในฐานข้อมูลตอนนี้` };
        return {
            text: `ถ้าชอบ "${movie.title}" (แนว ${movie.genres.join(', ')}) ลองดูเรื่องเหล่านี้ครับ 🍃`,
            movies: related
        };
    }

    function movieInfoResponse(movie) {
        const shortReview = movie.aiReview.length > 220 ? movie.aiReview.slice(0, 220) + "..." : movie.aiReview;
        return {
            text: `**${movie.title}** (${movie.year}) กำกับโดย ${movie.director}\n\n📖 ${movie.synopsis}\n\n🤖 MintBot วิเคราะห์: ${shortReview}\n\n⭐ คะแนน ${movie.rating}/100 • แนว ${movie.genres.join(', ')}`,
            movies: [movie]
        };
    }

    function castResponse(hit) {
        const m = hit.movie;
        return {
            text: `**${hit.actor}** แสดงในเรื่อง **${m.title}** (${m.year}) ครับ นักแสดงร่วมคนอื่นๆ ได้แก่ ${m.cast.filter(c => c !== hit.actor).join(', ')}`,
            movies: [m]
        };
    }

    function compareResponse(m1, m2) {
        const winner = m1.rating > m2.rating ? m1 : m2.rating > m1.rating ? m2 : null;
        const text = winner
            ? `เปรียบเทียบแล้ว **${winner.title}** (${winner.rating}) มีคะแนนสูงกว่า **${m1.id === winner.id ? m2.title : m1.title}** (${m1.id === winner.id ? m2.rating : m1.rating}) ครับ แต่คะแนนไม่ใช่ทุกอย่าง ลองดูรายละเอียดเปรียบเทียบเต็มๆ ได้ที่หน้าเปรียบเทียบเลย`
            : `ทั้งสองเรื่องคะแนนเท่ากันเป๊ะที่ ${m1.rating} ครับ! สูสีมาก`;
        return {
            text,
            movies: [m1, m2],
            link: { href: `compare.html?ids=${m1.id},${m2.id}`, label: "ดูตารางเปรียบเทียบเต็ม →" }
        };
    }

    function keywordSearchResponse(q) {
        const words = q.split(/\s+/).filter(w => w.length >= 3);
        if (words.length === 0) return null;

        const scored = movieDatabase.map(m => {
            const haystack = [
                m.title, m.director, m.synopsis, m.aiReview,
                ...m.genres, ...m.cast
            ].join(' ').toLowerCase();
            const score = words.reduce((s, w) => s + (haystack.includes(w) ? 1 : 0), 0);
            return { m, score };
        }).filter(x => x.score > 0).sort((a,b) => b.score - a.score);

        if (scored.length === 0) return null;
        return {
            text: `พบหนังที่เกี่ยวข้องกับคำถามของคุณครับ 🔍`,
            movies: scored.slice(0, 3).map(x => x.m)
        };
    }

    function fallbackResponse() {
        return { text: pick([
            "ขออภัยครับ ผมไม่แน่ใจว่าเข้าใจคำถามถูกต้องหรือเปล่า 🤔 ลองถามแบบนี้ดูได้ครับ:\n• \"แนะนำหนังแนว Horror\"\n• \"Parasite เกี่ยวกับอะไร\"\n• \"หนังของ Christopher Nolan มีอะไรบ้าง\"\n• \"อยากดูหนังคล้าย Inception\"",
            "อืม ผมยังหาคำตอบที่แม่นยำไม่ได้ครับ 😅 ลองพิมพ์ชื่อหนัง ชื่อผู้กำกับ หรือแนวหนังที่สนใจดูได้เลยครับ",
        ]) };
    }

    /* ================================================================
       4. MAIN INTENT ROUTER
       ================================================================ */
    function processQuery(rawText) {
        const q = rawText.toLowerCase().trim();

        if (!q) return fallbackResponse();

        // ทักทาย
        if (/^(สวัสดี|หวัดดี|hello|hi|เฮ้|hey)/i.test(q)) return greetingResponse();

        // สุ่ม
        if (/สุ่ม|random|ไม่รู้จะดูอะไร|งงว่าจะดูอะไร|เลือกไม่ถูก/.test(q)) return randomMovieResponse();

        // เปรียบเทียบ 2 เรื่อง (ค้นหาสองชื่อหนังในประโยคเดียว)
        const compareMovies = movieDatabase.filter(m => q.includes(m.title.toLowerCase()));
        if (compareMovies.length >= 2) return compareResponse(compareMovies[0], compareMovies[1]);

        // นักแสดง
        const castHit = findCastMention(q);
        if (castHit) return castResponse(castHit);

        // ผู้กำกับ
        const director = detectDirector(q);
        if (director) return directorResponse(director);

        // คล้ายกับหนังเรื่องหนึ่ง
        const similarMatch = q.match(/(คล้าย|เหมือน|แบบ)\s*(.+)/);
        if (similarMatch) {
            const target = findMovieByTitle(similarMatch[2]);
            if (target) return similarMoviesResponse(target);
        }

        // ชื่อหนังตรงๆ (ต้องเช็คก่อน genre เพราะชื่อหนังสำคัญกว่า)
        const movieHit = findMovieByTitle(q);
        if (movieHit) return movieInfoResponse(movieHit);

        // แนวหนัง + คำว่าคะแนนสูงสุด/ดีที่สุด
        const genre = detectGenre(q);
        if (genre && /คะแนนสูงสุด|ดีที่สุด|top|เด็ด/.test(q)) return topRatedResponse(genre);
        if (genre) return genreResponse(genre);

        // คะแนนสูงสุดโดยรวม (ไม่ระบุแนว)
        if (/คะแนนสูงสุด|ดีที่สุด|top|เด็ดที่สุด|หนังดี/.test(q)) return topRatedResponse(null);

        // สุดท้าย: ค้นด้วยคีย์เวิร์ดทั่วไป
        const searchResult = keywordSearchResponse(q);
        if (searchResult) return searchResult;

        return fallbackResponse();
    }

    /* ================================================================
       5. UI — Chat Widget (Floating Button + Panel)
       ================================================================ */
    const CHAT_HISTORY_KEY = "cinemint_chat_history_v1";

    function loadHistory() {
        try {
            const raw = sessionStorage.getItem(CHAT_HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch { return []; }
    }
    function saveHistory(history) {
        try { sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history.slice(-40))); }
        catch { /* ignore */ }
    }

    function posterTag(m) {
        return posterImgTag(m);
    }

    function renderMovieCard(m) {
        return `
            <a href="movie-detail.html?id=${m.id}" class="chat-movie-card">
                <div class="chat-movie-poster"
                     data-title="${(m.title||'').replace(/"/g,'&quot;')}"
                     data-year="${m.year}">
                    ${posterTag(m)}
                </div>
                <div class="chat-movie-info">
                    <strong>${m.title}</strong>
                    <span>${m.year} • ⭐ ${m.rating}</span>
                </div>
            </a>
        `;
    }

    function formatText(text) {
        // แปลง **bold** เป็น <strong>, \n เป็น <br>
        return text
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    function buildWidget() {
        if (document.getElementById("mintbot-chat-root")) return;

        const root = document.createElement("div");
        root.id = "mintbot-chat-root";
        root.innerHTML = `
            <button type="button" id="mintbot-fab" class="mintbot-fab" aria-label="เปิดแชท MintBot">
                <i class="fa-solid fa-comment-dots"></i>
                <span class="mintbot-fab-pulse"></span>
            </button>
            <div id="mintbot-panel" class="mintbot-panel">
                <div class="mintbot-panel-header">
                    <div class="mintbot-header-info">
                        <div class="mintbot-avatar">🍃</div>
                        <div>
                            <strong>MintBot Chat</strong>
                            <span>ผู้ช่วยแนะนำหนัง</span>
                        </div>
                    </div>
                    <button type="button" id="mintbot-close" aria-label="ปิดแชท"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="mintbot-messages" id="mintbot-messages"></div>
                <div class="mintbot-quick-replies" id="mintbot-quick-replies"></div>
                <form class="mintbot-input-row" id="mintbot-form">
                    <input type="text" id="mintbot-input" placeholder="ถามเกี่ยวกับหนัง เช่น แนะนำหนังสยองขวัญ..." autocomplete="off">
                    <button type="submit" aria-label="ส่งข้อความ"><i class="fa-solid fa-paper-plane"></i></button>
                </form>
            </div>
        `;
        document.body.appendChild(root);

        const fab       = document.getElementById("mintbot-fab");
        const panel      = document.getElementById("mintbot-panel");
        const closeBtn   = document.getElementById("mintbot-close");
        const messagesEl = document.getElementById("mintbot-messages");
        const quickReplies = document.getElementById("mintbot-quick-replies");
        const form       = document.getElementById("mintbot-form");
        const input       = document.getElementById("mintbot-input");

        let history = loadHistory();

        function scrollToBottom() {
            messagesEl.scrollTop = messagesEl.scrollHeight;
        }

        function addMessage(role, content, skipSave) {
            const bubble = document.createElement("div");
            bubble.className = `mintbot-msg mintbot-msg-${role}`;

            if (role === "bot") {
                bubble.innerHTML = `<div class="mintbot-avatar-sm">🍃</div><div class="mintbot-bubble"></div>`;
                const bubbleContent = bubble.querySelector(".mintbot-bubble");
                bubbleContent.innerHTML = formatText(content.text);
                if (content.movies && content.movies.length) {
                    const cardsWrap = document.createElement("div");
                    cardsWrap.className = "chat-movie-cards";
                    cardsWrap.innerHTML = content.movies.map(renderMovieCard).join('');
                    bubbleContent.appendChild(cardsWrap);
                    if (typeof TMDBImages !== "undefined") TMDBImages.hydrateAll(cardsWrap);
                }
                if (content.link) {
                    const a = document.createElement("a");
                    a.href = content.link.href;
                    a.className = "chat-more-link";
                    a.textContent = content.link.label;
                    bubbleContent.appendChild(a);
                }
            } else {
                bubble.innerHTML = `<div class="mintbot-bubble">${formatText(content.text)}</div>`;
            }

            messagesEl.appendChild(bubble);
            scrollToBottom();

            if (!skipSave) {
                history.push({ role, content });
                saveHistory(history);
            }
        }

        function showTyping() {
            const t = document.createElement("div");
            t.className = "mintbot-msg mintbot-msg-bot mintbot-typing";
            t.id = "mintbot-typing-indicator";
            t.innerHTML = `<div class="mintbot-avatar-sm">🍃</div><div class="mintbot-bubble"><span></span><span></span><span></span></div>`;
            messagesEl.appendChild(t);
            scrollToBottom();
        }
        function hideTyping() {
            const t = document.getElementById("mintbot-typing-indicator");
            if (t) t.remove();
        }

        function respondTo(text) {
            addMessage("user", { text });
            showTyping();
            const delay = 500 + Math.random() * 500;
            setTimeout(() => {
                hideTyping();
                const response = processQuery(text);
                addMessage("bot", response);
            }, delay);
        }

        const QUICK_REPLIES = [
            "แนะนำหนังคะแนนสูงสุด",
            "หนังแนวสยองขวัญ",
            "อยากดูหนังตลก",
            "สุ่มหนังให้หน่อย",
        ];
        function renderQuickReplies() {
            quickReplies.innerHTML = QUICK_REPLIES.map(q =>
                `<button type="button" class="chat-quick-chip">${q}</button>`
            ).join('');
            quickReplies.querySelectorAll(".chat-quick-chip").forEach(btn => {
                btn.addEventListener("click", () => {
                    respondTo(btn.textContent);
                });
            });
        }

        form.addEventListener("submit", e => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;
            input.value = "";
            respondTo(text);
        });

        fab.addEventListener("click", () => {
            panel.classList.add("open");
            fab.classList.add("hidden-while-open");
            setTimeout(() => input.focus(), 300);
            fab.querySelector(".mintbot-fab-pulse")?.remove();
        });
        closeBtn.addEventListener("click", () => {
            panel.classList.remove("open");
            fab.classList.remove("hidden-while-open");
        });

        // โหลดประวัติแชทเดิม (ถ้ามี) หรือแสดงข้อความทักทาย
        if (history.length > 0) {
            history.forEach(item => addMessage(item.role, item.content, true));
        } else {
            addMessage("bot", greetingResponse());
        }
        renderQuickReplies();
    }

    document.addEventListener("DOMContentLoaded", buildWidget);
})();
