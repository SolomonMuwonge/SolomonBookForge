
import React, { useState, useEffect } from 'react';
import { Book } from '../types';

interface DashboardProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onViewBook: (book: Book) => void;
  onOpenBackstage: (book: Book) => void;
  onDeleteBook: (id: string) => void;
  onBack: () => void;
  onNewBook: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ books, onSelectBook, onViewBook, onOpenBackstage, onDeleteBook, onBack, onNewBook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (confirmDeleteId) {
      const timer = setTimeout(() => setConfirmDeleteId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [confirmDeleteId]);

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTrashClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirmDeleteId === id) {
      onDeleteBook(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <button 
              onClick={onBack}
              className="text-indigo-600 hover:text-indigo-800 font-bold text-sm flex items-center gap-1 transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
            </button>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Your Library</h1>
            <p className="text-slate-500 text-lg">Your collection of forged masterpieces.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input 
                type="text"
                placeholder="Search books..."
                className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-64 transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <button 
              onClick={onNewBook}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5"
            >
              + Forge New Book
            </button>
          </div>
        </header>

        {books.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border-2 border-dashed border-slate-200 shadow-sm">
            <div className="text-7xl mb-6">🖋️</div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Your shelf is waiting...</h2>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto text-lg leading-relaxed">
              Every legend starts with a single page. Begin your writing journey today.
            </p>
            <button 
              onClick={onNewBook}
              className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              Forge Your First Book
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBooks.map((book, index) => (
              <div 
                key={book.id} 
                className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {book.coverImage && (
                  <div className="h-24 overflow-hidden relative grayscale group-hover:grayscale-0 transition-all duration-700">
                    <img src={book.coverImage} className="w-full h-full object-cover" alt="Cover preview" />
                    <div className="absolute inset-0 bg-indigo-900/40 mix-blend-overlay"></div>
                  </div>
                )}
                
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] rounded-full">
                      {book.genre}
                    </span>
                    
                    <button 
                      onClick={(e) => handleTrashClick(e, book.id)}
                      className={`transition-all p-2 rounded-xl active:scale-95 flex items-center gap-2 border ${
                        confirmDeleteId === book.id 
                          ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-200 px-4' 
                          : 'text-slate-400 hover:text-red-600 hover:bg-red-50 border-transparent hover:border-red-100'
                      }`}
                    >
                      {confirmDeleteId === book.id && (
                        <span className="text-[10px] font-black uppercase tracking-widest animate-pulse">Confirm?</span>
                      )}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-6 font-semibold italic">By {book.author}</p>
                  
                  <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mb-6">
                    {book.description || "An untold story waiting to be finished."}
                  </p>
                </div>

                <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-col gap-3 mt-auto">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {book.chapters.length} Chapters
                    </span>
                    <button 
                      onClick={() => onOpenBackstage(book)}
                      className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition-colors"
                    >
                      Back Stage Studio →
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onViewBook(book)}
                      className="flex-1 bg-white px-4 py-2.5 rounded-xl text-slate-600 font-bold text-xs shadow-sm border border-slate-200 hover:bg-slate-100 transition-all"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => onSelectBook(book)}
                      className="flex-1 bg-indigo-600 px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm hover:bg-indigo-700 transition-all"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
