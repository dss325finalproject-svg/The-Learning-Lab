import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Send, Loader2, FileUp, Sparkles, HelpCircle, ChevronRight, CheckCircle2, XCircle, RotateCcw, LayoutGrid, Layers, RefreshCw } from 'lucide-react';
import { getStudyHelp, generateQuiz, generateFlashcards, QuizQuestion, Flashcard, StudyPreferences } from '../lib/gemini';
import { db, doc, updateDoc, increment } from '../lib/firebase';
import { toast } from 'sonner';
import AppCharacterPreview from './AppCharacterPreview';
import { motion, AnimatePresence } from 'motion/react';

interface AppAIAssistantProps {
  userData: any;
}

export default function AppAIAssistant({ userData }: AppAIAssistantProps) {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<string[]>([]);
  const [masteredCardIds, setMasteredCardIds] = useState<Set<string>>(new Set());

  // Customization States
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [quizLevel, setQuizLevel] = useState<'recall' | 'application' | 'thinking'>('recall');
  const [explanationDepth, setExplanationDepth] = useState<'simple' | 'detailed' | 'breakdown'>('simple');
  const [showSettings, setShowSettings] = useState(false);

  // Sync with Firestore on load
  useEffect(() => {
    if (userData?.aiAssistantData) {
      setTopic(userData.aiAssistantData.topic || '');
      setContext(userData.aiAssistantData.context || '');
      setResponse(userData.aiAssistantData.response || null);
      if (userData.aiAssistantData.performanceHistory) {
        setPerformanceHistory(userData.aiAssistantData.performanceHistory);
      }
      if (userData.aiAssistantData.masteredCardIds) {
        setMasteredCardIds(new Set(userData.aiAssistantData.masteredCardIds));
      }
      if (userData.aiAssistantData.prefs) {
        setDifficulty(userData.aiAssistantData.prefs.difficulty || 'medium');
        setQuizLevel(userData.aiAssistantData.prefs.quizLevel || 'recall');
        setExplanationDepth(userData.aiAssistantData.prefs.explanationDepth || 'simple');
      }
    }
  }, [userData?.uid]);

  // Auto-save
  useEffect(() => {
    if (!userData) return;
    const saveProgress = async () => {
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        'aiAssistantData.topic': topic,
        'aiAssistantData.context': context,
        'aiAssistantData.response': response,
        'aiAssistantData.performanceHistory': performanceHistory,
        'aiAssistantData.masteredCardIds': Array.from(masteredCardIds),
        'aiAssistantData.prefs': {
          difficulty,
          quizLevel,
          explanationDepth
        }
      });
    };
    const timeout = setTimeout(saveProgress, 800); // Reduced debounce
    return () => clearTimeout(timeout);
  }, [topic, context, response]);

  const handleReset = async () => {
    setTopic('');
    setContext('');
    setResponse(null);
    setQuiz(null);
    setFlashcards(null);
    setPerformanceHistory([]);
    setMasteredCardIds(new Set());
    setDifficulty('medium');
    setQuizLevel('recall');
    setExplanationDepth('simple');
    if (!userData) return;
    const userRef = doc(db, 'users', userData.uid);
    await updateDoc(userRef, {
      'aiAssistantData.topic': '',
      'aiAssistantData.context': '',
      'aiAssistantData.response': null
    });
    toast.info("Progress reset");
  };

  // Quiz State
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  
  // Flashcards State
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [hintsUsedCount, setHintsUsedCount] = useState(0);
  const [currentHintUsed, setCurrentHintUsed] = useState(false);
  const [characterExpression, setCharacterExpression] = useState<'neutral' | 'happy' | 'focus' | 'tired' | 'excited'>('neutral');
  const [feedbackText, setFeedbackText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) setFile(e.target.files[0]); };

  const handleGenerateQuiz = async () => {
    if (!topic && !context) {
      toast.error("Please provide a topic or notes for the quiz");
      return;
    }
    setQuizLoading(true);
    setResponse(null);
    try {
      let fileData;
      if (file) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => { reader.onload = () => resolve((reader.result as string).split(',')[1]); });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;
        fileData = { mimeType: file.type, data: base64 };
      }

      const historyString = performanceHistory.slice(-10).join(". ");
      const questions = await generateQuiz(
        topic, 
        context, 
        userData?.learningStyle, 
        fileData, 
        historyString,
        { difficulty, quizLevel, explanationDepth }
      );
      if (questions && questions.length > 0) {
        // Randomize questions immediately for Quizlet feel
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        setQuiz(shuffled);
        setCurrentQuestionIndex(0);
        setScore(0);
        setCorrectCount(0);
        setIncorrectCount(0);
        setIsQuizComplete(false);
        setHintsUsedCount(0);
        setCurrentHintUsed(false);
        setIsAnswered(false);
        setSelectedAnswer(null);
        setCharacterExpression('focus');
        setFeedbackText("Ready?");
      } else {
        toast.error("Failed to generate quiz");
      }
    } catch (error) {
      toast.error("Quiz error");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!topic && !context) {
      toast.error("Please provide a topic or notes for flashcards");
      return;
    }
    setFlashcardsLoading(true);
    setResponse(null);
    setQuiz(null);
    try {
      let fileData;
      if (file) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => { reader.onload = () => resolve((reader.result as string).split(',')[1]); });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;
        fileData = { mimeType: file.type, data: base64 };
      }

      const historyString = performanceHistory.slice(-10).join(". ");
      const cards = await generateFlashcards(
        topic, 
        context, 
        userData?.learningStyle, 
        fileData, 
        historyString,
        { difficulty, explanationDepth }
      );
      if (cards && cards.length > 0) {
        setFlashcards(cards);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setCharacterExpression('focus');
        setFeedbackText("Flashcards ready!");
      } else {
        toast.error("Failed to generate flashcards");
      }
    } catch (error) {
      toast.error("Flashcard Error");
    } finally {
      setFlashcardsLoading(false);
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    const isCorrect = index === quiz![currentQuestionIndex].correctAnswer;
    
    // Performance history
    const questionText = quiz![currentQuestionIndex].question;
    setPerformanceHistory(prev => [...prev, `${isCorrect ? 'Learned' : 'Struggled'}: ${questionText}`]);

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      const pointsGain = currentHintUsed ? 15 : 20; 
      setScore(prev => prev + pointsGain);
      
      setCharacterExpression('excited');
      setFeedbackText(["Good.", "Correct.", "Done.", "Nice."][Math.floor(Math.random() * 4)]);
    } else {
      setIncorrectCount(prev => prev + 1);
      setCharacterExpression('tired');
      setFeedbackText(["Not correct.", "Try again later.", "Almost.", "Next one."][Math.floor(Math.random() * 4)]);
    }
  };

  const handleCardStatus = (status: 'know' | 'learning') => {
    if (!flashcards) return;
    const currentCard = flashcards[currentCardIndex];
    
    if (status === 'know') {
      setMasteredCardIds(prev => new Set(prev).add(currentCard.id));
      toast.success("You know this.");
      setPerformanceHistory(prev => [...prev, `Learned flashcard: ${currentCard.front}`]);
    } else {
      setMasteredCardIds(prev => {
        const next = new Set(prev);
        next.delete(currentCard.id);
        return next;
      });
      setPerformanceHistory(prev => [...prev, `Still learning flashcard: ${currentCard.front}`]);
    }
    
    // Auto-advance if not at the end
    if (currentCardIndex < flashcards.length - 1) {
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
        setIsFlipped(false);
      }, 500);
    }
  };

  const handleHint = () => {
    if (isAnswered || currentHintUsed || !quiz) return;
    setCurrentHintUsed(true);
    setHintsUsedCount(prev => prev + 1);
    setFeedbackText(`Hint: ${quiz[currentQuestionIndex].hint}`);
    toast.info("A clue. It costs 5 points.");
  };

  const shuffleQuiz = () => {
    if (!quiz) return;
    const shuffled = [...quiz].sort(() => Math.random() - 0.5);
    setQuiz(shuffled);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setIsQuizComplete(false);
    setHintsUsedCount(0);
    setCurrentHintUsed(false);
    setIsAnswered(false);
    setSelectedAnswer(null);
    toast.info("Mixed up.");
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < quiz!.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
      setCurrentHintUsed(false);
      setCharacterExpression('focus');
      setFeedbackText("");
    } else {
      // Quiz Complete
      setIsQuizComplete(true);
      setCharacterExpression('happy');
      const earnedPoints = score;
      setFeedbackText(`All finished! You got ${earnedPoints} points.`);

      // Link to Firebase points
      if (userData?.uid) {
        try {
          const userRef = doc(db, 'users', userData.uid);
          await updateDoc(userRef, {
            points: increment(earnedPoints)
          });
          
          if (earnedPoints >= 80) {
            toast.success("Good score.", { duration: 5000, icon: '👑' });
          } else if (earnedPoints >= 40) {
            toast.info("You are learning.", { duration: 4500, icon: '⭐️' });
          } else {
            toast.success(`Done. You earned ${earnedPoints} points.`);
          }
        } catch (error) {
          console.error("Error updating points:", error);
        }
      }
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setFlashcards(null);
    setIsQuizComplete(false);
    setCharacterExpression('neutral');
    setFeedbackText("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic && !context && !file) { toast.error("What are you studying?"); return; }
    setLoading(true);
    try {
      let fileData;
      if (file) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => { reader.onload = () => resolve((reader.result as string).split(',')[1]); });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;
        fileData = { mimeType: file.type, data: base64 };
      }
      const result = await getStudyHelp(
        topic, 
        context, 
        userData?.learningStyle, 
        fileData,
        { difficulty, explanationDepth }
      );
      setResponse(result || "No response.");
    } catch (error) { toast.error("AI Error"); } finally { setLoading(false); }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2"><div className="bg-primary p-2 rounded-xl text-white"><Brain className="h-6 w-6" /></div><div><h2 className="text-3xl font-bold tracking-tight">AI Assistant</h2></div></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Input</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleReset}
              className="h-8 w-8 text-slate-400 hover:text-red-500"
              title="Reset AI Session"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent><form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label htmlFor="topic">Topic</Label><Input id="topic" placeholder="e.g. History" value={topic} onChange={(e) => setTopic(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="notes">Notes</Label><textarea id="context" rows={4} placeholder="Paste notes here." className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm" value={context} onChange={(e) => setContext(e.target.value)} /></div>
              
              {/* Preferences Section */}
              <div className="pt-2 border-t border-slate-100">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="w-full flex justify-between text-slate-500 hover:text-slate-700 h-8 px-2"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <span className="text-xs font-bold uppercase tracking-wider">Preferences</span>
                  <ChevronRight className={`h-4 w-4 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
                </Button>
                
                <AnimatePresence>
                  {showSettings && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-4 pt-4"
                    >
                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest text-slate-400">Difficulty</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {['easy', 'medium', 'hard'].map((lvl) => (
                            <button
                              key={lvl}
                              type="button"
                              onClick={() => setDifficulty(lvl as any)}
                              className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                                difficulty === lvl 
                                  ? 'bg-slate-900 text-white border-slate-900' 
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest text-slate-400">Quiz level</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'recall', label: 'Recall' },
                            { id: 'application', label: 'Apply' },
                            { id: 'thinking', label: 'Thinking' }
                          ].map((lvl) => (
                            <button
                              key={lvl.id}
                              type="button"
                              onClick={() => setQuizLevel(lvl.id as any)}
                              className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                                quizLevel === lvl.id 
                                  ? 'bg-slate-900 text-white border-slate-900' 
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {lvl.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] uppercase tracking-widest text-slate-400">Explanation</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'simple', label: 'Simple' },
                            { id: 'detailed', label: 'Full' },
                            { id: 'breakdown', label: 'Steps' }
                          ].map((lvl) => (
                            <button
                              key={lvl.id}
                              type="button"
                              onClick={() => setExplanationDepth(lvl.id as any)}
                              className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${
                                explanationDepth === lvl.id 
                                  ? 'bg-slate-900 text-white border-slate-900' 
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {lvl.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-2"><Label htmlFor="file">File</Label><Input id="file" type="file" onChange={handleFileChange} className="hidden" /><Button type="button" variant="outline" className="w-full border-dashed border-2" onClick={() => document.getElementById('file')?.click()}><FileUp className="mr-2 h-4 w-4" />{file ? file.name : 'Choose File'}</Button></div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1 bg-primary hover:bg-primary/90" 
                  disabled={loading || quizLoading}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Insights
                </Button>
                <Button 
                  type="button" 
                  variant="secondary"
                  className="flex-1" 
                  onClick={handleGenerateQuiz}
                  disabled={loading || quizLoading}
                >
                  {quizLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HelpCircle className="mr-2 h-4 w-4" />}
                  Quiz
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1 bg-slate-50 border-slate-200" 
                  onClick={handleGenerateFlashcards}
                  disabled={loading || quizLoading || flashcardsLoading}
                >
                  {flashcardsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers className="mr-2 h-4 w-4" />}
                  Flashcards
                </Button>
              </div>
            </form></CardContent></Card>
        <Card className="lg:col-span-2 border-slate-200 shadow-sm min-h-[500px] flex flex-col">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                {quiz ? 'Active Quest' : flashcards ? 'Flashcards' : 'Help'}
              </div>
              {(quiz || flashcards) && (
                <div className="flex gap-2">
                  {quiz && (
                    <Button variant="ghost" size="sm" onClick={shuffleQuiz} className="text-slate-400">
                      <LayoutGrid className="h-4 w-4 mr-1" /> Shuffle
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={resetQuiz} className="text-slate-400">
                    <RotateCcw className="h-4 w-4 mr-1" /> Reset
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1">
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {flashcards ? (
                    <motion.div
                      key={`flashcard-${currentCardIndex}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="space-y-8 py-8"
                    >
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative w-full max-w-sm aspect-[4/3] perspective-1000 group">
                          <motion.div
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                            className="w-full h-full relative preserve-3d cursor-pointer"
                            onClick={() => setIsFlipped(!isFlipped)}
                          >
                            {/* Front */}
                            <div className={`absolute inset-0 backface-hidden bg-white border-4 border-primary/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl ${isFlipped ? 'invisible' : 'visible'}`}>
                              <span className="absolute top-4 left-6 text-xs font-bold text-slate-300 uppercase tracking-widest">Question</span>
                              <p className="text-xl font-bold text-slate-800 leading-relaxed">{flashcards[currentCardIndex].front}</p>
                              <div className="absolute bottom-6 text-slate-400 flex items-center text-xs font-medium bg-slate-50 px-3 py-1 rounded-full">
                                <RefreshCw className="h-3 w-3 mr-1" /> Click to flip
                              </div>
                            </div>
                            {/* Back */}
                            <div className={`absolute inset-0 backface-hidden bg-primary rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl [transform:rotateY(180deg)] ${!isFlipped ? 'invisible' : 'visible'}`}>
                              {masteredCardIds.has(flashcards[currentCardIndex].id) && (
                                <div className="absolute top-4 right-6 bg-white/20 text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase">
                                  Known
                                </div>
                              )}
                              <span className="absolute top-4 left-6 text-xs font-bold text-white/40 uppercase tracking-widest">Answer</span>
                              <p className="text-xl font-medium text-white leading-relaxed">{flashcards[currentCardIndex].back}</p>
                              {flashcards[currentCardIndex].tags && (
                                <div className="absolute bottom-6 flex gap-2">
                                  {flashcards[currentCardIndex].tags.map(tag => (
                                    <span key={tag} className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase">{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </div>

                        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                          <AnimatePresence>
                            {isFlipped && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-2 gap-3 w-full"
                              >
                                <Button 
                                  variant="outline" 
                                  className="border-red-200 text-red-600 hover:bg-red-50"
                                  onClick={() => handleCardStatus('learning')}
                                >
                                  Not yet
                                </Button>
                                <Button 
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                  onClick={() => handleCardStatus('know')}
                                >
                                  Know this
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <div className="flex items-center gap-8">
                            <Button 
                              variant="ghost" 
                              disabled={currentCardIndex === 0}
                              onClick={() => { setCurrentCardIndex(prev => prev - 1); setIsFlipped(false); }}
                              className="rounded-full h-12 w-12 border-2 border-slate-100"
                            >
                              <ChevronRight className="h-6 w-6 rotate-180" />
                            </Button>
                            <div className="text-sm font-bold text-slate-400">
                              {currentCardIndex + 1} / {flashcards.length}
                            </div>
                            <Button 
                              variant="default" 
                              disabled={currentCardIndex === flashcards.length - 1}
                              onClick={() => { setCurrentCardIndex(prev => prev + 1); setIsFlipped(false); }}
                              className="rounded-full h-12 w-12 bg-primary text-white shadow-lg shadow-primary/20"
                            >
                              <ChevronRight className="h-6 w-6" />
                            </Button>
                          </div>
                        </div>
                        
                        {currentCardIndex === flashcards.length - 1 && (isFlipped || masteredCardIds.has(flashcards[currentCardIndex].id)) && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center pt-4"
                          >
                            <Button onClick={resetQuiz} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl px-8">
                              Finish Set
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ) : isQuizComplete ? (
                    <motion.div
                      key="quiz-summary"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-8 text-center py-8"
                    >
                      <div className="space-y-2">
                        <div className="inline-flex items-center justify-center p-4 bg-emerald-100 text-emerald-600 rounded-full mb-4">
                          <CheckCircle2 className="h-10 w-10" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800">All done!</h2>
                        <p className="text-slate-500 font-medium italic">"{feedbackText}"</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Score</div>
                          <div className="text-4xl font-black text-primary">{score}</div>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Accuracy</div>
                          <div className="text-4xl font-black text-emerald-500">
                            {quiz ? Math.round((correctCount / quiz.length) * 100) : 0}%
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 max-w-xs mx-auto">
                        <div className="flex justify-between text-sm font-bold px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl">
                          <span>Correct</span>
                          <span>{correctCount}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold px-4 py-2 bg-red-50 text-red-700 rounded-xl">
                          <span>Incorrect</span>
                          <span>{incorrectCount}</span>
                        </div>
                      </div>

                      <div className="pt-4 space-y-3">
                        <Button onClick={shuffleQuiz} size="lg" className="w-full max-w-sm rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20">
                          <RotateCcw className="mr-2 h-5 w-5" /> Again
                        </Button>
                        <Button variant="ghost" onClick={resetQuiz} className="w-full max-w-sm text-slate-400">
                          Back
                        </Button>
                      </div>
                    </motion.div>
                  ) : quiz ? (
                    <motion.div
                      key={`question-${currentQuestionIndex}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      {/* Character Reaction Area */}
                      <div className="flex flex-col items-center justify-center py-4 bg-slate-50/50 rounded-2xl border border-slate-100 relative">
                        <AppCharacterPreview 
                          character={userData?.character} 
                          expressionOverride={characterExpression}
                          size="md"
                        />
                        <AnimatePresence>
                          {feedbackText && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="absolute -top-2 right-4 z-50 bg-white px-4 py-2 rounded-2xl shadow-xl border-2 border-primary/20 text-sm font-bold text-primary max-w-[200px]"
                            >
                              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-primary/20 rotate-45" />
                              {feedbackText}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Quiz Controls */}
                      <div className="flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleHint}
                          disabled={isAnswered || currentHintUsed}
                          className="rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50"
                        >
                          <Sparkles className="h-4 w-4 mr-1" /> Hint
                        </Button>
                        <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-500 flex items-center">
                          {currentQuestionIndex + 1} / {quiz.length}
                        </div>
                      </div>

                      {/* Question */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                          <span>Points: {score}</span>
                          <div className="flex gap-2">
                             <span className="text-emerald-500">{correctCount} Correct</span>
                             <span className="text-red-400">{incorrectCount} Wrong</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 leading-tight">
                          {quiz[currentQuestionIndex].question}
                        </h3>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {quiz[currentQuestionIndex].options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAnswerSelect(idx)}
                              disabled={isAnswered}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                                isAnswered
                                  ? idx === quiz[currentQuestionIndex].correctAnswer
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                    : idx === selectedAnswer
                                      ? 'bg-red-50 border-red-500 text-red-700'
                                      : 'bg-slate-50 border-slate-100 text-slate-400 opacity-60'
                                  : 'bg-white border-slate-200 hover:border-primary hover:bg-slate-50 active:scale-[0.98] shadow-sm'
                              }`}
                            >
                              <span className="font-medium">{option}</span>
                              {isAnswered && idx === quiz[currentQuestionIndex].correctAnswer && <CheckCircle2 className="h-5 w-5" />}
                              {isAnswered && idx === selectedAnswer && idx !== quiz[currentQuestionIndex].correctAnswer && <XCircle className="h-5 w-5" />}
                            </button>
                          ))}
                        </div>

                        <AnimatePresence>
                          {isAnswered && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="bg-slate-100/50 p-4 rounded-xl border border-dashed border-slate-300"
                            >
                              <p className="text-sm font-medium text-slate-600 italic">
                                <span className="font-bold">Explanation: </span>
                                {quiz[currentQuestionIndex].explanation}
                              </p>
                              <Button 
                                onClick={handleNextQuestion} 
                                className="w-full mt-4 bg-primary text-white"
                               >
                                {currentQuestionIndex === quiz.length - 1 ? 'Finish' : 'Next'}
                                <ChevronRight className="ml-2 h-4 w-4" />
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ) : response ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="prose prose-slate max-w-none"
                    >
                      <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                        {response}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                      <Brain className="h-16 w-16 opacity-20" />
                      <p className="text-center font-medium">Pick a topic to start.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
