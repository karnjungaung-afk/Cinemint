import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MintBot",
  description: "Preview the upcoming CineMint AI movie companion.",
};

const capabilities = [
  "Find films from natural-language requests",
  "Explain recommendations with movie data",
  "Compare stories, genres, and editorial scores",
  "Remember conversation context with user control",
];

export default function MintBotPage() {
  return (
    <main className="page-container subpage">
      <header className="subpage__heading">
        <p className="eyebrow">YOUR CINEMA COMPANION</p>
        <h1>Meet <em>MintBot.</em></h1>
        <p>
          A more thoughtful way to ask about films, explore ideas, and understand
          why a recommendation might fit your taste.
        </p>
      </header>

      <section className="assistant-shell" aria-labelledby="mintbot-preview-title">
        <aside className="assistant-aside">
          <p className="eyebrow">MINTBOT 2.0</p>
          <h2 id="mintbot-preview-title">Movie intelligence, with context.</h2>
          <p>
            The conversational interface is being designed now. The live AI
            connection, retrieval layer, account controls, and usage limits belong
            to Phase 4.
          </p>
        </aside>
        <div className="assistant-main">
          <div className="assistant-message">
            <strong>🍃 MINTBOT · PREVIEW</strong>
            <p>
              I will help you find a film by mood, theme, genre, or the kind of
              story you want to experience. Recommendations will include the
              movie data behind each suggestion.
            </p>
          </div>
          <div className="subpage__notice">
            Preview only — messages are not sent to an AI service and no chat
            history is being collected on this page yet.
          </div>
          <div className="assistant-prompt-list">
            {capabilities.map((capability) => (
              <div className="assistant-prompt" key={capability}>{capability}</div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
