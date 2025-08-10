
import React, { useState, useRef, useEffect } from 'react';
import { Logo, Spinner, UploadIcon, ChatBubbleIcon, DocumentCheckIcon, BotIcon, ShieldCheckIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface GreetingProps {
  onStart: (description: string, files?: File[]) => void;
  isLoading: boolean;
  error: string | null;
  onShowLogin?: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="text-center p-8 bg-background rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="flex-shrink-0 w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
        {icon}
      </div>
      <h3 className="font-semibold text-xl text-text mt-6">{title}</h3>
      <p className="text-text-muted mt-2">{children}</p>
    </div>
);


const Greeting: React.FC<GreetingProps> = ({ onStart, isLoading, error, onShowLogin }) => {
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0 && !isLoading) {
      onStart(description, Array.from(selectedFiles));
    }
    if(event.target) {
        event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && description.trim()) {
      onStart(description, []);
    }
  };

  return (
    <div className={`text-text transition-opacity duration-1000 ease-in ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Header with authentication */}
      <header className="w-full bg-surface/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <h1 className="text-xl font-bold text-primary">AERS Reporting Agent</h1>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-text-muted">Welcome, {user.email}</span>
                <button
                  onClick={signOut}
                  className="text-sm bg-white text-primary border border-border px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={onShowLogin}
                className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-colors font-medium"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative bg-background overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
            backgroundSize: `20px 20px`,
        }} aria-hidden="true"></div>

        <div className="relative container mx-auto px-4 py-24 lg:py-32 text-center z-10 animate-fade-in-up">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Logo />
            <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">AERS Reporting Agent</h1>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-text tracking-tighter max-w-4xl mx-auto leading-tight">
            Report Medication Side Effects, Simply and Securely.
          </h2>
          <p className="mt-6 text-lg md:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
            Have a concern about a medication? Describe what you're experiencing. Our friendly AI assistant will ask a few simple questions to build a complete report for you.
          </p>
          <div className="mt-12 w-full max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-surface p-4 lg:p-6 rounded-2xl shadow-xl hover:shadow-2xl border border-transparent hover:border-primary/10 transition-all duration-300">
              <div className="relative">
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., I started taking a new medication last week and now I have a persistent headache..."
                  rows={4}
                  className="w-full p-4 text-base bg-background/50 rounded-lg border border-border-medium focus:outline-none focus:ring-2 focus:ring-primary transition-shadow resize-none disabled:bg-gray-100"
                  disabled={isLoading}
                />
              </div>
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple disabled={isLoading}/>
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-primary font-semibold py-2 px-4 border border-border-medium rounded-full shadow-sm hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <UploadIcon />
                  <span>Upload Document or Photo</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !description.trim()}
                  className="w-full sm:w-auto bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary-light disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg shadow-md hover:shadow-lg"
                >
                  {isLoading ? <Spinner /> : 'Start Report'}
                </button>
              </div>
               {error && <p className="mt-4 text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg">{error}</p>}
            </form>
          </div>
        </div>
      </main>

      <section className="w-full bg-surface py-20 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-text">Your Trusted Partner in Health Reporting</h2>
          <p className="mt-4 text-lg text-text-muted max-w-2xl mx-auto">We've simplified the adverse event reporting process with you in mind.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12 max-w-7xl mx-auto">
            <FeatureCard icon={<ChatBubbleIcon />} title="Simple Conversation">No more confusing forms. Just chat naturally with our AI assistant.</FeatureCard>
            <FeatureCard icon={<ShieldCheckIcon />} title="Secure & Private">Your data is confidential and handled with the utmost care and security.</FeatureCard>
            <FeatureCard icon={<BotIcon />} title="Powered by Advanced AI">Get help identifying symptoms and providing accurate, medically relevant details.</FeatureCard>
            <FeatureCard icon={<DocumentCheckIcon />} title="Instant & Transparent">Watch your official report get built in real-time as you chat.</FeatureCard>
          </div>
        </div>
      </section>

      <section className="w-full bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg flex items-center gap-6">
              <div className="flex-shrink-0 text-primary hidden sm:block"><DocumentCheckIcon /></div>
              <div>
                  <h3 className="font-bold text-lg text-text">Built on a Foundation of Trust</h3>
                  <p className="text-text-muted mt-1">Our process is modeled after the official FDA MedWatch 3500B form to ensure comprehensive and compliant reporting.</p>
              </div>
          </div>
        </div>
      </section>

      <footer className="w-full bg-text text-background/70 py-6">
       <div className="container mx-auto px-4 text-center text-sm">
         <p>&copy; {new Date().getFullYear()} AERS Reporting Agent. All Rights Reserved.</p>
         <p className="text-xs opacity-60 mt-1">This tool is for informational purposes and does not constitute medical advice. Please consult a healthcare professional for any medical concerns.</p>
       </div>
    </footer>
    </div>
  );
};

export default Greeting;