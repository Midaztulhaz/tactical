import React, { useEffect, useState, useRef } from 'react';

interface ScanningOverlayProps {
  query: string;
}

const steps = [
  "Handshake Neural Estabelecido...",
  "Injetando Payload em Backbone Global...",
  "Bypassing Firewalls (Nível Militar)...",
  "Triangulando Assinaturas Biométricas...",
  "Acessando Deep Web Index Node...",
  "Correlacionando Grafos Sociais Ocultos...",
  "Decriptando Metadados de Mídia...",
  "Compilando Vetores de Inteligência..."
];

export const ScanningOverlay: React.FC<ScanningOverlayProps> = ({ query }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const avatarCanvasRef = useRef<HTMLCanvasElement>(null);

  // --- VISUAL: MATRIX RAIN ---
  useEffect(() => {
    const canvas = matrixCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = '01XYZE0101'; // Simplificado para performance
    const charArray = chars.split('');
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = new Array(Math.ceil(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.globalAlpha = Math.random() * 0.5 + 0.1;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.985) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      ctx.globalAlpha = 1;
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // --- VISUAL: SIRI LIQUID ORB ---
  useEffect(() => {
    const canvas = avatarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const drawBlob = (color: string, offset: number, speed: number) => {
      ctx.beginPath();
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 60;
      
      for (let i = 0; i <= Math.PI * 2; i += 0.1) {
        // Organic distortion
        const r = baseRadius + Math.sin(i * 3 + time * speed + offset) * 10 
                             + Math.cos(i * 5 - time * speed) * 8;
        const x = centerX + Math.cos(i) * r;
        const y = centerY + Math.sin(i) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    const drawAvatar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Global Composite Operation for mixing colors (Lighten/Screen effect)
      ctx.globalCompositeOperation = 'screen';
      
      // Layer 1: Cyan/Blue
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#00f0ff';
      drawBlob('rgba(0, 240, 255, 0.6)', 0, 0.05);

      // Layer 2: Neon Green
      ctx.shadowColor = '#00ff9f';
      drawBlob('rgba(0, 255, 159, 0.6)', 2, 0.07);

      // Layer 3: Pink/Purple
      ctx.shadowColor = '#ff2a6d';
      drawBlob('rgba(255, 42, 109, 0.5)', 4, 0.03);

      ctx.globalCompositeOperation = 'source-over';
      
      // Core Shine
      ctx.beginPath();
      ctx.arc(canvas.width/2, canvas.height/2, 40, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fill();

      time += 1;
      requestAnimationFrame(drawAvatar);
    };

    const animId = requestAnimationFrame(drawAvatar);
    return () => cancelAnimationFrame(animId);
  }, []);

  // --- LOG LOGIC (SEM SOM) ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev < steps.length - 1 ? prev + 1 : prev;
        return next;
      });

      setLogs((prev) => [
        `[${new Date().toLocaleTimeString('pt-BR', {hour12: false})}.${Math.floor(Math.random()*999)}] ${steps[currentStep % steps.length]}`,
        ...prev
      ].slice(0, 12)); 
    }, 800);

    return () => clearInterval(interval);
  }, [currentStep]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center font-mono overflow-hidden">
      
      {/* Background Matrix Rain */}
      <canvas 
        ref={matrixCanvasRef} 
        className="absolute inset-0 z-0 opacity-40"
      />

      {/* Main Container - TACTICAL HUD */}
      <div className="z-10 w-full max-w-5xl p-4 flex flex-col md:flex-row items-center justify-center gap-8 relative">
        
        {/* Lado Esquerdo: IA Líquida */}
        <div className="relative group">
          {/* External decorative rings */}
          <div className="absolute inset-0 border border-white/10 rounded-full w-[240px] h-[240px] -m-2 animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-0 border-t border-neon-blue rounded-full w-[240px] h-[240px] -m-2 animate-[spin_3s_linear_infinite]"></div>

          <canvas 
            ref={avatarCanvasRef}
            width={220}
            height={220}
            className="rounded-full bg-black/40 backdrop-blur-sm border border-white/5 shadow-[0_0_50px_rgba(0,255,159,0.15)]"
          />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 font-bold tracking-widest text-xs pointer-events-none mix-blend-overlay">
            MAEZURU
          </div>
        </div>

        {/* Lado Direito: Terminal de Dados */}
        <div className="w-full max-w-xl">
           <div className="bg-onyx-950/90 border-l-4 border-neon-green p-6 shadow-2xl backdrop-blur-md relative overflow-hidden h-[300px] flex flex-col">
              
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-2 w-full animate-scan pointer-events-none"></div>

              <div className="flex justify-between items-end border-b border-onyx-800 pb-2 mb-4">
                 <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
                       Busca<span className="text-neon-green">Ativa</span>
                    </h2>
                    <p className="text-[10px] text-onyx-400 mt-1">
                       ALVO: <span className="text-neon-blue">{query}</span>
                    </p>
                 </div>
                 <div className="text-right">
                    <div className="text-neon-green font-bold text-xl animate-pulse">
                       Processing...
                    </div>
                 </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col justify-end space-y-1">
                 {logs.map((log, i) => (
                    <div 
                      key={i} 
                      className={`font-mono text-xs truncate transition-all duration-300 ${i === 0 ? 'text-neon-green font-bold text-sm pl-2 border-l-2 border-neon-green bg-neon-green/10' : 'text-onyx-400 opacity-60'}`}
                    >
                      {i === 0 ? '> ' : ''}{log}
                    </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};