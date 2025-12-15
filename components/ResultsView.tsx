import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { OsintResult, GroundingChunk, PersonalData } from '../types';
import { ExternalLink, ShieldAlert, Globe, User, Database, Lock, MapPin, Navigation, Volume2, StopCircle, Network, EyeOff, Eye, FileText, Phone, Mail, Users, Briefcase, FileDigit, Fingerprint, Target } from 'lucide-react';
import { IntelGraph } from './IntelGraph';
import { playSfx } from '../services/audioFx';

interface ResultsViewProps {
  result: OsintResult;
  onReset: () => void;
  onPivot: (query: string) => void;
}

// Componente Cartão de Dados Pessoais
const PersonalDataCard = ({ data, isRedacted }: { data: PersonalData, isRedacted: boolean }) => {
    return (
        <div className="bg-onyx-900 border border-onyx-700 rounded-lg overflow-hidden mb-6 shadow-lg shadow-black/50">
            <div className="bg-onyx-950 p-3 border-b border-onyx-800 flex justify-between items-center">
                <h3 className="text-neon-green font-mono font-bold uppercase flex items-center gap-2">
                    <Fingerprint size={16} /> Ficha Civil
                </h3>
                <span className="text-[10px] text-onyx-500 font-mono">CONFIDENCE: HIGH</span>
            </div>
            
            <div className={`p-4 grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-sm ${isRedacted ? 'blur-[4px]' : ''}`}>
                
                {/* Identificação Principal */}
                <div className="space-y-4">
                    <div className="p-3 bg-onyx-950/50 rounded border border-onyx-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-2 h-2 bg-neon-green/50 rounded-bl"></div>
                        <span className="text-onyx-500 text-[10px] uppercase block mb-1">Nome Completo (Target)</span>
                        <div className="text-neon-green font-bold text-xl tracking-wide drop-shadow-[0_0_5px_rgba(0,255,159,0.3)]">
                            {data.fullName || "NÃO IDENTIFICADO"}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-2 bg-onyx-950/30 rounded border border-onyx-800/50">
                            <span className="text-onyx-500 text-[10px] uppercase block flex items-center gap-1 mb-1">
                                <FileDigit size={10}/> CPF/Doc
                            </span>
                            <div className="text-yellow-400 font-bold tracking-widest text-lg">
                                {data.cpf || "N/A"}
                            </div>
                        </div>
                        <div className="p-2 bg-onyx-950/30 rounded border border-onyx-800/50">
                            <span className="text-onyx-500 text-[10px] uppercase block flex items-center gap-1 mb-1">
                                <Briefcase size={10}/> Ocupação
                            </span>
                            <div className="text-cyan-400 font-medium">
                                {data.occupation || "N/A"}
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-2 bg-onyx-950/30 rounded border border-onyx-800/50">
                         <span className="text-onyx-500 text-[10px] uppercase block flex items-center gap-1 mb-1">
                            <MapPin size={10}/> Localização Atual
                         </span>
                         <div className="text-cyan-400 font-medium">
                            {data.location || "Desconhecida"}
                         </div>
                    </div>
                </div>

                {/* Contatos e Família */}
                <div className="space-y-4 md:border-l md:border-onyx-800 md:pl-6">
                    
                    {/* Contato */}
                    <div className="space-y-2">
                        <span className="text-onyx-500 text-[10px] uppercase block">Canais de Contato</span>
                        <div className="grid grid-cols-1 gap-1">
                        {data.contact.emails.length > 0 || data.contact.phones.length > 0 ? (
                            <>
                                {data.contact.emails.map((e, i) => (
                                    <div key={`e-${i}`} className="flex items-center gap-2 text-violet-400 bg-violet-900/10 px-2 py-1 rounded border border-violet-900/20">
                                        <Mail size={12} /> {e}
                                    </div>
                                ))}
                                {data.contact.phones.map((p, i) => (
                                    <div key={`p-${i}`} className="flex items-center gap-2 text-violet-400 bg-violet-900/10 px-2 py-1 rounded border border-violet-900/20">
                                        <Phone size={12} /> {p}
                                    </div>
                                ))}
                            </>
                        ) : <span className="text-onyx-600 italic text-xs">Nenhum contato público.</span>}
                        </div>
                    </div>

                    {/* Família */}
                    <div className="pt-2 border-t border-onyx-800">
                        <span className="text-onyx-500 text-[10px] uppercase block mb-2 flex items-center gap-1">
                            <Users size={12}/> Vínculos Familiares
                        </span>
                        <div className="space-y-2 bg-onyx-950/30 p-2 rounded border border-onyx-800/50">
                             {data.family.spouse && (
                                <div className="flex justify-between border-b border-onyx-800/50 pb-1">
                                    <span className="text-onyx-400 text-xs">Cônjuge:</span>
                                    <span className="text-orange-400 font-bold">{data.family.spouse}</span>
                                </div>
                             )}
                             {data.family.children.length > 0 && (
                                <div className="flex justify-between border-b border-onyx-800/50 pb-1">
                                    <span className="text-onyx-400 text-xs">Filhos:</span>
                                    <span className="text-orange-400 text-right">{data.family.children.join(", ")}</span>
                                </div>
                             )}
                             {data.family.parents.length > 0 && (
                                <div className="flex justify-between border-b border-onyx-800/50 pb-1">
                                    <span className="text-onyx-400 text-xs">Pais:</span>
                                    <span className="text-orange-400 text-right">{data.family.parents.join(", ")}</span>
                                </div>
                             )}
                             {data.family.others.length > 0 && (
                                <div className="flex justify-between border-b border-onyx-800/50 pb-1">
                                    <span className="text-onyx-400 text-xs">Outros:</span>
                                    <span className="text-orange-400 text-right">{data.family.others.join(", ")}</span>
                                </div>
                             )}
                             {!data.family.spouse && data.family.children.length === 0 && data.family.parents.length === 0 && data.family.others.length === 0 && (
                                 <span className="text-onyx-600 italic text-xs">Nenhum vínculo direto identificado.</span>
                             )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onReset, onPivot }) => {
  const [copied, setCopied] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'graph'>('report');
  const [isRedacted, setIsRedacted] = useState(false);
  
  const mapSources = result.sources.filter(s => s.maps?.uri);
  const webSources = result.sources.filter(s => s.web?.uri);

  useEffect(() => {
     playSfx('success');
  }, [result]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleSpeech = () => {
    playSfx('click');
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(result.summary.replace(/[*#_]/g, ''));
      utterance.lang = 'pt-BR';
      utterance.pitch = 0.9; 
      utterance.rate = 1.1; 
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const toggleRedaction = () => {
    playSfx('click');
    setIsRedacted(!isRedacted);
  };

  const handleDownloadDossier = () => {
    playSfx('click');
    const dossierHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>DOSSIÊ CIVIL - ${result.personalData?.fullName || "ALVO"}</title>
        <style>
            body { font-family: monospace; background: #eee; padding: 20px; }
            .box { background: #fff; padding: 20px; border: 1px solid #999; margin-bottom: 20px; }
            h1 { border-bottom: 2px solid #000; }
            .field { margin-bottom: 5px; }
            .label { font-weight: bold; }
        </style>
      </head>
      <body>
         <h1>DOSSIÊ INVESTIGATIVO</h1>
         <div class="box">
            <h2>DADOS PESSOAIS</h2>
            <div class="field"><span class="label">NOME:</span> ${result.personalData?.fullName || "N/A"}</div>
            <div class="field"><span class="label">CPF/DOC:</span> ${result.personalData?.cpf || "N/A"}</div>
            <div class="field"><span class="label">LOCAL:</span> ${result.personalData?.location || "N/A"}</div>
            <div class="field"><span class="label">PROFISSÃO:</span> ${result.personalData?.occupation || "N/A"}</div>
         </div>
         <div class="box">
            <h2>FAMÍLIA</h2>
            <div class="field"><span class="label">CÔNJUGE:</span> ${result.personalData?.family.spouse || "N/A"}</div>
            <div class="field"><span class="label">FILHOS:</span> ${result.personalData?.family.children.join(", ") || "N/A"}</div>
         </div>
         <div class="box">
            <h2>RELATÓRIO</h2>
            <pre>${result.summary}</pre>
         </div>
      </body>
      </html>
    `;
    const blob = new Blob([dossierHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DOSSIE_${result.personalData?.fullName?.replace(/\s/g,'_') || 'ALVO'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    playSfx('click');
    navigator.clipboard.writeText(result.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const extractQueryFromProfile = (profile: {url: string, platform: string}) => {
    try {
      const urlObj = new URL(profile.url);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] || "";
    } catch {
      return "";
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl mx-auto pb-20">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-t-lg border border-onyx-700 bg-onyx-950 p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-2xl group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-neon-green to-neon-blue"></div>
        {isRedacted && <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-20 pointer-events-none flex items-center justify-center">
            <span className="text-neon-red font-bold font-mono border-2 border-neon-red px-4 py-1 -rotate-12 opacity-50 text-xl">DADOS PROTEGIDOS</span>
        </div>}

        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 bg-black border border-onyx-700 rounded flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Target size={32} className="text-neon-red" />
          </div>
          <div>
            <h2 className="text-2xl font-mono font-bold text-white tracking-widest uppercase">Radar Maezuru</h2>
            <div className="flex items-center gap-2 text-xs text-onyx-400 font-mono mt-1">
              STATUS: <span className="text-neon-green">VARREDURA COMPLETA</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 font-mono text-xs z-30 flex-wrap justify-end">
           <button onClick={toggleRedaction} className={`flex items-center gap-2 px-4 py-2 border rounded transition-all ${isRedacted ? 'bg-neon-red text-black border-neon-red font-bold' : 'bg-onyx-900 border-onyx-700 text-white'}`}>
             {isRedacted ? <EyeOff size={14} /> : <Eye size={14} />} {isRedacted ? "MODO SEGURO" : "VISUALIZAR"}
           </button>
           <button onClick={toggleSpeech} className={`flex items-center gap-2 px-4 py-2 border rounded transition-all ${isSpeaking ? 'bg-neon-blue/20 border-neon-blue text-white animate-pulse' : 'bg-onyx-900 hover:bg-onyx-800 border-onyx-700 text-white'}`}>
             {isSpeaking ? <StopCircle size={14} /> : <Volume2 size={14} />} {isSpeaking ? "PARAR" : "OUVIR"}
           </button>
           <button onClick={handleDownloadDossier} className="flex items-center gap-2 px-4 py-2 bg-neon-green hover:bg-emerald-400 text-black font-bold border border-transparent rounded transition-all">
             <FileText size={14} /> EXPORTAR FICHA
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        <div className="lg:col-span-8 space-y-6">
            
            {/* NOVO: Cartão de Dados Pessoais em Destaque */}
            {result.personalData && <PersonalDataCard data={result.personalData} isRedacted={isRedacted} />}

            <div className="flex gap-2 border-b border-onyx-800 pb-2">
                <button onClick={() => setActiveTab('report')} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-mono text-sm transition-all ${activeTab === 'report' ? 'bg-onyx-800 text-neon-green border-t border-neon-green' : 'text-onyx-500 hover:text-white'}`}>
                <Database size={14} /> DETALHES
                </button>
                <button onClick={() => setActiveTab('graph')} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg font-mono text-sm transition-all ${activeTab === 'graph' ? 'bg-onyx-800 text-neon-blue border-t border-neon-blue' : 'text-onyx-500 hover:text-white'}`}>
                <Network size={14} /> CONEXÕES
                </button>
            </div>

            {activeTab === 'report' ? (
                <div className="bg-onyx-900/50 border border-onyx-700 rounded-lg overflow-hidden backdrop-blur-sm relative p-8">
                    <div className={`prose prose-invert prose-sm max-w-none text-onyx-200 font-mono ${isRedacted ? 'blur-sm' : ''}`}>
                         <ReactMarkdown components={{ a: ({node, ...props}) => <a {...props} className="text-neon-blue hover:text-white underline decoration-dashed underline-offset-4 break-all" target="_blank" rel="noopener noreferrer" /> }}>
                            {result.summary}
                         </ReactMarkdown>
                    </div>
                </div>
            ) : (
                <div className={`h-[600px] ${isRedacted ? 'blur-lg' : ''}`}>
                   <IntelGraph result={result} />
                </div>
            )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-4">
             <button onClick={onReset} className="w-full py-4 bg-neon-green hover:bg-emerald-400 text-black font-bold font-mono text-sm rounded shadow-[0_0_15px_rgba(0,255,159,0.3)] transition-all uppercase tracking-wider flex items-center justify-center gap-2">
                 NOVA INVESTIGAÇÃO
             </button>

             {/* Links Encontrados */}
             <div className="bg-onyx-900 border border-onyx-700 rounded-lg p-4">
                <h3 className="text-xs font-mono text-onyx-400 uppercase mb-3 flex items-center gap-2"><Globe size={14} /> Pegada Digital</h3>
                <div className="flex flex-col gap-2">
                {result.foundProfiles.map((profile, idx) => {
                    const pivotQuery = extractQueryFromProfile(profile);
                    return (
                    <div key={idx} className={`flex items-center gap-2 ${isRedacted ? 'blur-[3px]' : ''}`}>
                        <a href={profile.url} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-between px-3 py-2 rounded text-xs border transition-all bg-onyx-800 border-onyx-700 text-onyx-300 hover:border-neon-blue hover:text-white">
                           <span className="truncate">{profile.platform}</span>
                        </a>
                        {pivotQuery && (
                           <button onClick={() => onPivot(pivotQuery)} className="p-2 bg-onyx-800 border border-onyx-700 rounded text-neon-blue hover:bg-neon-blue hover:text-black">
                               <Target size={14} />
                           </button>
                        )}
                    </div>
                    )
                })}
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};