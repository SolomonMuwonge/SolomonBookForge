
import React from 'react';

interface LandingPageProps {
  onStart: () => void;
  onBrowse: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onBrowse }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-indigo-50">
      <div className="max-w-4xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-indigo-600 animate-fade-in">
            SolomonBookForge
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            Harness the power of your imagination. Structure your stories with professional tools and AI guidance.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-8">
          <button
            onClick={onStart}
            className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:scale-95 text-lg"
          >
            Create New Book
          </button>
          <button
            onClick={onBrowse}
            className="w-full md:w-auto px-8 py-4 bg-white border-2 border-slate-200 hover:border-indigo-400 text-slate-700 font-bold rounded-2xl transition-all text-lg"
          >
            Library
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
          <FeatureCard 
            icon="🖋️"
            title="Focus Mode"
            description="Distraction-free editor designed for deep work and flow state."
          />
          <FeatureCard 
            icon="🤖"
            title="AI Forge"
            description="Intelligent outlining and character development at your fingertips."
          />
          <FeatureCard 
            icon="📱"
            title="Anywhere"
            description="Your library syncs across devices so you can write whenever inspiration strikes."
          />
        </div>
      </div>
      
      <footer className="mt-20 text-slate-400 text-sm pb-8">
        © 2026SolomonBookForge. Empowering Authors.
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 text-left space-y-3 hover:shadow-md transition-shadow">
    <div className="text-3xl">{icon}</div>
    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
    <p className="text-slate-500 leading-snug">{description}</p>
  </div>
);

export default LandingPage;
