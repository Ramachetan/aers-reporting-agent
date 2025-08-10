
import React, { useState, useCallback, useEffect } from 'react';
import type { Message, ReportData } from './types';
import { INITIAL_REPORT_DATA, createInitialReportDataWithUser } from './constants';
import { getAiResponse } from './services/geminiService';
import { useAuth } from './contexts/AuthContext';
import ChatPanel from './components/ChatPanel';
import ReportPanel from './components/ReportPanel';
import Greeting from './components/Greeting';
import ReviewScreen from './components/ReviewScreen';
import SuggestionModal from './components/SuggestionModal';
import Login from './components/Login';
import UserProfile from './components/UserProfile';
import { Logo, HomeIcon } from './components/Icons';

const COMPLETION_PHRASE = "The report is now complete.";

const fileToBase64 = (file: File): Promise<{ mimeType: string, data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        const mimeType = result.split(',')[0].split(':')[1].split(';')[0];
        const data = result.split(',')[1];
        resolve({ mimeType, data });
    };
    reader.onerror = error => reject(error);
  });
};

const initialMessages: Message[] = [
  {
    id: 'initial-greeting',
    sender: 'ai',
    text: "Hello! I'm the AERS Reporting Agent. I'm here to help you report any medication side effects.",
  },
];

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [view, setView] = useState<'greeting' | 'chat' | 'review' | 'login'>('greeting');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [reportData, setReportData] = useState<ReportData>(() => createInitialReportDataWithUser(null));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState<boolean>(false);
  const [modalSuggestions, setModalSuggestions] = useState<string[]>([]);
  const [pendingReportData, setPendingReportData] = useState<{description: string, files?: File[]} | null>(null);
  const [isProcessingPendingData, setIsProcessingPendingData] = useState<boolean>(() => {
    // Check immediately on mount if there's pending data to avoid flash
    return typeof window !== 'undefined' && !!localStorage.getItem('pendingReportData');
  });

  // Update report data when user changes (login/logout)
  useEffect(() => {
    if (user && reportData.reporter_info.first_name === null && reportData.reporter_info.last_name === null) {
      // User just logged in and reporter info is empty, auto-fill it
      setReportData(createInitialReportDataWithUser(user));
    }
  }, [user, reportData.reporter_info.first_name, reportData.reporter_info.last_name]);

  // All hooks must be at the top level - before any early returns
  const handleReset = useCallback(() => {
    setView('greeting');
    setMessages(initialMessages);
    setReportData(createInitialReportDataWithUser(user));
    setIsLoading(false);
    setError(null);
    setPendingReportData(null);
    setIsProcessingPendingData(false);
    localStorage.removeItem('pendingReportData'); // Clear any stored pending data
  }, [user]);

  // Handle logout - reset to home page when user becomes null
  useEffect(() => {
    if (!loading && !user && view !== 'greeting' && view !== 'login') {
      // User logged out, reset the application state
      handleReset();
    }
  }, [user, loading, view, handleReset]);

  const handleUpdateReportData = useCallback((newData: ReportData) => {
    setReportData(newData);
    
    // If we're in chat mode and user manually updated data, send a contextual message
    // to let the AI know about the manual updates
    if (view === 'chat' && messages.length > 1) {
      const aiMessage: Message = {
        id: `${Date.now()}-ai-update`,
        sender: 'ai',
        text: "I see you've updated some information in the form. Let me continue with any remaining questions based on what you've provided.",
      };
      setMessages(prev => [...prev, aiMessage]);
    }
  }, [view, messages.length]);

  const handleProcessAiResponse = useCallback((result: { ai_response_message: string; updated_report_data: ReportData; suggestions?: string[] }, initialMessage?: Message) => {
    const aiResponse: Message = { 
        id: `${Date.now()}-ai`, 
        sender: 'ai', 
        text: result.ai_response_message,
    };
      
    if (initialMessage) {
        setMessages([initialMessage, aiResponse]);
    } else {
        setMessages(prev => [...prev, aiResponse]);
    }
    
    // Debug logging to help identify the issue
    console.log('Current reportData before merge:', reportData);
    console.log('AI response updated_report_data:', result.updated_report_data);
    
    // Preserve auto-filled reporter info and ensure complete data structure when updating with AI response
    const updatedData: ReportData = {
      // Merge patient_info - preserve existing structure
      patient_info: {
        ...reportData.patient_info,
        ...(result.updated_report_data.patient_info || {}),
      },
      // Merge adverse_event - preserve existing structure  
      adverse_event: {
        ...reportData.adverse_event,
        ...(result.updated_report_data.adverse_event || {}),
      },
      // Merge suspect_product - preserve existing structure
      suspect_product: {
        ...reportData.suspect_product,
        ...(result.updated_report_data.suspect_product || {}),
      },
      // Update concomitant_products if provided, otherwise keep existing
      concomitant_products: result.updated_report_data.concomitant_products || reportData.concomitant_products,
      // Preserve auto-filled reporter info but allow AI to update optional fields
      reporter_info: {
        ...reportData.reporter_info,
        ...(result.updated_report_data.reporter_info || {}),
        // Force preserve auto-filled fields from current data
        first_name: reportData.reporter_info.first_name || result.updated_report_data.reporter_info?.first_name,
        last_name: reportData.reporter_info.last_name || result.updated_report_data.reporter_info?.last_name,
        email: reportData.reporter_info.email || result.updated_report_data.reporter_info?.email,
        country: reportData.reporter_info.country || result.updated_report_data.reporter_info?.country,
      },
      // Update product_available if provided, otherwise keep existing
      product_available: result.updated_report_data.product_available !== undefined 
        ? result.updated_report_data.product_available 
        : reportData.product_available,
    };
    
    console.log('Final merged data:', updatedData);
    setReportData(updatedData);

    if (view === 'greeting') {
        setView('chat');
    }
    
    if (result.suggestions && result.suggestions.length > 0) {
        setModalSuggestions(result.suggestions);
        setIsSuggestionModalOpen(true);
        return;
    }
    
    if (result.ai_response_message.includes(COMPLETION_PHRASE)) {
        setView('review');
    }
  }, [view, reportData]);

  const handleSendMessage = useCallback(async (userInput: string, files?: File[]) => {
    if (!userInput.trim() && (!files || files.length === 0)) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const userMessageText = userInput || (files && files.length > 0 ? `I've uploaded ${files.length} file(s).` : "");
    const newUserMessage: Message = { id: Date.now().toString(), sender: 'user', text: userMessageText };
    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    let filePayloads;
    if (files && files.length > 0) {
      try {
        filePayloads = await Promise.all(files.map(file => fileToBase64(file)));
      } catch (e) {
        const errorMessage = "I'm sorry, I had trouble processing one of the files you uploaded. Please try again.";
        setError("There was an error reading a file. Please try again.");
        const errorResponse: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: errorMessage };
        setMessages(prev => [...prev, errorResponse]);
        setIsLoading(false);
        return;
      }
    }

    try {
      const result = await getAiResponse(updatedMessages, reportData, filePayloads);
      handleProcessAiResponse(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error(e);
      setError(errorMessage);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm sorry, I seem to be having trouble connecting. Please try again in a moment.",
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, reportData, handleProcessAiResponse]);

  const handleStartReport = useCallback(async (description: string, files?: File[]) => {
    // Check if user is authenticated before starting the report
    if (!user) {
      console.log('User not authenticated, storing pending report data:', { description, files: files?.length || 0 });
      const pendingData = { description, files: files?.map(f => ({ name: f.name, size: f.size, type: f.type })) };
      setPendingReportData({ description, files });
      // Also store in localStorage to survive OAuth redirects
      localStorage.setItem('pendingReportData', JSON.stringify(pendingData));
      setView('login');
      return;
    }

    console.log('Starting report for authenticated user:', { description, files: files?.length || 0 });
    setIsLoading(true);
    setError(null);
    
    const userMessageText = description || (files && files.length > 0 ? `I've uploaded ${files.length} file(s).` : "I'd like to report a side effect.");
    const initialUserMessage: Message = { id: 'initial-user-message', sender: 'user', text: userMessageText };

    let filePayloads;
    if (files && files.length > 0) {
      try {
        filePayloads = await Promise.all(files.map(file => fileToBase64(file)));
      } catch (e) {
        setError("There was an error reading one of your files. Please try again.");
        setIsLoading(false);
        return;
      }
    }

    try {
      const result = await getAiResponse([initialUserMessage], createInitialReportDataWithUser(user), filePayloads);
      handleProcessAiResponse(result, initialUserMessage);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      console.error(e);
      setError(`I'm sorry, I had trouble starting the report. ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setIsProcessingPendingData(false); // Clear processing state in case this was called from OAuth flow
    }
  }, [handleProcessAiResponse, user]);

  // Check for pending report data after OAuth redirect
  useEffect(() => {
    if (user && !loading) {
      const storedPendingData = localStorage.getItem('pendingReportData');
      if (storedPendingData) {
        try {
          const parsedData = JSON.parse(storedPendingData);
          console.log('Found stored pending report data after OAuth:', parsedData);
          setIsProcessingPendingData(true);
          localStorage.removeItem('pendingReportData');
          
          // Start the report with the stored description (files are lost during OAuth redirect)
          if (parsedData.description) {
            setTimeout(() => {
              handleStartReport(parsedData.description);
              setIsProcessingPendingData(false);
            }, 100);
          } else {
            setIsProcessingPendingData(false);
          }
        } catch (e) {
          console.error('Error parsing stored pending data:', e);
          localStorage.removeItem('pendingReportData');
          setIsProcessingPendingData(false);
        }
      } else if (isProcessingPendingData) {
        // No stored data but we're in processing state, clear it
        setIsProcessingPendingData(false);
      }
    }
  }, [user, loading, handleStartReport, isProcessingPendingData]);

  const handleConfirmSuggestion = useCallback((suggestion: string) => {
    setIsSuggestionModalOpen(false);
    setModalSuggestions([]);
    // Send a clear message that this is a selection, not a new symptom description
    handleSendMessage(`I confirm that "${suggestion}" best describes my symptom.`);
  }, [handleSendMessage]);

  const handleShowLogin = useCallback(() => {
    setView('login');
  }, []);

  const handleLoginSuccess = useCallback(() => {
    console.log('Login successful. Checking for pending report data:', pendingReportData);
    if (pendingReportData) {
      // User logged in after trying to start a report, so start it now
      const { description, files } = pendingReportData;
      console.log('Found pending report data, starting report:', { description, files: files?.length || 0 });
      setPendingReportData(null);
      // Also clear localStorage in case it was stored there
      localStorage.removeItem('pendingReportData');
      handleStartReport(description, files);
    } else {
      // Regular login, go back to greeting
      console.log('No pending report data, going to greeting');
      setView('greeting');
    }
  }, [pendingReportData, handleStartReport]);

  const handleBackToHome = useCallback(() => {
    setPendingReportData(null);
    localStorage.removeItem('pendingReportData'); // Clear any stored pending data
    setView('greeting');
  }, []);
  
  const handleDownloadReport = useCallback(() => {
    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aers_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [reportData]);

  // Early returns AFTER all hooks
  if (loading || isProcessingPendingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo />
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            <div className="text-lg text-text-muted">
              {isProcessingPendingData ? 'Setting up your report...' : 'Loading...'}
            </div>
          </div>
          {isProcessingPendingData && (
            <div className="text-sm text-text-muted max-w-md text-center">
              We're taking you right back to where you left off!
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show login page only when explicitly requested or when trying to access protected features
  if (view === 'login') {
    const pendingActionMessage = pendingReportData ? 'reporting your side effect' : undefined;
    return <Login onSuccess={handleLoginSuccess} onBack={handleBackToHome} pendingAction={pendingActionMessage} />;
  }

  if (view === 'greeting') {
    return <Greeting onStart={handleStartReport} isLoading={isLoading} error={error} onShowLogin={handleShowLogin} />;
  }
  
  if (view === 'review') {
    return <ReviewScreen reportData={reportData} onDownload={handleDownloadReport} onReset={handleReset} user={user} />;
  }

  return (
    <>
      <SuggestionModal 
        isOpen={isSuggestionModalOpen}
        suggestions={modalSuggestions}
        onConfirm={handleConfirmSuggestion}
        onClose={() => setIsSuggestionModalOpen(false)}
      />
      <div className="min-h-screen bg-background font-sans text-text flex flex-col">
        <header className="w-full bg-surface p-4 border-b border-border">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo />
              <h1 className="text-2xl font-bold text-primary">AERS Reporting Agent</h1>
            </div>
            <div className="flex items-center gap-4">
              <UserProfile />
              <button 
                onClick={handleReset}
                className="p-2 rounded-full hover:bg-background text-text-muted hover:text-primary transition-colors"
                aria-label="Start new report"
              >
                <HomeIcon />
              </button>
            </div>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 flex flex-col h-[calc(100vh-120px)]">
            <ChatPanel messages={messages} onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-2 h-[calc(100vh-120px)]">
            <ReportPanel data={reportData} onUpdateReport={handleUpdateReportData} user={user} />
          </div>
        </main>
      </div>
    </>
  );
};

export default App;
