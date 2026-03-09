
import React, { useState } from 'react';
import { Book } from '../types';

interface BookFormProps {
  onCreate: (book: Partial<Book>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const BookForm: React.FC<BookFormProps> = ({ onCreate, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: 'Fiction',
    description: ''
  });

  const genres = ['Fiction', 'Non-Fiction', 'Fantasy', 'Sci-Fi', 'Mystery', 'Romance', 'Thriller', 'Biography'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-scale-up relative">
        <button 
          onClick={onCancel}
          className="absolute top-6 left-8 text-slate-400 hover:text-indigo-600 transition-colors font-semibold text-xs"
        >
          ← Back
        </button>
        
        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-2 text-slate-800">Start Your Story</h2>
          <p className="text-slate-500 mb-6 text-sm">Fill in the details and our AI will forge your first chapter automatically.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Book Title</label>
            <input 
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all disabled:opacity-50"
              placeholder="The Last Horizon"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Author</label>
              <input 
                required
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-all disabled:opacity-50"
                placeholder="Your Name"
                value={formData.author}
                onChange={e => setFormData({ ...formData, author: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Genre</label>
              <select 
                disabled={isLoading}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all appearance-none disabled:opacity-50"
                value={formData.genre}
                onChange={e => setFormData({ ...formData, genre: e.target.value })}
              >
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Short Premise</label>
            <textarea 
              rows={4}
              required
              disabled={isLoading}
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none transition-all resize-none disabled:opacity-50"
              placeholder="What happens in this story? Give the AI some clues..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="flex-1 py-4 text-slate-600 font-bold hover:bg-slate-50 rounded-2xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:bg-indigo-400"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Forging...
                </>
              ) : 'Forge Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;
