import React, { useState, useEffect, useRef } from 'react';
import { Book, Chapter } from '../types';

// Helper function to get book text for download
// ============================
// Full clean getBookText function
// ============================
const getBookText = (book) => {
  if (!book) return "No book content available.";

  // Header info
  let text = `Title: ${book.title}\nAuthor: ${book.author}\nGenre: ${book.genre}\n\n`;

  if (book.description) text += `Description: ${book.description}\n\n`;

  // ===== Front Matter =====
  if (book.frontMatter) {
    if (book.frontMatter.dedication) 
      text += `Dedication:\n${book.frontMatter.dedication.trim()}\n\n`;
    if (book.frontMatter.preface) 
      text += `Preface:\n${book.frontMatter.preface.trim()}\n\n`;
  }

  // ===== Chapters =====
  if (book.chapters && book.chapters.length > 0) {
    book.chapters.forEach((chapter, index) => {
      // Clean AI content: remove any leading "## Chapter X: ..." or duplicate "Chapter X:"
      let content = (chapter.content || "No content in this chapter.").trim();
      content = content.replace(/^##?\s*Chapter\s*\d+:\s*/i, "");

      // Clean chapter title (remove any accidental numbering)
      let cleanTitle = (chapter.title || `Chapter ${index + 1}`).replace(/^chapter\s*\d+:\s*/i, "").trim();

      // Compose final chapter heading + content
      text += `Chapter ${index + 1}\n`;
      text += `${content}\n\n`;
    });
  } else {
    text += "No chapters in this book.\n\n";
  }

  // ===== Back Matter =====
  if (book.backMatter) {
    if (book.backMatter.aboutAuthor) 
      text += `About the Author:\n${book.backMatter.aboutAuthor.trim()}\n\n`;
    if (book.backMatter.acknowledgments) 
      text += `Acknowledgments:\n${book.backMatter.acknowledgments.trim()}\n\n`;
  }

  // Remove trailing blank lines
  return text.trim();
};

interface ReaderProps {
  book: Book;
  onExit: () => void;
}

const Reader: React.FC<ReaderProps> = ({ book, onExit }) => {
  // ---- STATES ----
  const [format, setFormat] = useState("pdf");
  const [activeChapterIndex, setActiveChapterIndex] = useState<-1 | number | -2>(-1);
  const [fontSize, setFontSize] = useState(20);
  const [progress, setProgress] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  // ---- DOWNLOAD FUNCTION ----
  const handleDownload = async () => {
  const bookText = getBookText(book);

  if (!bookText || bookText.trim() === "") {
    alert("Book content is empty! Cannot download.");
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/download-book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book: bookText, format })
    });

    if (!response.ok) {
      alert("Failed to download book.");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `book.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
    alert("Download failed. Check console for details.");
  }
};

  // ---- ACTIVE CHAPTER & STYLES ----
  const activeChapter =
    activeChapterIndex >= 0 ? book.chapters[activeChapterIndex] : null;

  const styles = {
    workspace:
      activeChapter?.workspaceColor || book.workspaceColor || '#fcfcfc',
    page: activeChapter?.backgroundColor || book.backgroundColor || '#ffffff',
    text: activeChapter?.textColor || book.textColor || '#2c3e50'
  };

  // ---- Scroll Progress ----
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight =
        container.scrollHeight - container.clientHeight;
      const percent =
        scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      setProgress(percent);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset scroll + progress on chapter change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setProgress(0);
  }, [activeChapterIndex]);

  // ---- Block Paragraph Rendering ----
  const renderContent = (content: string) => {
    if (!content) return <p>The parchment remains untouched.</p>;

    return content.split('\n\n').map((para, idx) => (
      <p key={idx} className="mb-6">
        {para}
      </p>
    ));
  };

  return (
    <div
      className="min-h-screen font-sans flex flex-col transition-colors duration-500"
      style={{ backgroundColor: styles.workspace }}
    >
      {/* ===== Progress Bar ===== */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/5 z-[60]">
        <div
          className="h-1 bg-indigo-600 transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        {/* Left: Exit + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-indigo-600"
          >
            ←
          </button>
          <div>
            <h1 className="font-bold text-slate-800 leading-tight">
              {book.title}
            </h1>
            <p className="text-xs text-slate-400 font-medium italic">
              by {book.author}
            </p>
          </div>
        </div>

        {/* Middle: Font Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFontSize((prev) => Math.max(16, prev - 2))}
            className="px-3 py-1 text-sm font-bold bg-slate-100 rounded hover:bg-slate-200"
          >
            A-
          </button>
          <button
            onClick={() => setFontSize((prev) => Math.min(32, prev + 2))}
            className="px-3 py-1 text-sm font-bold bg-slate-100 rounded hover:bg-slate-200"
          >
            A+
          </button>
        </div>

        {/* Right: Download */}
        <div className="flex items-center gap-2">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="px-2 py-1 border rounded text-sm"
          >
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
          </select>
          <button
            onClick={handleDownload}
            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm font-semibold"
          >
            Download
          </button>
        </div>
      </header>

      {/* ===== BODY ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 border-r border-black/5 overflow-y-auto hidden lg:block bg-black/5">
          <div className="p-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
              Chronicle
            </h3>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveChapterIndex(-1)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeChapterIndex === -1
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                Front Matter
              </button>

              {book.chapters.map((chapter, idx) => (
                <button
                  key={chapter.id}
                  onClick={() => setActiveChapterIndex(idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeChapterIndex === idx
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                      : 'text-slate-500 hover:bg-white/50'
                  }`}
                >
                  <span className="mr-3 text-[10px] opacity-50">{idx + 1}</span>
                  {chapter.title}
                </button>
              ))}

              <button
                onClick={() => setActiveChapterIndex(-2)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeChapterIndex === -2
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:bg-white/50'
                }`}
              >
                Back Matter
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Reader */}
        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto pt-12 pb-24 px-6"
        >
          <div
            className="max-w-2xl mx-auto space-y-12 p-12 rounded-lg shadow-2xl transition-all duration-500 min-h-screen"
            style={{
              backgroundColor: styles.page,
              color: styles.text
            }}
          >
            {/* Front Matter */}
            {activeChapterIndex === -1 && (
              <div className="space-y-20 py-20 text-center">
                <h2 className="text-5xl font-black serif">{book.title}</h2>
                <p className="text-xl italic opacity-70">by {book.author}</p>
              </div>
            )}

            {/* Back Matter */}
            {activeChapterIndex === -2 && (
              <div className="space-y-20 py-20 serif text-lg leading-relaxed opacity-80">
                {book.backMatter?.aboutAuthor}
                {book.backMatter?.acknowledgments}
              </div>
            )}

            {/* Chapter */}
            {activeChapterIndex >= 0 && activeChapter && (
              <article>
                <div className="mb-12 text-center">
                  <h3 className="text-4xl font-black tracking-tight mb-4 italic serif">
                    {activeChapter.title}
                  </h3>
                  <div className="h-1 w-12 bg-indigo-600 mx-auto rounded-full"></div>
                </div>
                <div
                  className="serif leading-relaxed"
                  style={{
                    fontSize: `${fontSize}px`,
                    textAlign: activeChapter.alignment || 'left'
                  }}
                >
                  {renderContent(activeChapter.content)}
                </div>
              </article>
            )}

            {/* Footer Navigation */}
            <div className="pt-20 border-t border-current/10 flex items-center justify-between text-sm font-bold opacity-70">
              <button
                disabled={activeChapterIndex === -1}
                onClick={() => {
                  if (activeChapterIndex === -2) setActiveChapterIndex(book.chapters.length - 1);
                  else if (activeChapterIndex === 0) setActiveChapterIndex(-1);
                  else if (typeof activeChapterIndex === 'number')
                    setActiveChapterIndex(activeChapterIndex - 1);
                }}
                className="hover:text-indigo-600 disabled:opacity-0 transition-all"
              >
                ← Previous
              </button>
              <span className="text-[10px] uppercase tracking-widest font-black">
                {activeChapterIndex === -1
                  ? 'Front'
                  : activeChapterIndex === -2
                  ? 'Back'
                  : `${activeChapterIndex + 1} / ${book.chapters.length}`}
              </span>
              <button
                disabled={activeChapterIndex === -2}
                onClick={() => {
                  if (activeChapterIndex === -1) setActiveChapterIndex(0);
                  else if (activeChapterIndex === book.chapters.length - 1) setActiveChapterIndex(-2);
                  else if (typeof activeChapterIndex === 'number')
                    setActiveChapterIndex(activeChapterIndex + 1);
                }}
                className="hover:text-indigo-600 disabled:opacity-0 transition-all"
              >
                Next →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Reader;