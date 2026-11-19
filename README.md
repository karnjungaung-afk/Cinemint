# 🍃 CineMint

> **Discover. Understand. Choose Better.**
>
> แพลตฟอร์มค้นหา สำรวจ และเปรียบเทียบภาพยนตร์ พร้อมผู้ช่วย MintBot สำหรับค้นข้อมูลจากฐานข้อมูลของ CineMint

🌐 **Production (V1):** https://karnjungaung-afk.github.io/Cinemint/  
📦 **Repository:** https://github.com/karnjungaung-afk/Cinemint

---

## About

CineMint V1 เป็นเว็บไซต์ภาพยนตร์แบบ Static Web Application สร้างด้วย HTML, CSS และ JavaScript โดยมีฐานข้อมูลภาพยนตร์ที่จัดเก็บไว้ใน Repository และโหลดบน Browser

เว็บไซต์ออกแบบด้วยแนวทาง Dark Cinema และ Mint Green Accent มีเป้าหมายช่วยให้ผู้ใช้ค้นพบภาพยนตร์ อ่านข้อมูล และเปรียบเทียบตัวเลือกก่อนตัดสินใจรับชม

> **สถานะ MintBot ใน V1:** MintBot ปัจจุบันเป็นระบบค้นคืนข้อมูลภายในเครื่อง (local retrieval) ที่ใช้ keyword matching, rule-based intent detection และ template responses จาก `movieDatabase` ไม่ได้เรียก Generative AI / LLM API การเชื่อมต่อ LLM จริงเป็นส่วนหนึ่งของแผน CineMint 2.0

## Features

- **Movie Discovery:** สำรวจภาพยนตร์และค้นหาจากชื่อ ผู้กำกับ แนวหนัง หรือนักแสดง
- **Movie Details:** ดูเรื่องย่อ นักแสดง ผู้กำกับ ตัวอย่างภาพยนตร์ และรีวิว
- **Watchlist:** บันทึกภาพยนตร์ไว้ดูภายหลังใน Browser ปัจจุบัน โดยใช้ Local Storage
- **Movie Comparison:** เปรียบเทียบภาพยนตร์ได้สูงสุด 3 เรื่อง
- **Tier List:** จัดกลุ่มภาพยนตร์ตามคะแนนที่เก็บในฐานข้อมูล
- **Statistics:** ดูสถิติแนวหนัง การกระจายคะแนน แนวโน้มตามปี และข้อมูลผู้กำกับ
- **MintBot Chat:** ค้นหาและแนะนำภาพยนตร์จากข้อมูลในฐานข้อมูลด้วยกฎและเทมเพลต
- **Responsive Layout:** รองรับหน้าจอ Desktop และ Mobile

## Technology

| Technology | Usage |
|---|---|
| HTML5 | Page structure |
| CSS3 | Styling and responsive layout |
| JavaScript | UI, search, movie logic and interactions |
| GitHub Pages | V1 hosting |
| TMDB image CDN | Movie poster and backdrop images |
| OMDb API | Optional external ratings integration; disabled unless configured |

## Project Structure (V1)

```text
Cinemint/
├── index.html
├── now-showing.html
├── top-rated.html
├── tierlist.html
├── discover.html
├── compare.html
├── movie-detail.html
├── watchlist.html
├── stats.html
├── about.html
├── contact.html
├── privacy.html
├── css/
│   └── style.css
├── js/
│   ├── movies-data.js
│   ├── main.js
│   ├── detail.js
│   ├── discover.js
│   ├── compare.js
│   ├── search.js
│   ├── watchlist.js
│   ├── stats.js
│   ├── stats-worker.js
│   ├── tierlist.js
│   ├── now-showing.js
│   ├── top-rated.js
│   ├── mintbot-chat.js
│   ├── tmdb-images.js
│   ├── omdb-api.js
│   └── utils.js
├── images/
│   └── facebookLogo.png
└── .github/
    └── workflows/
        └── static.yml
```

The current movie data is maintained in `js/movies-data.js`. Keep movie IDs stable because pages and saved Watchlist entries refer to them.

## Run Locally

1. Clone the repository:

   ```bash
   git clone https://github.com/karnjungaung-afk/Cinemint.git
   cd Cinemint
   ```

2. Open the folder with VS Code.
3. Start the site using the Live Server extension, or any local static HTTP server.
4. Open the local URL in a browser.

The V1 pages do not require a build step.

## Images and Third-party Services

- Movie image URLs use TMDB's image CDN.
- Some movie pages embed trailers from YouTube.
- Google Fonts and Font Awesome are loaded from their respective CDNs.
- Optional ambient audio is served from Pixabay.

This product uses the TMDB API but is not endorsed or certified by TMDB.

Review the relevant provider terms and obtain the appropriate permissions before using CineMint for commercial purposes. Image URLs and movie metadata may be subject to provider terms and rights held by their respective owners.

## Security Notes

- Do not commit private API keys, access tokens, passwords, or service-role credentials.
- V1 is a public client-side application. Any credential placed in a browser JavaScript file can be read by visitors.
- Keep optional browser-side TMDB/OMDb keys empty in the public build. V2 should route credentialed requests through a server-side API.
- Watchlist and chat history in V1 are stored locally in the current browser/session; they are not user accounts and do not sync between devices.
- The V1 contact form prepares a message in the visitor's email application. The visitor must review and send the email themselves.

## Development Notes

Before merging changes into `main`:

1. Run the V1 validation script when available.
2. Check JavaScript syntax.
3. Test the affected page on desktop and mobile.
4. Review the complete diff.
5. Use a Pull Request; do not push experimental work directly to `main`.

## CineMint 2.0 Roadmap

CineMint 2.0 is planned as an incremental migration while keeping V1 available:

1. Stabilize V1 data, images, security and documentation.
2. Build a new Premium Cinema interface with Next.js and TypeScript.
3. Add a backend and account system.
4. Migrate Watchlist, ratings and collections to persistent user data.
5. Introduce a real LLM-powered MintBot through a protected server API.
6. Build personalized recommendations and measurable AI evaluation.
7. Add administration, usage controls and business features after validating demand and licensing.

## Developer

**Karn Jungaung**  
GitHub: https://github.com/karnjungaung-afk

---

© 2026 CineMint. Movie titles, images, logos and related marks belong to their respective owners.
