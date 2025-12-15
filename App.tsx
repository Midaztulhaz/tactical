import React, { useState, useRef, useEffect } from 'react';
import { Search, Radar, Info, Terminal, ChevronDown, Paperclip, X, FileAudio, FileImage, MapPin, History, Trash2, ChevronRight, Zap, Eye, Globe, Lock, Cpu, Radio, CloudLightning, Share2, Download, CheckCircle2 } from 'lucide-react';
import { performOsintScan } from './services/geminiService';
import { OsintResult, SearchType, SearchHistoryItem } from './types';
import { ScanningOverlay } from './components/ScanningOverlay';
import { ResultsView } from './components/ResultsView';
import { playSfx } from './services/audioFx';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>(SearchType.USERNAME);
  const [isScanning, setIsScanning] = useState(false);
  const [deepScan, setDeepScan] = useState(false);
  const [result, setResult] = useState<OsintResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);
  
  // Telemetry States
  const [time, setTime] = useState(new Date());
  const [userIP, setUserIP] = useState("192.168.X.X");

  const [selectedFile, setSelectedFile] = useState<{name: string, type: string, base64: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('maezuru_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }

    const timer = setInterval(() => setTime(new Date()), 1000);
    setUserIP(`10.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`);
    
    return () => clearInterval(timer);
  }, []);

  const saveToHistory = (newResult: OsintResult, query: string, type: SearchType) => {
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: query.substring(0, 30),
      type,
      timestamp: Date.now(),
      result: newResult
    };
    
    const updatedHistory = [newItem, ...history].slice(0, 50); 
    setHistory(updatedHistory);
    localStorage.setItem('maezuru_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    playSfx('click');
    setHistory([]);
    localStorage.removeItem('maezuru_history');
  };

  const loadFromHistory = (item: SearchHistoryItem) => {
    playSfx('scan');
    setQuery(item.query);
    setSearchType(item.type);
    setResult(item.result);
    setShowHistory(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        setError("Arquivo excedeu o limite de segurança (5MB).");
        playSfx('error');
        return;
      }
      playSfx('success');
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        setSelectedFile({
          name: file.name,
          type: file.type,
          base64: base64Data
        });
        if (!query) {
             setQuery("Análise Forense de Arquivo");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePivot = (newQuery: string) => {
    playSfx('scan');
    setQuery(newQuery);
    setSearchType(SearchType.USERNAME); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() && !selectedFile) return;

    playSfx('scan');
    setIsScanning(true);
    setResult(null);
    setError(null);
    setShowHistory(false);

    try {
      const data = await performOsintScan({
        query,
        type: searchType,
        deepScan: deepScan,
        file: selectedFile ? {
          mimeType: selectedFile.type,
          data: selectedFile.base64
        } : undefined
      });
      
      const resultWithTimestamp = { ...data, timestamp: Date.now() };
      setResult(resultWithTimestamp);
      saveToHistory(resultWithTimestamp, query, searchType);

    } catch (err: any) {
      playSfx('error');
      setError(err.message || "Falha na conexão com os satélites de dados.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-neon-green selection:text-black overflow-x-hidden flex flex-col">
      
      {/* Navbar */}
      <nav className="border-b border-onyx-800 bg-onyx-950/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => {setResult(null); setQuery(''); playSfx('click');}}>
            <div className="relative">
               <Radar className="text-neon-green group-hover:rotate-180 transition-transform duration-700" size={24} />
               <div className="absolute inset-0 bg-neon-green/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="font-mono text-xl font-bold tracking-widest text-white uppercase">
              Radar<span className="text-neon-green">Maezuru</span>
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm font-mono">
            
            <button 
              onClick={() => { setShowDeploy(true); playSfx('click'); }}
              onMouseEnter={() => playSfx('hover')}
              className="flex items-center gap-2 px-3 py-1.5 rounded transition-colors text-neon-blue hover:bg-neon-blue/10 border border-transparent hover:border-neon-blue/30"
              title="Obter Link Permanente"
            >
               <CloudLightning size={16} />
               <span className="hidden md:inline font-bold">UPLINK / LINK</span>
            </button>

            <div className="h-6 w-px bg-onyx-800 hidden md:block"></div>

            <button 
              onClick={() => { setShowHistory(!showHistory); playSfx('click'); }}
              onMouseEnter={() => playSfx('hover')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors ${showHistory ? 'bg-neon-green text-black' : 'text-onyx-400 hover:text-white'}`}
            >
              <History size={16} />
              <span className="hidden md:inline">MISSÕES</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Deploy / Uplink Modal */}
      {showDeploy && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeploy(false)}>
           <div className="bg-onyx-950 border border-neon-blue w-full max-w-2xl rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.2)]" onClick={e => e.stopPropagation()}>
              <div className="bg-neon-blue/10 border-b border-neon-blue p-4 flex justify-between items-center">
                 <h2 className="text-neon-blue font-mono font-bold text-xl flex items-center gap-2">
                    <CloudLightning /> UPLINK: PUBLICAR NA WEB
                 </h2>
                 <button onClick={() => setShowDeploy(false)} className="text-neon-blue hover:text-white"><X /></button>
              </div>
              <div className="p-6 font-mono text-sm space-y-6">
                 <div className="flex items-start gap-4 p-4 bg-green-900/20 border border-green-500/50 rounded">
                    <CheckCircle2 className="text-green-400 shrink-0" size={24} />
                    <div>
                        <h3 className="text-green-400 font-bold mb-1">ARQUIVOS DE CONFIGURAÇÃO GERADOS</h3>
                        <p className="text-onyx-300 text-xs">
                            Acabei de criar o <code>package.json</code> e <code>vite.config.ts</code> na pasta do projeto. O código agora está pronto para build.
                        </p>
                    </div>
                 </div>

                 <p className="text-onyx-300">
                    Siga este procedimento tático para colocar o RADAR online (acesso pelo celular):
                 </p>
                 
                 <div className="grid grid-cols-1 gap-4">
                    <div className="bg-black border border-onyx-700 p-5 rounded hover:border-neon-green transition-colors group">
                       <h3 className="text-white font-bold mb-4 flex items-center gap-2 border-b border-onyx-800 pb-2">
                           <Share2 size={16} className="text-neon-blue"/> PASSO A PASSO
                       </h3>
                       <ol className="list-none space-y-4 text-xs text-onyx-300">
                          <li className="flex items-center gap-3">
                             <span className="bg-onyx-800 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">1</span>
                             <span>Baixe todo o código fonte (Use o botão de Download do seu editor).</span>
                          </li>
                          <li className="flex items-center gap-3">
                             <span className="bg-onyx-800 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">2</span>
                             <span>Acesse <a href="https://vercel.com/new" target="_blank" className="text-neon-blue underline">vercel.com/new</a>.</span>
                          </li>
                          <li className="flex items-center gap-3">
                             <span className="bg-onyx-800 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">3</span>
                             <span>Arraste a pasta baixada ou importe do GitHub.</span>
                          </li>
                          <li className="flex items-center gap-3">
                             <span className="bg-onyx-800 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold">4</span>
                             <span>Clique em <strong>DEPLOY</strong>. O Vercel detectará o <code>package.json</code> automaticamente.</span>
                          </li>
                       </ol>
                    </div>
                 </div>

                 <div className="bg-onyx-900 p-3 rounded border border-onyx-800 text-center">
                    <p className="text-neon-blue text-xs animate-pulse">
                       STATUS: SISTEMA PRONTO PARA MIGRAÇÃO
                    </p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* History Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-onyx-950 border-l border-onyx-800 transform transition-transform duration-300 z-50 shadow-2xl ${showHistory ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 border-b border-onyx-800 flex justify-between items-center">
          <h3 className="font-mono font-bold text-white uppercase">Registro de Operações</h3>
          <button onClick={() => setShowHistory(false)} className="text-onyx-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-4 overflow-y-auto h-[calc(100vh-120px)] space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center text-onyx-500 text-sm mt-10 font-mono">Nenhum registro tático.</div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                onClick={() => loadFromHistory(item)} 
                onMouseEnter={() => playSfx('hover')}
                className="p-3 bg-onyx-900 border border-onyx-800 rounded hover:border-neon-green/50 cursor-pointer group transition-all"
              >
                 <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-neon-blue uppercase tracking-wider">{item.type}</span>
                    <span className="text-[10px] text-onyx-500">{new Date(item.timestamp).toLocaleDateString()}</span>
                 </div>
                 <div className="font-mono text-sm text-onyx-200 truncate group-hover:text-neon-green">{item.query}</div>
              </div>
            ))
          )}
        </div>
        {history.length > 0 && (
          <div className="absolute bottom-0 w-full p-4 border-t border-onyx-800 bg-onyx-950">
            <button onClick={clearHistory} className="w-full flex items-center justify-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider">
              <Trash2 size={14} /> Expurgar Registros
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 pt-12 pb-20 relative z-10">
        
        {showHistory && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setShowHistory(false)} />}

        {isScanning && <ScanningOverlay query={query} />}

        {!result && !isScanning && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
            
            <div className="mb-10 text-center space-y-4 max-w-3xl">
              <h1 className="text-4xl md:text-7xl font-bold tracking-tighter text-white mb-2 uppercase">
                RADAR <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue">MAEZURU</span>
              </h1>
              <p className="text-onyx-400 text-lg md:text-xl font-light tracking-wide">
                Sistema de Vigilância Global e Inteligência OSINT.
              </p>
            </div>

            <div className="w-full max-w-3xl bg-onyx-900/50 p-3 rounded-xl border border-onyx-700 shadow-2xl backdrop-blur-sm z-10">
              <form onSubmit={handleSearch} className="flex flex-col gap-3">
                
                <div className="flex flex-col md:flex-row gap-2">
                    <div className="relative md:w-1/4">
                    <select 
                        value={searchType}
                        onChange={(e) => { setSearchType(e.target.value as SearchType); playSfx('click'); }}
                        className="w-full h-14 pl-4 pr-10 bg-onyx-950 border border-onyx-800 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-neon-green appearance-none cursor-pointer tracking-wider"
                    >
                        <option value="USERNAME">USERNAME</option>
                        <option value="EMAIL">EMAIL</option>
                        <option value="PHONE">TELEFONE</option>
                        <option value="REALNAME">NOME REAL</option>
                        <option value="DOMAIN">DOMÍNIO</option>
                        <option value="MULTIMIDIA">ARQUIVO</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-onyx-500 pointer-events-none" size={16} />
                    </div>

                    <div className="relative flex-1">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={
                        selectedFile ? "Arquivo carregado no sistema..." :
                        searchType === SearchType.USERNAME ? "Insira o username alvo..." :
                        "Insira o parâmetro de busca..."
                        }
                        className="w-full h-14 pl-12 pr-12 bg-onyx-950 border border-onyx-800 rounded-lg text-white placeholder-onyx-500 focus:outline-none focus:border-neon-green transition-all text-lg"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-onyx-500" size={20} />
                    
                    <button
                        type="button"
                        onClick={() => { fileInputRef.current?.click(); playSfx('click'); }}
                        onMouseEnter={() => playSfx('hover')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-onyx-400 hover:text-neon-blue transition-colors p-2 rounded hover:bg-onyx-900"
                        title="Anexar Evidência"
                    >
                        <Paperclip size={20} />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden" 
                        accept="image/*,audio/*,application/pdf"
                    />
                    </div>

                    <button 
                    type="submit"
                    disabled={!query && !selectedFile}
                    onMouseEnter={() => playSfx('hover')}
                    className="h-14 px-8 bg-neon-green hover:bg-emerald-400 text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,159,0.2)] hover:shadow-[0_0_25px_rgba(0,255,159,0.4)]"
                    >
                    INICIAR <Terminal size={18} />
                    </button>
                </div>

                {/* Additional Controls */}
                <div className="flex items-center justify-between px-2">
                   
                   {/* Deep Scan Toggle */}
                   <div 
                      onClick={() => { setDeepScan(!deepScan); playSfx('click'); }}
                      onMouseEnter={() => playSfx('hover')}
                      className="flex items-center gap-3 cursor-pointer group"
                   >
                      <div className={`w-10 h-5 rounded-full relative transition-colors ${deepScan ? 'bg-neon-red' : 'bg-onyx-700'}`}>
                         <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${deepScan ? 'left-6' : 'left-1'}`}></div>
                      </div>
                      <span className={`text-xs font-mono font-bold uppercase ${deepScan ? 'text-neon-red' : 'text-onyx-500'} group-hover:text-white transition-colors`}>
                        {deepScan ? 'Deep Scan Ativado' : 'Deep Scan Desativado'}
                      </span>
                   </div>

                   {/* File Indicator */}
                   {selectedFile && (
                        <div className="flex items-center gap-2 bg-onyx-800/50 border border-onyx-700 rounded p-1.5 px-3 animate-fade-in">
                            {selectedFile.type.startsWith('image') ? <FileImage size={14} className="text-neon-blue"/> : <FileAudio size={14} className="text-neon-red"/>}
                            <span className="text-xs text-onyx-200 font-mono truncate max-w-[150px]">{selectedFile.name}</span>
                            <button type="button" onClick={clearFile} className="ml-2 text-onyx-400 hover:text-white">
                                <X size={12} />
                            </button>
                        </div>
                    )}
                </div>

              </form>
            </div>
            
            <div className="mt-8 text-onyx-500 text-xs font-mono flex gap-4">
              <span className="flex items-center gap-1"><Eye size={12}/> VIGILÂNCIA PASSIVA</span>
              <span className="flex items-center gap-1"><Zap size={12}/> INTELIGÊNCIA ARTIFICIAL</span>
            </div>

          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mt-10 p-4 bg-red-950/40 border border-red-500/30 text-red-200 rounded-lg flex items-center gap-3 backdrop-blur-sm">
            <Info className="shrink-0" />
            <p className="font-mono text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto hover:text-white"><X size={16}/></button>
          </div>
        )}

        {result && !isScanning && (
          <ResultsView 
            result={result} 
            onReset={() => { setResult(null); playSfx('click'); }} 
            onPivot={handlePivot}
          />
        )}

      </main>

      {/* CIA Style Telemetry Footer */}
      <footer className="w-full bg-onyx-950 border-t border-onyx-800 text-[10px] text-onyx-400 font-mono py-1 px-4 z-50 select-none">
         <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
            
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2">
                  <Globe size={12} className="text-neon-blue" />
                  <span>IP: {userIP} <span className="text-onyx-600">(PROXY_CHAIN_ACTIVE)</span></span>
               </div>
               <div className="flex items-center gap-2">
                  <Lock size={12} className="text-neon-green" />
                  <span>ENCRYPTION: AES-256-GCM</span>
               </div>
               <div className="hidden md:flex items-center gap-2">
                   <Cpu size={12} className="text-onyx-500" />
                   <span>MEM: 64% / CPU: 12%</span>
               </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-neon-red animate-pulse">
                   <Radio size={12} />
                   <span>LIVE UPLINK</span>
                </div>
                <div className="text-onyx-300">
                   ZULU: {time.toISOString().split('T')[1].split('.')[0]} Z
                </div>
                <div className="text-onyx-600 hidden sm:block">
                   AUTH_TOKEN: {Math.random().toString(36).substring(7).toUpperCase()}
                </div>
            </div>

         </div>
      </footer>

    </div>
  );
};

export default App;