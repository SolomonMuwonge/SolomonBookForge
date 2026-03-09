import React, { useState } from 'react';
import { Book, FrontMatter, BackMatter } from '../types';
import { GoogleGenAI } from "@google/genai";

interface BackStageProps {
  book: Book;
  onSave: (book: Book) => void;
  onExit: () => void;
}

type CoverTemplate = 'classic' | 'noir' | 'modern' | 'minimal';
type CoverFont = 'serif' | 'sans' | 'display';

interface CoverTextElement {
  id: string;
  text: string;
  font: CoverFont;
  color: string;
  size: number; // px
  alignment: 'left' | 'center' | 'right';
  top: number; // %
  left: number; // %
}

const BackStage: React.FC<BackStageProps> = ({ book, onSave, onExit }) => {
  const [activeTab, setActiveTab] = useState<'cover' | 'matter'>('cover');
  const [currentBook, setCurrentBook] = useState<Book>({
    ...book,
    coverTextElements: book.coverTextElements || []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Customizer State
  const [customBg, setCustomBg] = useState(book.coverColor || '#1e293b');
  const [template, setTemplate] = useState<CoverTemplate>('classic');
  const [font, setFont] = useState<CoverFont>('serif');

  const handleGenerateCover = async () => {
    setIsGenerating(true);
    setSaveStatus("Analyzing story...");

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `High-quality book cover background art for a ${currentBook.genre} novel titled "${currentBook.title}". The story is about: ${currentBook.description}. Cinematic lighting, artistic style, no text on the image, centered composition.`;

    try {
      setSaveStatus("Generating artwork...");
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ parts: [{ text: prompt }] }],
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64Data}`;
          const updatedBook = { ...currentBook, coverImage: imageUrl };
          setCurrentBook(updatedBook);
          break;
        }
      }

      setSaveStatus("Background generated. Add your text elements!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Cover generation failed:", error);
      setSaveStatus("Generation failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGlobalSave = () => {
    const finalBook = {
      ...currentBook,
      coverColor: customBg
    };
    setCurrentBook(finalBook);
    onSave(finalBook);
    setSaveStatus("Successfully saved to Library");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  const updateFrontMatter = (key: keyof FrontMatter, value: string) => {
    const updated = {
      ...currentBook,
      frontMatter: { ...currentBook.frontMatter, [key]: value }
    };
    setCurrentBook(updated);
  };

  const updateBackMatter = (key: keyof BackMatter, value: string) => {
    const updated = {
      ...currentBook,
      backMatter: { ...currentBook.backMatter, [key]: value }
    };
    setCurrentBook(updated);
  };

  const getTemplateStyles = () => {
    switch(template) {
      case 'noir': return "bg-black/80 p-16 justify-end items-start text-left";
      case 'modern': return "bg-gradient-to-tr from-black/80 to-transparent p-8 justify-center items-center text-center";
      case 'minimal': return "bg-white/10 backdrop-blur-sm m-12 p-8 justify-center items-center text-center border border-white/20";
      default: return "p-12 justify-between items-center text-center bg-gradient-to-b from-black/40 via-transparent to-black/60";
    }
  };

  const getFontClass = (f: CoverFont) => {
    switch(f) {
      case 'sans': return "font-sans uppercase tracking-[0.3em]";
      case 'display': return "font-black tracking-tighter italic";
      default: return "serif italic";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      <header className="h-20 border-b border-slate-800 px-8 flex items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex-1">
          <button onClick={onExit} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 font-bold text-sm">
            <span>←</span> Exit Studio
          </button>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl shadow-inner border border-slate-700">
          <button 
            onClick={() => setActiveTab('cover')}
            className={`px-8 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'cover' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Cover Forge
          </button>
          <button 
            onClick={() => setActiveTab('matter')}
            className={`px-8 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'matter' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Matter Prep
          </button>
        </div>

        <div className="flex-1 flex justify-end gap-4 items-center">
          <div className="text-right hidden sm:block">
            <h1 className="text-sm font-black tracking-tight">{currentBook.title}</h1>
            <p className="text-[9px] uppercase font-black tracking-[0.2em] text-indigo-400">Back Stage Studio</p>
          </div>
          <button 
            onClick={handleGlobalSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-900/40 active:scale-95"
          >
            Save Progress
          </button>
        </div>
      </header>

      {saveStatus && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-fade-in">
          <div className="bg-indigo-600 text-white px-6 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-3 border border-indigo-400/30">
            <span className="animate-pulse">●</span>
            {saveStatus}
          </div>
        </div>
      )}

      <main className="flex-1 p-12 max-w-7xl mx-auto w-full">
        {activeTab === 'cover' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-fade-in">
            <div className="space-y-10">
              {/* AI Section */}
              <section className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-1 bg-indigo-500 rounded text-[10px] font-black uppercase">AI</span>
                  <h3 className="text-sm font-black uppercase tracking-widest">Automatic Background</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Story Prompt</label>
                  <p className="text-sm italic text-slate-300">"{currentBook.description}"</p>
                </div>
                <button 
                  onClick={handleGenerateCover}
                  disabled={isGenerating}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-900/20 transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  {isGenerating ? (
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : '✨ Generate Background'}
                </button>
              </section>

              {/* Manual Text Overlay Section */}
              <section className="p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
                <h3 className="text-sm font-black uppercase tracking-widest mb-2">Text Elements</h3>
                {(currentBook.coverTextElements || []).map((el, idx) => (
                  <div key={el.id} className="flex flex-col gap-2 bg-slate-800 p-4 rounded-xl">
                    <input 
                      type="text"
                      value={el.text}
                      onChange={(e) => {
                        const updated = [...(currentBook.coverTextElements || [])];
                        updated[idx].text = e.target.value;
                        setCurrentBook({ ...currentBook, coverTextElements: updated });
                      }}
                      className="w-full rounded p-2 text-black text-sm"
                      placeholder="Enter text"
                    />
                    <div className="flex gap-2 items-center flex-wrap">
                      <label className="text-[10px] font-black uppercase text-slate-400">Font</label>
                      {(['serif', 'sans', 'display'] as CoverFont[]).map(f => (
                        <button
                          key={f}
                          onClick={() => {
                            const updated = [...(currentBook.coverTextElements || [])];
                            updated[idx].font = f;
                            setCurrentBook({ ...currentBook, coverTextElements: updated });
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${el.font === f ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                        >
                          {f}
                        </button>
                      ))}
                      <label className="text-[10px] font-black uppercase text-slate-400">Color</label>
                      <input 
                        type="color"
                        value={el.color}
                        onChange={(e) => {
                          const updated = [...(currentBook.coverTextElements || [])];
                          updated[idx].color = e.target.value;
                          setCurrentBook({ ...currentBook, coverTextElements: updated });
                        }}
                        className="w-8 h-8 p-0 border-none rounded"
                      />
                      <label className="text-[10px] font-black uppercase text-slate-400">Size</label>
                      <input 
                        type="number"
                        value={el.size}
                        min={10}
                        max={100}
                        onChange={(e) => {
                          const updated = [...(currentBook.coverTextElements || [])];
                          updated[idx].size = parseInt(e.target.value) || 10;
                          setCurrentBook({ ...currentBook, coverTextElements: updated });
                        }}
                        className="w-16 p-1 rounded text-black text-sm"
                      />
                      <label className="text-[10px] font-black uppercase text-slate-400">Align</label>
                      <select
                        value={el.alignment}
                        onChange={(e) => {
                          const updated = [...(currentBook.coverTextElements || [])];
                          updated[idx].alignment = e.target.value as 'left'|'center'|'right';
                          setCurrentBook({ ...currentBook, coverTextElements: updated });
                        }}
                        className="rounded p-1 text-black text-sm"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const updated = [...(currentBook.coverTextElements || []), {
                      id: Date.now().toString(),
                      text: '',
                      font: 'serif' as CoverFont,
                      color: '#ffffff',
                      size: 32,
                      alignment: 'center' as 'center',
                      top: 10,
                      left: 10
                    }];
                    setCurrentBook({ ...currentBook, coverTextElements: updated });
                  }}
                  className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
                >
                  + Add Text Element
                </button>
              </section>

            </div>

            {/* Book Cover Preview */}
            <div className="flex items-center justify-center sticky top-32 h-fit">
              <div className="relative group">
                <div 
                  className="w-[400px] h-[580px] rounded-lg shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden border border-slate-800 relative flex flex-col items-center transition-all duration-700"
                  style={{ backgroundColor: customBg }}
                >
                  {currentBook.coverImage && (
                    <img src={currentBook.coverImage} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" alt="Cover Art" />
                  )}

                  <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center`}>
                    {(currentBook.coverTextElements || []).map(el => (
                      <div
                        key={el.id}
                        className={`absolute`}
                        style={{
                          color: el.color,
                          fontSize: el.size,
                          fontFamily: el.font === 'serif' ? 'serif' : el.font === 'sans' ? 'sans-serif' : 'cursive',
                          textAlign: el.alignment,
                          top: `${el.top}%`,
                          left: `${el.left}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        {el.text}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute left-0 top-0 bottom-0 w-8 bg-black/40 rounded-l-lg blur-[3px]"></div>
                <div className="absolute left-1 top-0 bottom-0 w-[1px] bg-white/10 rounded-l-lg"></div>
              </div>
            </div>
          </div>
        ) : (
          /* Matter Prep Tab stays exactly as your current code */
          <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
            {/* ... your existing Matter Prep JSX ... */}
          </div>
        )}
      </main>
    </div>
  );
};

export default BackStage;
