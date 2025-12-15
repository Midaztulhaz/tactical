import React, { useRef, useEffect } from 'react';
import { OsintResult } from '../types';

interface IntelGraphProps {
  result: OsintResult;
  width?: number;
  height?: number;
}

export const IntelGraph: React.FC<IntelGraphProps> = ({ result, width = 800, height = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajustar DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Nodes
    const nodes: any[] = [];
    
    // Central Node (Target)
    nodes.push({ x: centerX, y: centerY, type: 'target', label: 'TARGET', r: 25 });

    // Profile Nodes
    result.foundProfiles.forEach((p, i) => {
      const angle = (i / result.foundProfiles.length) * Math.PI * 2;
      const dist = 120;
      nodes.push({
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        type: 'profile',
        label: p.platform,
        r: 10,
        color: '#00ff9f'
      });
    });

    // Source Nodes
    const uniqueSources = result.sources.slice(0, 8); // Limit clutter
    uniqueSources.forEach((s, i) => {
      const angle = (i / uniqueSources.length) * Math.PI * 2 + 0.5;
      const dist = 180;
      nodes.push({
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        type: 'source',
        label: 'WEB',
        r: 6,
        color: '#00f0ff'
      });
    });

    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      // Draw Connections
      ctx.lineWidth = 1;
      nodes.forEach((node, i) => {
        if (node.type === 'target') return;
        
        ctx.beginPath();
        ctx.moveTo(nodes[0].x, nodes[0].y);
        ctx.lineTo(node.x, node.y);
        
        const grad = ctx.createLinearGradient(nodes[0].x, nodes[0].y, node.x, node.y);
        grad.addColorStop(0, 'rgba(0, 255, 159, 0.1)');
        grad.addColorStop(1, 'rgba(0, 240, 255, 0.5)');
        ctx.strokeStyle = grad;
        ctx.stroke();

        // Moving Packet
        const packetSpeed = 0.02;
        const offset = (frame * packetSpeed + i * 10) % 1;
        const packetX = nodes[0].x + (node.x - nodes[0].x) * offset;
        const packetY = nodes[0].y + (node.y - nodes[0].y) * offset;
        
        ctx.beginPath();
        ctx.arc(packetX, packetY, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      });

      // Draw Nodes
      nodes.forEach(node => {
        ctx.beginPath();
        
        if (node.type === 'target') {
          // Pulse Effect
          ctx.arc(node.x, node.y, node.r + Math.sin(frame * 0.05) * 5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 42, 109, 0.2)'; // Neon Red
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
          ctx.fillStyle = '#ff2a6d';
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#ff2a6d';
        } else {
          ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.shadowBlur = 10;
          ctx.shadowColor = node.color;
        }
        
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        if (node.label) {
          ctx.fillStyle = '#fff';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y + node.r + 15);
        }
      });

      frame++;
      requestAnimationFrame(draw);
    };

    const animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [result]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black/40 border border-onyx-800 rounded-lg overflow-hidden relative">
      <div className="absolute top-2 left-2 text-[10px] text-neon-green font-mono z-10">LINK ANALYSIS V1.0</div>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};