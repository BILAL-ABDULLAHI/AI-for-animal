
import React, { useState, useEffect } from 'react';
import { AnalysisInput, AnalysisResult, HistoryItem } from './types';
import { analyzeAnimalHealth } from './services/gemini';
import { 
  Stethoscope, 
  History, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Camera,
  Loader2,
  Trash2,
  ExternalLink
} from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'form' | 'result' | 'history'>('landing');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentResult, setCurrentResult] = useState<HistoryItem | null>(null);
  const [formData, setFormData] = useState<AnalysisInput>({
    category: 'Cattle',
    specificType: '',
    age: '',
    symptoms: '',
    behaviorChanges: '',
    feedingPatterns: '',
    environment: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('vetsense_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (item: HistoryItem) => {
    const newHistory = [item, ...history];
    setHistory(newHistory);
    localStorage.setItem('vetsense_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your history?')) {
      setHistory([]);
      localStorage.removeItem('vetsense_history');
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeAnimalHealth(formData);
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleString(),
        input: { ...formData },
        result
      };
      saveToHistory(historyItem);
      setCurrentResult(historyItem);
      setView('result');
    } catch (error) {
      console.error(error);
      alert('An error occurred during analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setView('landing')}
            >
              <div className="p-2 bg-emerald-600 rounded-lg group-hover:bg-emerald-700 transition-colors">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">VetSense AI</span>
            </div>
            
            <div className="flex gap-6">
              <button 
                onClick={() => setView('form')}
                className={`text-sm font-medium transition-colors ${view === 'form' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}
              >
                Analyze
              </button>
              <button 
                onClick={() => setView('history')}
                className={`text-sm font-medium transition-colors ${view === 'history' ? 'text-emerald-600' : 'text-slate-600 hover:text-emerald-600'}`}
              >
                History
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {view === 'landing' && (
          <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in duration-700">
            <div className="max-w-3xl space-y-4 pt-12">
              <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Specialized Intelligence for <span className="text-emerald-600 italic">Animal Health</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Empowering farmers and animal owners with domain-specific AI for accurate problem analysis, 
                solution recommendations, and preventive guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-8">
              {[
                { icon: CheckCircle2, title: "Symptom Analysis", desc: "Expert assessment of physical and behavioral changes." },
                { icon: Info, title: "Preventive Care", desc: "Evidence-based guidance to improve long-term welfare." },
                { icon: AlertTriangle, title: "Emergency Detection", desc: "Early warning for critical conditions requiring a vet." }
              ].map((feature, i) => (
                <div key={i} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left">
                  <feature.icon className="w-10 h-10 text-emerald-600 mb-4" />
                  <h3 className="font-bold text-lg text-slate-900">{feature.title}</h3>
                  <p className="text-slate-500 mt-2">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <button 
                onClick={() => setView('form')}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-700 transition-all transform hover:scale-105 shadow-lg shadow-emerald-200"
              >
                Start New Analysis
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-16 w-full">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">Supported Species</h2>
              <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
                {['Cattle', 'Poultry', 'Rams & Sheep', 'Goats', 'Dogs'].map(type => (
                  <span key={type} className="text-lg font-medium text-slate-700">{type}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'form' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Health Assessment</h2>
                  <p className="text-slate-500 text-sm">Provide details about the animal's condition</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Animal Category</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    >
                      <option value="Cattle">Cattle</option>
                      <option value="Poultry">Poultry</option>
                      <option value="Small Ruminants">Small Ruminants</option>
                      <option value="Companion Animals">Companion Animals (Dogs)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Age / Specific Breed</label>
                    <input 
                      type="text"
                      placeholder="e.g. 3 years / Friesian"
                      value={formData.specificType}
                      onChange={(e) => setFormData(prev => ({ ...prev, specificType: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Observed Symptoms</label>
                  <textarea 
                    rows={3}
                    placeholder="Describe physical signs (e.g. coughing, wounds, diarrhea...)"
                    value={formData.symptoms}
                    onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Behavioral Changes</label>
                    <input 
                      type="text"
                      placeholder="e.g. lethargy, aggression"
                      value={formData.behaviorChanges}
                      onChange={(e) => setFormData(prev => ({ ...prev, behaviorChanges: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Feeding Patterns</label>
                    <input 
                      type="text"
                      placeholder="e.g. loss of appetite"
                      value={formData.feedingPatterns}
                      onChange={(e) => setFormData(prev => ({ ...prev, feedingPatterns: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Environment/Hygiene</label>
                  <input 
                    type="text"
                    placeholder="e.g. damp floor, recent climate change"
                    value={formData.environment}
                    onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Visual Evidence (Optional)</label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {formData.imageUrl ? (
                          <img src={formData.imageUrl} className="h-20 w-auto rounded-lg mb-2 object-cover" />
                        ) : (
                          <Camera className="w-8 h-8 text-slate-400 mb-2" />
                        )}
                        <p className="text-xs text-slate-500">Click to upload photo of symptoms</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                <button 
                  disabled={loading || !formData.symptoms}
                  onClick={handleAnalyze}
                  className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing Health Data...
                    </>
                  ) : (
                    <>
                      Run AI Analysis
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-slate-400">
                  Disclaimer: This AI is for decision support and not a replacement for professional veterinary consultation.
                </p>
              </div>
            </div>
          </div>
        )}

        {view === 'result' && currentResult && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-12">
            <button 
              onClick={() => setView('form')}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to form
            </button>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              <div className={`p-8 ${currentResult.result.isEmergency ? 'bg-red-50' : 'bg-emerald-50'} border-b border-slate-200 flex justify-between items-start`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Analysis Report</span>
                    <span className="px-2 py-0.5 bg-white text-slate-600 text-[10px] font-bold rounded-full border border-slate-200">{currentResult.date}</span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-slate-900">
                    {currentResult.input.category}: {currentResult.input.specificType || 'Health Check'}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Confidence Score</div>
                  <div className="text-3xl font-black text-emerald-600">{currentResult.result.confidenceScore}%</div>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <section className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      Possible Conditions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {currentResult.result.possibleDiagnosis.map((item, i) => (
                        <span key={i} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                          {item}
                        </span>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      Recommended Actions
                    </h3>
                    <ul className="space-y-3">
                      {currentResult.result.recommendations.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <p className="text-slate-700 text-sm leading-relaxed">{item}</p>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      Preventive Measures
                    </h3>
                    <ul className="space-y-2">
                      {currentResult.result.preventiveMeasures.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600 text-sm italic">
                          <span>—</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <div className="space-y-6">
                  <div className={`p-6 rounded-2xl border ${currentResult.result.isEmergency ? 'bg-red-600 text-white border-red-700' : 'bg-amber-50 text-amber-800 border-amber-200'} shadow-lg`}>
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-6 h-6" />
                      <h4 className="font-bold text-lg uppercase tracking-tight">Referral Status</h4>
                    </div>
                    <p className="text-sm font-medium leading-relaxed mb-4">
                      {currentResult.result.referralAdvice}
                    </p>
                    {currentResult.result.isEmergency && (
                      <div className="animate-pulse bg-white/20 px-3 py-2 rounded-lg text-xs font-black uppercase text-center">
                        Contact Veterinarian Immediately
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 text-sm mb-3">Assessment Context</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Symptoms', val: currentResult.input.symptoms },
                        { label: 'Environment', val: currentResult.input.environment },
                      ].map((item, i) => (
                        <div key={i}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                          <p className="text-xs text-slate-600 line-clamp-2">{item.val}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <p className="text-[10px] text-slate-400 italic">This result is stored in your local session history.</p>
                <div className="flex gap-4">
                   <button 
                    onClick={() => window.print()}
                    className="text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'history' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Analysis History</h2>
                <p className="text-slate-500">Review your past animal health assessments</p>
              </div>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-semibold transition-colors p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="p-4 bg-slate-50 rounded-full w-fit mx-auto mb-4">
                  <History className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">No records found</h3>
                <p className="text-slate-500 mb-8">Start your first health assessment to build your history.</p>
                <button 
                  onClick={() => setView('form')}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  Run First Analysis
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setCurrentResult(item);
                      setView('result');
                    }}
                    className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer flex justify-between items-center"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-3 rounded-xl ${item.result.isEmergency ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.date}</span>
                          {item.result.isEmergency && (
                            <span className="text-[10px] bg-red-100 text-red-600 font-black px-2 py-0.5 rounded-full uppercase">Urgent</span>
                          )}
                        </div>
                        <h4 className="font-bold text-lg text-slate-800 group-hover:text-emerald-700 transition-colors">
                          {item.input.category}: {item.input.specificType || 'General Check'}
                        </h4>
                        <p className="text-sm text-slate-500 line-clamp-1">{item.result.possibleDiagnosis.join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4 hidden sm:block">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Confidence</div>
                        <div className="font-black text-emerald-600">{item.result.confidenceScore}%</div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-800">VetSense AI</span>
          </div>
          <p className="text-slate-400 text-xs">© 2024 Specialized Animal Health System. Supporting global animal welfare.</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-semibold text-slate-500 hover:text-emerald-600">Documentation</a>
            <a href="#" className="text-xs font-semibold text-slate-500 hover:text-emerald-600">Ethical Guidelines</a>
            <a href="#" className="text-xs font-semibold text-slate-500 hover:text-emerald-600">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
