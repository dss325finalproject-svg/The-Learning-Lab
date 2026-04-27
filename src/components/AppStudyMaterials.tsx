import React, { useState } from 'react';
import { Upload, FileText, BookOpen, Sparkles, Loader2, RotateCcw, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import { db, doc, updateDoc } from '../lib/firebase';
import { useEffect } from 'react';

export default function AppStudyMaterials({ userData }: { userData: any }) {
  const [topic, setTopic] = useState('');
  const [content, setContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [studyPlan, setStudyPlan] = useState<string | null>(null);

  // Sync with Firestore on load
  useEffect(() => {
    if (userData?.studyPlanData) {
      setTopic(userData.studyPlanData.topic || '');
      setContext(userData.studyPlanData.content || '');
      setStudyPlan(userData.studyPlanData.studyPlan || null);
    }
  }, [userData?.uid]);

  // Auto-save
  useEffect(() => {
    if (!userData) return;
    const saveProgress = async () => {
      const userRef = doc(db, 'users', userData.uid);
      await updateDoc(userRef, {
        'studyPlanData.topic': topic,
        'studyPlanData.content': content,
        'studyPlanData.studyPlan': studyPlan
      });
    };
    const timeout = setTimeout(saveProgress, 800);
    return () => clearTimeout(timeout);
  }, [topic, content, studyPlan]);

  const handleReset = async () => {
    setTopic('');
    setContext('');
    setStudyPlan(null);
    if (!userData) return;
    const userRef = doc(db, 'users', userData.uid);
    await updateDoc(userRef, {
      'studyPlanData.topic': '',
      'studyPlanData.content': '',
      'studyPlanData.studyPlan': null
    });
    toast.info("Plan reset.");
  };

  const handleAnalyze = async () => {
    if (!topic && !content) {
      toast.error("Provide a topic or notes.");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const stylePrompt = userData?.learningStyle ? `The user is a ${userData.learningStyle} learner. Write for them simply.` : '';
      const prompt = `Create a simple study plan and 3 short tips for: ${topic}. 
        Notes: ${content}. 
        ${stylePrompt} 
        
        Writing rules:
        - Use a neutral tone.
        - Use common words and short sentences.
        - No complex vocabulary.
        - No long dashes or asterisks (*).
        - No AI phrases like "dive into" or "unleash".
        - Be direct.
        - Call the helper "buddy" or "friend".
        
        Format in simple steps. No markdown formatting symbols like * or #.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      
      setStudyPlan(response.text || "No response.");
      toast.success("Plan ready.");
    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Generation failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="bg-primary p-2 rounded-xl text-white">
          <BookOpen className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Planner</h2>
          <p className="text-slate-500">Generate study strategies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">Inputs</CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleReset}
              className="h-8 w-8 text-slate-400 hover:text-red-500"
              title="Reset Study Plan"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic or Exam</Label>
              <Input 
                id="topic"
                placeholder="e.g. Organic Chemistry" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="rounded-xl border-slate-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea 
                id="notes"
                placeholder="Paste notes here." 
                value={content}
                onChange={(e) => setContext(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button 
              className="w-full rounded-xl h-12 bg-primary hover:bg-primary/90 text-white"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Create
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-slate-200 shadow-sm min-h-[500px] flex flex-col">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[500px] p-6">
              <AnimatePresence mode="wait">
                {studyPlan ? (
                  <motion.div
                    key="plan"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-slate max-w-none"
                  >
                    <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                      {studyPlan}
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                    <BookOpen className="h-16 w-16 opacity-20" />
                    <p className="text-center max-w-[200px]">Enter a topic to generate a plan.</p>
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
