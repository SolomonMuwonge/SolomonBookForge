import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import BookForm from './components/BookForm';
import Editor from './components/Editor';
import Dashboard from './components/Dashboard';
import Reader from './components/Reader';
import BackStage from './components/BackStage';
import { Book, ViewState, Chapter } from './types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyAoCHHJgIbjJwrTAtyLnm2hQJIBd5XP4Ig"  // your real Gemini API key
});

const askAI = async (title: string, genre: string, description: string) => {
  try {
    const response = await fetch("http://localhost:5000/generate-chapter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, genre, description })
    });

    const data = await response.json();

    if (data.chapter) return data.chapter;
    else return "AI call failed";
  } catch (error) {
    console.error("Error calling server:", error);
    return "AI call failed";
  }
};



const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [library, setLibrary] = useState<Book[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bookstruct_library');
    if (saved) {
      try {
        setLibrary(JSON.parse(saved));
      } catch (e) {
        console.error("Library sync failed");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bookstruct_library', JSON.stringify(library));
  }, [library]);

  const handleCreateNewBook = async (data: Partial<Book>) => {
    setIsCreating(true);
    try {
      const title = data.title || 'Untitled Work';
      const genre = data.genre || 'Fiction';
      const description = data.description || '';

      const chapter1Draft = await askAI(title, genre, description);


      if (!chapter1Draft || chapter1Draft.includes("AI call failed")) {
        alert("AI failed to generate the chapter. Please try again.");
        setIsCreating(false);
        return;
      }

      const initialChapter: Chapter = {
        id: Math.random().toString(36).substr(2, 9),
        title: 'Chapter 1',
        content: chapter1Draft,
        backgroundColor: '#ffffff',
        textColor: '#000000',
        workspaceColor: '#f1f5f9',
        alignment: 'left'
      };

      const newBook: Book = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        author: data.author || 'Author',
        genre,
        description,
        chapters: [initialChapter],
        createdAt: Date.now(),
        workspaceColor: '#f1f5f9',
        backgroundColor: '#ffffff',
        textColor: '#000000',
        frontMatter: { dedication: '', preface: '' },
        backMatter: { aboutAuthor: '', acknowledgments: '' }
      };

      setLibrary(prev => [...prev, newBook]);
      setActiveBook(newBook);
      setView('editor');
    } catch (error) {
      console.error("Error during book creation:", error);
      alert("Something went wrong. Please refresh and try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveBook = (updatedBook: Book) => {
    setLibrary(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
    setActiveBook(updatedBook);
  };

  const handleDeleteBook = (id: string) => {
    setLibrary(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {view === 'landing' && <LandingPage onStart={() => setView('create')} onBrowse={() => setView('dashboard')} />}
      {view === 'create' && <BookForm onCreate={handleCreateNewBook} onCancel={() => setView('landing')} isLoading={isCreating} />}
      {view === 'dashboard' && <Dashboard 
        books={library}
        onSelectBook={(book) => { setActiveBook(book); setView('editor'); }}
        onViewBook={(book) => { setActiveBook(book); setView('reader'); }}
        onOpenBackstage={(book) => { setActiveBook(book); setView('backstage'); }}
        onDeleteBook={handleDeleteBook}
        onBack={() => setView('landing')}
        onNewBook={() => setView('create')}
      />}
      {view === 'backstage' && activeBook && <BackStage book={activeBook} onSave={handleSaveBook} onExit={() => setView('dashboard')} />}
      {view === 'editor' && activeBook && <Editor book={activeBook} onSave={handleSaveBook} onExit={() => { setActiveBook(null); setView('dashboard'); }} onGoToBackstage={() => setView('backstage')} />}
      {view === 'reader' && activeBook && <Reader book={activeBook} onExit={() => { setActiveBook(null); setView('dashboard'); }} />}
    </div>
  );
};

export default App;
