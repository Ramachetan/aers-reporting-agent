import React, { useState, useEffect } from 'react';
import type { ReportData } from '../types';
import { User } from '@supabase/supabase-js';
import ReportPanel from './ReportPanel';
import ProfileEnhancementPrompt from './ProfileEnhancementPrompt';
import { Logo, DownloadIcon } from './Icons';

interface ReviewScreenProps {
  reportData: ReportData;
  onDownload: () => void;
  onReset: () => void;
  user?: User | null;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({ reportData, onDownload, onReset, user }) => {
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)

  // Show profile enhancement prompt after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowProfilePrompt(true)
    }, 1500) // Show after 1.5 seconds to let user read the completion message

    return () => clearTimeout(timer)
  }, [])

  const handleProfilePromptComplete = () => {
    setShowProfilePrompt(false)
    // Could show a success message or other feedback
  }

  return (
    <>
      <div className="min-h-screen bg-background font-sans text-text flex flex-col items-center justify-center p-4">
        <header className="absolute top-0 left-0 w-full p-4">
          <div className="container mx-auto flex items-center gap-3">
            <Logo />
            <h1 className="text-2xl font-bold text-primary">AERS Reporting Agent</h1>
          </div>
        </header>
        <main className="w-full max-w-4xl">
          <div className="bg-surface rounded-2xl shadow-xl border border-border/50 p-6 md:p-10 my-16">
              <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-text">Report Complete!</h2>
                  <p className="text-text-muted mt-2">Please review the information below. You can download a copy for your records.</p>
              </div>
              <div className="max-h-[50vh] overflow-y-auto rounded-lg border border-border-medium bg-background/20 p-1 md:p-2 mb-8">
                  <ReportPanel data={reportData} isReviewMode={true} user={user} />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                      onClick={onDownload}
                      className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors flex items-center justify-center gap-2 text-lg shadow-md hover:shadow-lg"
                  >
                      <DownloadIcon />
                      Download Report
                  </button>
                  <button
                      onClick={onReset}
                      className="bg-surface text-text font-bold py-3 px-6 rounded-lg hover:bg-background border border-border-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors text-lg shadow-sm"
                  >
                      Start New Report
                  </button>
              </div>
          </div>
        </main>
      </div>

      {/* Profile Enhancement Prompt */}
      <ProfileEnhancementPrompt
        isOpen={showProfilePrompt}
        onClose={() => setShowProfilePrompt(false)}
        onComplete={handleProfilePromptComplete}
      />
    </>
  );
};

export default ReviewScreen;