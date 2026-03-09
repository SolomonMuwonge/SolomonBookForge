
import React, { useState, useEffect, useRef } from 'react';
import { Book, Chapter, Alignment } from '../types';



const generateChapter = async (
  title: string,
  genre: string,
  description: string,
  chapterNumber: number,
  previousContent: string
) => {
  try {
    const response = await fetch("http://localhost:5000/generate-chapter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, genre, description, chapterNumber, previousContent })
    });
    const data = await response.json();
    return data.chapter || "AI call failed";
  } catch (error) {
    console.error("Error generating chapter:", error);
    return "AI call failed";
  }
};

interface EditorProps {
  book: Book;
  onSave: (book: Book) => void;
  onExit: () => void;
  onGoToBackstage: () => void;
}

type StyleKey = 'workspaceColor' | 'backgroundColor' | 'textColor';

const Editor: React.FC<EditorProps> = ({ book, onSave, onExit, onGoToBackstage }) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [currentBook, setCurrentBook] = useState<Book>(book);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);

  const activeChapter = currentBook.chapters[activeChapterIndex] || { 
    id: 'placeholder', 
    title: 'Untitled', 
    content: '',
    alignment: 'left' as Alignment,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    workspaceColor: currentBook.workspaceColor || '#f1f5f9'
  };

  const styles = {
    workspace: activeChapter.workspaceColor || currentBook.workspaceColor || '#f1f5f9',
    page: activeChapter.backgroundColor || '#ffffff',
    text: activeChapter.textColor || '#000000'
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== activeChapter.content) {
      editorRef.current.innerHTML = activeChapter.content || '<div><br></div>';
    }
  }, [activeChapterIndex]);

  const handleCommand = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) {
      updateContent(editorRef.current.innerHTML);
    }
  };

  const handleColorChange = (key: StyleKey, value: string) => {
    setSaveStatus('idle');
    const updatedChapters = currentBook.chapters.map((ch, idx) => 
      idx === activeChapterIndex ? { ...ch, [key]: value } : ch
    );
    setCurrentBook({ ...currentBook, [key]: value, chapters: updatedChapters });
  };

  const setAlignment = (alignment: Alignment) => {
    const updatedChapters = [...currentBook.chapters];
    updatedChapters[activeChapterIndex] = { ...activeChapter, alignment };
    setCurrentBook({ ...currentBook, chapters: updatedChapters });
    setSaveStatus('idle');
  };

  const updateContent = (html: string) => {
    const updatedChapters = [...currentBook.chapters];
    updatedChapters[activeChapterIndex] = { ...activeChapter, content: html };
    setCurrentBook({ ...currentBook, chapters: updatedChapters });
    setSaveStatus('idle');
  };

 const addChapter = async () => {
  if (isGenerating) return;
  setIsGenerating(true);

  const chapterNumber = currentBook.chapters.length + 1;
  const previousContent = currentBook.chapters[chapterNumber - 2]?.content || '';

  try {
    // ✅ Backend AI call
    const draft = await generateChapter(
      currentBook.title,
      currentBook.genre,
      currentBook.description,
      chapterNumber,
      previousContent
    );

    const newChapter: Chapter = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Chapter ${chapterNumber}`,
      content: draft,
      backgroundColor: '#ffffff',
      textColor: '#000000',
      workspaceColor: currentBook.workspaceColor || '#f1f5f9',
      alignment: 'left'
    };

    const updatedBook = { ...currentBook, chapters: [...currentBook.chapters, newChapter] };
    setCurrentBook(updatedBook);
    setActiveChapterIndex(updatedBook.chapters.length - 1);
    setSaveStatus('idle');
  } finally {
    setIsGenerating(false);
  }
};


 const handleRedraft = async () => {
  if (isGenerating) return;
  setIsGenerating(true);

  const chapterNumber = activeChapterIndex + 1;
  const previousContent = currentBook.chapters[chapterNumber - 2]?.content || '';

  try {
    // ✅ Backend AI call
    const draft = await generateChapter(
      currentBook.title,
      currentBook.genre,
      currentBook.description,
      chapterNumber,
      previousContent
    );

    const updatedChapters = [...currentBook.chapters];
    updatedChapters[activeChapterIndex] = { ...activeChapter, content: draft };
    setCurrentBook({ ...currentBook, chapters: updatedChapters });

    if (editorRef.current) editorRef.current.innerHTML = draft;
    setSaveStatus('idle');
  } finally {
    setIsGenerating(false);
  }
};


  const handleContinue = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const continuation = await storyEngine.continueStory({
        title: currentBook.title,
        genre: currentBook.genre,
        description: currentBook.description,
        chapterNumber: activeChapterIndex + 1,
        tensionLevel: 3
      }, activeChapter.content);

      const updatedHtml = activeChapter.content + (activeChapter.content.endsWith('</div>') ? '' : '<br>') + continuation;
      updateContent(updatedHtml);
      if (editorRef.current) editorRef.current.innerHTML = updatedHtml;
      setSaveStatus('idle');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    setSaveStatus('saving');
    onSave(currentBook);
    setTimeout(() => setSaveStatus('saved'), 800);
  };

  const handleLibraryClick = () => {
    if (saveStatus !== 'saved') {
      setShowExitConfirm(true);
    } else {
      onExit();
    }
  };

  const handleConfirmSaveAndExit = () => {
    onSave(currentBook);
    onExit();
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-700" style={{ backgroundColor: styles.workspace }}>
      
      {/* UNSAVED CHANGES MODAL */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full animate-scale-up">
            <div className="text-4xl mb-6">💾</div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Unsaved Changes</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">You have progress that hasn't been forged into the library yet. Would you like to save before leaving?</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirmSaveAndExit}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                Save & Exit
              </button>
              <button 
                onClick={onExit}
                className="w-full py-4 bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-100 font-bold rounded-2xl transition-all active:scale-95"
              >
                Discard Changes
              </button>
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex shrink-0 z-20">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-xl font-black text-indigo-600 tracking-tighter">BookStruct</h2>
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Professional Editor</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-3">
          {currentBook.chapters.map((chapter, idx) => (
            <button
              key={chapter.id}
              onClick={() => setActiveChapterIndex(idx)}
              className={`w-full text-left px-5 py-4 rounded-xl transition-all ${
                activeChapterIndex === idx 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <span className="text-[9px] block opacity-70 uppercase mb-0.5 tracking-widest font-black">Chapter {idx + 1}</span>
              <span className="font-bold truncate block">{chapter.title}</span>
            </button>
          ))}
          <button 
            onClick={addChapter}
            disabled={isGenerating}
            className="w-full mt-2 p-4 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-bold uppercase text-slate-400 hover:border-indigo-200 hover:text-indigo-500 transition-all"
          >
            {isGenerating ? 'Drafting...' : '+ New Chapter'}
          </button>
        </nav>

        <div className="p-6 border-t border-slate-50 space-y-2">
           <button onClick={onGoToBackstage} className="w-full py-2.5 text-indigo-500 font-black hover:bg-indigo-50 rounded-xl transition-all text-[10px] uppercase tracking-[0.2em]">
            Studio Backstage
          </button>
           <button onClick={handleLibraryClick} className="w-full py-2.5 text-slate-400 font-bold hover:text-indigo-600 transition-all text-[10px] uppercase tracking-[0.2em]">
            — Library
          </button>
        </div>
      </aside>

      {/* MAIN EDITOR */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 bg-slate-50 border-b border-slate-200 px-8 flex items-center justify-between z-30 shrink-0">
          
          <div className="flex items-center gap-10">
             {/* CHAPTER TITLE INPUT */}
             <div className="flex items-center">
                <input 
                  className="text-lg font-black text-slate-800 bg-transparent border-none focus:ring-0 outline-none w-44"
                  value={activeChapter.title}
                  onChange={(e) => {
                    const updated = [...currentBook.chapters];
                    updated[activeChapterIndex].title = e.target.value;
                    setCurrentBook({...currentBook, chapters: updated});
                    setSaveStatus('idle');
                  }}
                  placeholder="Chapter Title"
                />
             </div>

             {/* FORMATTING CONTROLS */}
             <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <FormattingButton onClick={() => handleCommand('bold')} label="B" />
                  <FormattingButton onClick={() => handleCommand('italic')} label="I" />
                  <FormattingButton onClick={() => handleCommand('underline')} label="U" />
                </div>
                
                <div className="w-[1px] h-6 bg-slate-200 mx-2"></div>

                <div className="flex items-center gap-1">
                  <AlignmentButton active={activeChapter.alignment === 'left'} onClick={() => setAlignment('left')} label="L" />
                  <AlignmentButton active={activeChapter.alignment === 'center'} onClick={() => setAlignment('center')} label="C" />
                  <AlignmentButton active={activeChapter.alignment === 'right'} onClick={() => setAlignment('right')} label="R" />
                </div>
             </div>

             {/* ATMOSPHERE MODULE - SCREENSHOT STYLE */}
             <div className="flex items-center gap-4 mr-12">
                <StyleUnit label="WORK" value={styles.workspace} onChange={(v) => handleColorChange('workspaceColor', v)} />
                <StyleUnit label="PAGE" value={styles.page} onChange={(v) => handleColorChange('backgroundColor', v)} />
                <StyleUnit label="TEXT" value={styles.text} onChange={(v) => handleColorChange('textColor', v)} />
             </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-3">
             <button 
                onClick={handleRedraft}
                disabled={isGenerating}
                className={`w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-indigo-600 hover:bg-slate-50 transition-all shadow-sm ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Redraft This Chapter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
             </button>

             <button 
                onClick={handleContinue}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 h-10 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold text-xs rounded-lg hover:bg-indigo-100 transition-all shadow-sm"
              >
                <span className="text-sm">✨</span>
                <span>Continue</span>
             </button>

             <button 
                onClick={handleSave}
                className={`px-8 h-10 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700 transition-all shadow-lg transform active:scale-95 ${saveStatus === 'saved' ? 'bg-emerald-500' : ''}`}
              >
                {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}
             </button>
          </div>
        </header>

        <div className="paper-container">
          <div 
            className="paper transition-all duration-700" 
            style={{ 
              backgroundColor: styles.page,
              color: styles.text
            }}
          >
             <div
                ref={editorRef}
                contentEditable={!isGenerating}
                className="serif w-full outline-none min-h-[500px] text-xl leading-relaxed whitespace-pre-wrap"
                style={{ textAlign: activeChapter.alignment || 'left' }}
                onInput={(e) => updateContent(e.currentTarget.innerHTML)}
              />
              <div className="pb-96"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

const StyleUnit: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-[8px] font-black text-slate-400 tracking-tighter">{label}</span>
    <div className="relative w-7 h-7 rounded-full border border-slate-200 overflow-hidden shadow-sm hover:scale-105 transition-transform cursor-pointer">
      <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="absolute inset-[-10px] w-[50px] h-[50px] cursor-pointer" 
      />
    </div>
  </div>
);

const FormattingButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button 
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
  >
    {label}
  </button>
);

const AlignmentButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button 
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    className={`w-9 h-9 flex items-center justify-center rounded-lg text-[10px] font-black transition-all shadow-sm ${
      active 
      ? 'bg-indigo-600 text-white border-transparent' 
      : 'bg-white border border-slate-200 text-slate-400 hover:text-indigo-600'
    }`}
  >
    {label}
  </button>
);

export default Editor;
