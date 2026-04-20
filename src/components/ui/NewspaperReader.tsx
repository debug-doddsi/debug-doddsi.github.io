import { ExternalLink } from "lucide-react";

export interface PaperArticle {
  url: string;
  headline: string;
  subheadline?: string;
  summary: string;
  imageUrl?: string;
  imageAlt?: string;
  journal?: string;
  date: string;
  authors?: string;
}

interface NewspaperReaderProps {
  papers: PaperArticle[];
  masthead?: string;
}

function ArticleImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <div className="np-img-wrap">
      <img src={src} alt={alt} className="np-img" />
      {caption && <p className="np-caption">{caption}</p>}
    </div>
  );
}

function PlaceholderFigure({ label }: { label?: string }) {
  return (
    <div className="np-img-placeholder">
      <span className="np-img-placeholder-label">{label ?? "[ FIG. — NO IMAGE PROVIDED ]"}</span>
    </div>
  );
}

export function NewspaperReader({
  papers,
  masthead = "THE SCIENCE TIMES",
}: NewspaperReaderProps) {
  if (!papers.length) return null;

  const featured = papers[0];
  const sidePapers = papers.slice(1, 3);
  const belowFold = papers.slice(3);

  return (
    <div className="np-outer">
      {/* CCD scan-line overlay */}
      <div className="np-scanlines" aria-hidden="true" />

      <div className="np-paper">
        {/* ── Masthead ── */}
        <header className="np-masthead">
          <div className="np-rule-heavy" />
          <div className="np-masthead-meta">
            <span className="np-meta">Established MCMXCIX · Science &amp; Technology</span>
            <span className="np-meta">Price: 30p</span>
          </div>
          <div className="np-rule-thin" />
          <p className="np-title">{masthead}</p>
          <div className="np-rule-thin" />
          <div className="np-masthead-meta">
            <span className="np-meta">{featured.date}</span>
            <span className="np-meta">Late City Edition · Issue No.&nbsp;47</span>
          </div>
          <div className="np-rule-heavy" />
        </header>

        {/* ── Two-column grid: featured | divider | sidebar ── */}
        <div className="np-grid">
          {/* Featured article */}
          <article className="np-featured">
            {featured.imageUrl ? (
              <ArticleImage src={featured.imageUrl} alt={featured.imageAlt ?? ""} caption={featured.imageAlt} />
            ) : (
              <PlaceholderFigure label="FIG. 1 — PRINCIPAL FINDINGS" />
            )}

            <h2 className="np-headline-lg">{featured.headline}</h2>

            {featured.subheadline && (
              <p className="np-subheadline">{featured.subheadline}</p>
            )}

            <div className="np-rule-thin" />

            <div className="np-byline-row">
              {featured.authors && <span className="np-byline">By {featured.authors}</span>}
              {featured.journal && <span className="np-journal">{featured.journal}</span>}
            </div>

            <div className="np-rule-thin" />

            <p className="np-body">{featured.summary}</p>

            <a href={featured.url} target="_blank" rel="noopener noreferrer" className="np-link">
              Read full paper&nbsp;<ExternalLink size={8} className="inline mb-px" />
            </a>
          </article>

          {/* Vertical column divider */}
          <div className="np-divider" />

          {/* Sidebar articles */}
          <aside className="np-sidebar">
            {sidePapers.map((paper, i) => (
              <article key={i}>
                {i > 0 && <div className="np-rule-thin np-sidebar-sep" />}

                {paper.imageUrl ? (
                  <ArticleImage src={paper.imageUrl} alt={paper.imageAlt ?? ""} caption={paper.imageAlt} />
                ) : null}

                <h3 className="np-headline-sm">{paper.headline}</h3>

                {paper.subheadline && (
                  <p className="np-subheadline">{paper.subheadline}</p>
                )}

                {paper.authors && <p className="np-byline">By {paper.authors}</p>}

                {paper.journal && <p className="np-journal">{paper.journal}</p>}

                <p className="np-body">{paper.summary}</p>

                <a href={paper.url} target="_blank" rel="noopener noreferrer" className="np-link">
                  Read full paper&nbsp;<ExternalLink size={7} className="inline mb-px" />
                </a>
              </article>
            ))}
          </aside>
        </div>

        {/* ── Below-the-fold articles ── */}
        {belowFold.length > 0 && (
          <>
            <div className="np-rule-heavy np-below-rule" />
            <div className="np-below-fold">
              {belowFold.map((paper, i) => (
                <article key={i} className="np-below-article">
                  {paper.imageUrl ? (
                    <ArticleImage src={paper.imageUrl} alt={paper.imageAlt ?? ""} />
                  ) : null}
                  <h3 className="np-headline-sm">{paper.headline}</h3>
                  {paper.authors && <p className="np-byline">By {paper.authors}</p>}
                  <p className="np-body">{paper.summary}</p>
                  <a href={paper.url} target="_blank" rel="noopener noreferrer" className="np-link">
                    Read full paper&nbsp;<ExternalLink size={7} className="inline mb-px" />
                  </a>
                </article>
              ))}
            </div>
          </>
        )}

        {/* ── Footer ── */}
        <div className="np-rule-heavy np-footer-rule" />
        <footer className="np-footer">
          <span className="np-meta">All findings reported for informational purposes only.</span>
          <span className="np-meta">{masthead}</span>
        </footer>
      </div>
    </div>
  );
}
