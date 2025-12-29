
import React, { useState } from 'react';
import { 
  ToolMode, 
  CognitiveLevel, 
  GeneratorParams, 
  GeneratedContent 
} from './types';
import { 
  SUBJECTS, 
  GRADES, 
  ICONS 
} from './constants';
import { generateEducationalContent } from './geminiService';

const App: React.FC = () => {
  const [params, setParams] = useState<GeneratorParams>({
    subject: SUBJECTS[0],
    grade: GRADES[0],
    topic: '',
    subTopic: '',
    mode: ToolMode.QUESTION_GENERATOR,
    cognitiveLevel: CognitiveLevel.MIXED,
    questionCount: 5,
    totalMarks: 20,
    additionalNotes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToolClick = async (mode: ToolMode) => {
    // Validation logic for specific modes
    if (mode === ToolMode.REWRITER && !params.additionalNotes) {
      setError("Rewriter mode requires existing text in 'Contextual Input'.");
      return;
    }
    if (mode === ToolMode.MEMORANDUM && !params.additionalNotes && !params.topic) {
      setError("Memorandum mode requires a Topic or pasted questions in 'Contextual Input'.");
      return;
    }
    if (!params.topic && mode !== ToolMode.REWRITER && mode !== ToolMode.MEMORANDUM) {
      setError("Please specify a Topic (e.g., 'Safety') in the sidebar first.");
      return;
    }
    
    const updatedParams = { ...params, mode };
    setParams(updatedParams);
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const content = await generateEducationalContent(updatedParams);
      setResult({
        title: `${params.grade} ${params.subject}: ${params.topic || 'Assessment Output'}`,
        content,
        timestamp: new Date().toLocaleString()
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const ToolCard = ({ mode, icon, description, color }: { mode: ToolMode, icon: React.ReactNode, description: string, color: string }) => (
    <button
      onClick={() => handleToolClick(mode)}
      className={`group relative flex flex-col items-start p-8 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-${color}-300 transition-all text-left active:scale-[0.97] overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-50 rounded-bl-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform`} />
      
      <div className={`relative p-4 rounded-2xl bg-${color}-100 text-${color}-700 mb-6`}>
        {icon}
      </div>
      
      <div className="relative">
        <h3 className="font-black text-slate-900 text-xl mb-2 tracking-tight">{mode}</h3>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">{description}</p>
        
        <div className={`flex items-center gap-2 text-${color}-600 text-xs font-bold uppercase tracking-widest`}>
          Execute Mode <ICONS.Zap />
        </div>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* 1. Configuration Sidebar */}
      <aside className="w-full md:w-80 lg:w-96 bg-slate-950 text-white flex-shrink-0 flex flex-col sticky top-0 h-screen overflow-y-auto no-print z-50">
        <div className="p-8 border-b border-slate-900 bg-slate-950">
          <div className="flex items-center gap-4 mb-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <ICONS.BookOpen />
            </div>
            <h1 className="font-black text-xl tracking-tighter uppercase italic">EduTools AI</h1>
          </div>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">CAPS Assessment Engine</p>
        </div>

        <div className="p-8 space-y-8 flex-1">
          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Selection</h3>
            <div className="space-y-3">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Subject</label>
                <select 
                  className="w-full bg-transparent text-sm font-bold text-white outline-none cursor-pointer"
                  value={params.subject}
                  onChange={e => setParams({...params, subject: e.target.value})}
                >
                  {SUBJECTS.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
                </select>
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Grade Level</label>
                <select 
                  className="w-full bg-transparent text-sm font-bold text-white outline-none cursor-pointer"
                  value={params.grade}
                  onChange={e => setParams({...params, grade: e.target.value})}
                >
                  {GRADES.map(g => <option key={g} value={g} className="bg-slate-900">{g}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Topic Details</h3>
            <div className="space-y-3">
              <input 
                type="text"
                placeholder="Primary Topic (e.g. Safety)"
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-sm font-bold placeholder:text-slate-600 focus:border-indigo-500 outline-none transition-all"
                value={params.topic}
                onChange={e => setParams({...params, topic: e.target.value})}
              />
              <input 
                type="text"
                placeholder="Sub-topic (Optional)"
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-sm font-semibold placeholder:text-slate-600 focus:border-indigo-500 outline-none transition-all"
                value={params.subTopic}
                onChange={e => setParams({...params, subTopic: e.target.value})}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Parameters</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Marks</label>
                <input 
                  type="number"
                  className="w-full bg-transparent font-black text-lg text-white outline-none"
                  value={params.totalMarks}
                  onChange={e => setParams({...params, totalMarks: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Qty</label>
                <input 
                  type="number"
                  className="w-full bg-transparent font-black text-lg text-white outline-none"
                  value={params.questionCount}
                  onChange={e => setParams({...params, questionCount: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
              <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Cognitive Level</label>
              <select 
                className="w-full bg-transparent text-xs font-bold text-white outline-none cursor-pointer"
                value={params.cognitiveLevel}
                onChange={e => setParams({...params, cognitiveLevel: e.target.value as CognitiveLevel})}
              >
                {Object.values(CognitiveLevel).map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
              </select>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Contextual Input</h3>
            <textarea 
              placeholder="Paste existing text for Rewriter mode or specific details here..."
              className="w-full bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs font-medium min-h-[140px] resize-none focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600"
              value={params.additionalNotes}
              onChange={e => setParams({...params, additionalNotes: e.target.value})}
            />
          </section>
        </div>

        <div className="p-8 border-t border-slate-900 bg-slate-950/50">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-center">
            DBE Standards Compliant v3.1
          </p>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-12 lg:p-16">
          {!result && !isLoading && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-12">
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">
                  Assessment Dashboard
                </h2>
                <p className="text-slate-500 text-lg font-medium">
                  Configure your subject details in the sidebar and choose a generation mode below.
                </p>
              </div>

              {error && (
                <div className="mb-10 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-4 animate-in slide-in-from-top-2">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ToolCard 
                  mode={ToolMode.QUESTION_GENERATOR}
                  icon={<ICONS.Plus />}
                  description="Generate formal CAPS examination questions with mark allocation."
                  color="indigo"
                />
                <ToolCard 
                  mode={ToolMode.MEMORANDUM}
                  icon={<ICONS.Check />}
                  description="Create detailed marking guidelines, formulas, and model answers."
                  color="emerald"
                />
                <ToolCard 
                  mode={ToolMode.WORKSHEET_BUILDER}
                  icon={<ICONS.Settings />}
                  description="Build classroom-ready worksheets with progressive difficulty."
                  color="amber"
                />
                <ToolCard 
                  mode={ToolMode.REWRITER}
                  icon={<ICONS.Zap />}
                  description="Adjust cognitive demand or rewrite content for exam standards."
                  color="purple"
                />
              </div>

              <div className="mt-20 p-10 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col items-center text-center shadow-sm">
                 <div className="text-slate-200 mb-4 scale-150">
                    <ICONS.BookOpen />
                 </div>
                 <h4 className="text-slate-400 font-black text-xs uppercase tracking-widest mb-2">Engine Intelligence</h4>
                 <p className="text-slate-500 max-w-md text-sm leading-relaxed">
                   The EduTools AI engine utilizes senior CAPS examiner guidelines to ensure all generated content meets Department of Basic Education standards for validity and cognitive weighting.
                 </p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center">
              <div className="w-32 h-1 bg-slate-200 rounded-full overflow-hidden mb-12 shadow-inner">
                <div className="h-full bg-indigo-600 animate-[loading_1.5s_infinite_linear]"></div>
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 italic uppercase">Generating Content</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Assembling {params.subject} assessment for {params.grade}...
              </p>
              <style>{`
                @keyframes loading {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
              `}</style>
            </div>
          )}

          {result && !isLoading && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 no-print">
                <button 
                  onClick={() => setResult(null)}
                  className="group flex items-center gap-3 text-slate-500 hover:text-indigo-600 font-black text-sm uppercase tracking-widest transition-all"
                >
                  <span className="bg-slate-200 group-hover:bg-indigo-100 p-2 rounded-lg transition-colors text-slate-900 group-hover:text-indigo-600">←</span>
                  Back to Tools
                </button>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => window.print()}
                    className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:bg-slate-900 active:scale-95 transition-all"
                  >
                    <ICONS.Print /> Download NSC Paper (PDF)
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 print-area overflow-hidden">
                <div className="p-10 md:p-16 lg:p-20 prose prose-slate max-w-none prose-headings:text-slate-950 prose-p:text-slate-900 prose-li:text-slate-900">
                  <div className="whitespace-pre-wrap font-serif text-[1.15rem] leading-[1.8]">
                    {result.content.split('\n').map((line, i) => {
                      if (line.startsWith('# ')) return (
                        <div key={i} className="mb-16">
                          <h1 className="text-4xl font-black text-center uppercase border-b-8 border-slate-950 pb-6 mb-2 tracking-tighter italic">
                            {line.replace('# ', '')}
                          </h1>
                          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">Official Assessment Documentation</p>
                        </div>
                      );
                      if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-black mt-16 mb-6 border-b-4 border-slate-100 pb-3 uppercase italic tracking-tight">{line.replace('## ', '')}</h2>;
                      if (line.match(/^\d+\./)) return <div key={i} className="mt-12 mb-6 font-black text-xl text-slate-950 border-l-8 border-indigo-600 pl-6 bg-indigo-50/30 py-4 rounded-r-xl">{line}</div>;
                      return <p key={i} className="mb-4">{line}</p>;
                    })}
                  </div>
                </div>
                
                <div className="bg-slate-950 p-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] no-print">
                  <div className="flex items-center gap-4">
                     <div className="bg-indigo-600/20 text-indigo-400 p-2 rounded-lg">VERIFIED</div>
                     <span>© EDU-TOOLS AI • CAPS ENGINE</span>
                  </div>
                  <span>REF: {Math.random().toString(36).substr(2, 10).toUpperCase()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="py-12 px-8 text-center no-print">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
            <div className="h-px w-32 bg-slate-200"></div>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.5em]">DBE Standards Compliant</p>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
