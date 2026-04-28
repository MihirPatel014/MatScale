/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import emailjs from '@emailjs/browser';
import { 
  Settings, 
  MousePointer2, 
  Keyboard as KeyboardIcon, 
  Maximize, 
  Minimize, 
  Sun, 
  Moon, 
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Info,
  Mail,
  Github,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  ExternalLink,
  Share2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Haptic, useHaptics } from './components/HapticAction';
import { AboutPage, PrivacyPage, TermsPage } from './components/Legal';
import { BrandLogo } from './components/BrandLogo';

// --- Constants & Types ---

type Page = 'visualizer' | 'about' | 'privacy' | 'terms';

type Unit = 'mm' | 'cm' | 'inch';

interface Equipment {
  id: string;
  name: string;
  width: number; // in inches
  height: number; // in inches
  x: number; // in pixels (relative to mat)
  y: number; // in pixels (relative to mat)
  type: 'keyboard' | 'mouse';
}

const KEYBOARD_LAYOUTS = {
  '100%': { width: 17.5, height: 5.5 },
  '75%': { width: 12.5, height: 5.0 },
  '60%': { width: 11.5, height: 4.2 },
};

const MOUSE_SIZE = { width: 2.5, height: 4.5 };

const PRESETS = [
  { name: 'Small (800x300)', width: 800, height: 300, unit: 'mm' as Unit },
  { name: 'Standard (900x400)', width: 900, height: 400, unit: 'mm' as Unit },
  { name: 'Large (1200x600)', width: 1200, height: 600, unit: 'mm' as Unit },
];

// --- Utilities ---

const toInches = (value: number, unit: Unit): number => {
  if (unit === 'inch') return value;
  if (unit === 'cm') return value / 2.54;
  if (unit === 'mm') return value / 25.4;
  return value;
};

const fromInches = (inches: number, unit: Unit): number => {
  if (unit === 'inch') return inches;
  if (unit === 'cm') return inches * 2.54;
  if (unit === 'mm') return inches * 25.4;
  return inches;
};

const formatValue = (val: number) => Number(val.toFixed(1));

// --- Realistic Equipment Components ---

const RealisticKeyboard = ({ layout, isDarkMode }: { layout: string, isDarkMode: boolean }) => {
  // Approximate key counts for visual representation
  const rows = 5;
  const cols = layout === '100%' ? 22 : layout === '75%' ? 16 : 15;
  
  return (
    <div className="relative w-full h-full p-1 flex flex-col gap-0.5">
      {/* Case */}
      <div className={`absolute inset-0 rounded-lg border-b-4 ${isDarkMode ? 'bg-zinc-800 border-zinc-950' : 'bg-mercury border-porcelain'}`} />
      
      {/* Keys Grid */}
      <div className="relative flex-1 grid gap-0.5" style={{ gridTemplateRows: `repeat(${rows}, 1fr)` }}>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-0.5">
            {Array.from({ length: cols }).map((_, colIndex) => {
              // Randomize key widths slightly for realism (spacebar, shift, etc)
              let flexGrow = 1;
              if (rowIndex === 4 && colIndex === Math.floor(cols/2)) flexGrow = 5; // Spacebar
              if (colIndex === 0 || colIndex === cols - 1) flexGrow = 1.5; // Modifiers
              
              return (
                <div 
                  key={colIndex} 
                    className={`rounded-[2px] border-b shadow-sm ${
                      isDarkMode 
                        ? 'bg-zinc-700 border-zinc-900' 
                        : 'bg-porcelain border-mercury'
                    }`}
                  style={{ flex: flexGrow }}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Logo/Branding area */}
      <div className={`absolute top-1 right-2 w-4 h-1 rounded-full ${isDarkMode ? 'bg-trinidad/30' : 'bg-trinidad/20'}`} />
    </div>
  );
};

const RealisticMouse = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-1">
      {/* Mouse Body */}
      <div className={`w-full h-full rounded-[40%_40%_45%_45%] border-b-4 shadow-inner relative overflow-hidden ${
        isDarkMode ? 'bg-zinc-800 border-zinc-950' : 'bg-mercury border-porcelain'
      }`}>
        {/* Buttons Split */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-px h-1/2 ${isDarkMode ? 'bg-zinc-900' : 'bg-porcelain'}`} />
        
        {/* Scroll Wheel */}
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-4 rounded-full shadow-inner ${
          isDarkMode ? 'bg-zinc-950' : 'bg-zinc-500'
        }`}>
          <div className="w-full h-1/2 bg-trinidad/40 rounded-full" />
        </div>
        
        {/* Side Grips */}
        <div className={`absolute top-1/3 left-0 w-1 h-1/3 rounded-r-full ${isDarkMode ? 'bg-zinc-900/50' : 'bg-zinc-400/50'}`} />
        <div className={`absolute top-1/3 right-0 w-1 h-1/3 rounded-l-full ${isDarkMode ? 'bg-zinc-900/50' : 'bg-zinc-400/50'}`} />
      </div>
    </div>
  );
};

// --- Sub-components ---

const Newsletter = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS Configuration Missing:', { serviceId, templateId, publicKey });
      alert('Subscription is currently unavailable (Configuration Error).');
      setIsSubmitting(false);
      return;
    }

    try {
      await emailjs.send(serviceId, templateId, { 
        email: email, 
        name: email.split('@')[0] // Fallback name from email
      }, publicKey);

      setIsSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error('EmailJS error:', error);
      alert('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`p-8 rounded-[2.5rem] border overflow-hidden relative group transition-all duration-500 ${
      isDarkMode 
        ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
        : 'bg-white border-zinc-200 shadow-xl shadow-zinc-200/50 hover:shadow-zinc-300/50'
    }`}>
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-teal-blue/10 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-blue/20 transition-all duration-700" />
      
      <div className="relative z-10 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-trinidad">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Mail size={20} />
            </motion.div>
            <span className="text-xs font-black uppercase tracking-[0.2em]">Community</span>
          </div>
          <h3 className="text-3xl font-black tracking-tight">Stay Scaled.</h3>
          <p className={`text-sm leading-relaxed max-w-sm ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Join 2,000+ enthusiasts getting early access to new desk peripherals and 3D features.
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="relative">
          <AnimatePresence mode="wait">
            {!isSubscribed ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <input 
                    type="email" 
                    required
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-6 py-4 rounded-2xl border text-sm focus:outline-none focus:ring-4 focus:ring-teal-blue/10 transition-all ${
                      isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-porcelain border-transparent'
                    }`}
                  />
                </div>
                <Haptic type="success">
                  <motion.button 
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isSubmitting}
                    className="px-10 py-4 bg-trinidad hover:bg-trinidad/90 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all shadow-2xl shadow-trinidad/30 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        JOIN <Send size={16} />
                      </>
                    )}
                  </motion.button>
                </Haptic>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`flex items-center gap-4 p-6 rounded-2xl border ${
                  isDarkMode ? 'bg-teal-blue/20 border-teal-blue/30 text-teal-blue' : 'bg-teal-blue/5 border-teal-blue/10 text-teal-blue'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-teal-blue text-white flex items-center justify-center shadow-lg shadow-teal-blue/20">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-base font-black uppercase tracking-wider">Welcome Aboard!</p>
                  <p className="text-xs font-medium opacity-80">You're on the list. Big things coming soon.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </section>
  );
};

const SocialFollow = ({ isDarkMode, onPageChange }: { isDarkMode: boolean, onPageChange: (page: Page) => void }) => {
  return (
    <section className={`p-8 rounded-[2.5rem] border flex flex-col justify-between overflow-hidden relative group transition-all duration-500 ${
      isDarkMode 
        ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
        : 'bg-white border-zinc-200 shadow-xl shadow-zinc-200/50 hover:shadow-zinc-300/50'
    }`}>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-trinidad/10 rounded-full blur-3xl pointer-events-none group-hover:bg-trinidad/20 transition-all duration-700" />
      
      <div className="relative z-10 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-teal-blue">
            <Github size={20} />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Connect</span>
          </div>
          <h3 className="text-3xl font-black tracking-tight">Follow the Build.</h3>
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Behind-the-scenes content, development updates, and setup inspirations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {[
            { icon: Twitter, label: 'Twitter', color: 'bg-[#1DA1F2]', handle: '@XMihirPatel', href: 'https://x.com/XMihirPatel' },
            { icon: Github, label: 'GitHub', color: 'bg-[#24292e]', handle: 'MihirPatel014', href: 'https://github.com/MihirPatel014' },
            { icon: Instagram, label: 'Instagram', color: 'bg-[#E1306C]', handle: '@mihir_2974', href: 'https://www.instagram.com/mihir_2974?igsh=eHIxejVjaGljeWhi' },
            { icon: Linkedin, label: 'LinkedIn', color: 'bg-[#0077B5]', handle: 'Mihir Patel', href: 'https://www.linkedin.com/in/mihir-patel-49053220a/' },
          ].map((social) => (
            <Haptic key={social.label}>
              <motion.a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border group transition-all ${
                  isDarkMode ? 'bg-zinc-950 border-zinc-800 hover:border-zinc-700' : 'bg-porcelain border-transparent hover:border-zinc-200'
                }`}
              >
                <div className={`p-2.5 rounded-xl text-white ${social.color} shadow-lg shadow-black/10 transition-transform group-hover:rotate-6`}>
                  <social.icon size={20} />
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider block">{social.label}</span>
                  <span className="text-[8px] text-zinc-500 font-bold block">{social.handle}</span>
                </div>
              </motion.a>
            </Haptic>
          ))}
        </div>
      </div>

      <div className="pt-8 flex items-center justify-between border-t border-zinc-800/10 dark:border-zinc-800/50">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">© 2026 MatScale Lab</p>
        <div className="flex gap-4">
          <Haptic>
            <button onClick={() => onPageChange('about')} className="text-[10px] font-black text-zinc-500 hover:text-trinidad transition-colors uppercase">About</button>
          </Haptic>
          <Haptic>
            <button onClick={() => onPageChange('privacy')} className="text-[10px] font-black text-zinc-500 hover:text-trinidad transition-colors uppercase">Privacy</button>
          </Haptic>
          <Haptic>
            <button onClick={() => onPageChange('terms')} className="text-[10px] font-black text-zinc-500 hover:text-trinidad transition-colors uppercase">Terms</button>
          </Haptic>
        </div>
      </div>
    </section>
  );
};

// --- Components ---

export default function App() {
  const { trigger } = useHaptics();
  // State
  const [currentPage, setCurrentPage] = useState<Page>('visualizer');
  const [unit, setUnit] = useState<Unit>('mm');
  const [matWidth, setMatWidth] = useState(900);
  const [matHeight, setMatHeight] = useState(400);
  const [zoom, setZoom] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [keyboardLayout, setKeyboardLayout] = useState<keyof typeof KEYBOARD_LAYOUTS>('75%');
  const [showQR, setShowQR] = useState(false);
  const [isShared, setIsShared] = useState(false);
  
  const [equipment, setEquipment] = useState<Equipment[]>([
    { id: 'kb', name: 'Keyboard', ...KEYBOARD_LAYOUTS['75%'], x: 50, y: 100, type: 'keyboard' },
    { id: 'mouse', name: 'Mouse', ...MOUSE_SIZE, x: 400, y: 120, type: 'mouse' },
  ]);

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Auto-show QR code on start for mobile access
  useEffect(() => {
    const hasShownQR = sessionStorage.getItem('hasShownQR');
    if (!hasShownQR) {
      setShowQR(true);
      sessionStorage.setItem('hasShownQR', 'true');
    }
  }, []);

  // Derived values
  const PIXELS_PER_INCH = 20 * zoom;
  
  const matWidthInches = useMemo(() => toInches(matWidth, unit), [matWidth, unit]);
  const matHeightInches = useMemo(() => toInches(matHeight, unit), [matHeight, unit]);
  
  const matWidthPx = matWidthInches * PIXELS_PER_INCH;
  const matHeightPx = matHeightInches * PIXELS_PER_INCH;

  // Fit Detection
  const doesFit = useMemo(() => {
    // Basic logic: check if any equipment is outside mat boundaries
    return equipment.every(item => {
      const itemWidthPx = item.width * PIXELS_PER_INCH;
      const itemHeightPx = item.height * PIXELS_PER_INCH;
      return (
        item.x >= 0 &&
        item.y >= 0 &&
        item.x + itemWidthPx <= matWidthPx &&
        item.y + itemHeightPx <= matHeightPx
      );
    });
  }, [equipment, matWidthPx, matHeightPx, PIXELS_PER_INCH]);

  // Handlers
  const handleUnitChange = (newUnit: Unit) => {
    const inches = toInches(matWidth, unit);
    const newWidth = fromInches(inches, newUnit);
    const newHeight = fromInches(toInches(matHeight, unit), newUnit);
    setUnit(newUnit);
    setMatWidth(formatValue(newWidth));
    setMatHeight(formatValue(newHeight));
  };

  const updateKeyboard = (layout: keyof typeof KEYBOARD_LAYOUTS) => {
    setKeyboardLayout(layout);
    setEquipment(prev => prev.map(item => 
      item.type === 'keyboard' ? { ...item, ...KEYBOARD_LAYOUTS[layout] } : item
    ));
  };

  const centerLayout = () => {
    const kb = equipment.find(e => e.type === 'keyboard')!;
    const mouse = equipment.find(e => e.type === 'mouse')!;
    
    const kbWidthPx = kb.width * PIXELS_PER_INCH;
    const mouseWidthPx = mouse.width * PIXELS_PER_INCH;
    const totalWidthPx = kbWidthPx + mouseWidthPx + (1 * PIXELS_PER_INCH); // 1 inch gap
    
    const startX = (matWidthPx - totalWidthPx) / 2;
    const centerY = (matHeightPx - (kb.height * PIXELS_PER_INCH)) / 2;

    setEquipment(prev => prev.map(item => {
      if (item.type === 'keyboard') return { ...item, x: startX, y: centerY };
      if (item.type === 'mouse') return { ...item, x: startX + kbWidthPx + (1 * PIXELS_PER_INCH), y: (matHeightPx - (mouse.height * PIXELS_PER_INCH)) / 2 };
      return item;
    }));
  };

  // Dragging logic
  const onMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const item = equipment.find(eq => eq.id === id);
    if (!item) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setDraggingId(id);
    trigger('nudge');
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!draggingId || !canvasRef.current) return;

      const canvasRect = canvasRef.current.getBoundingClientRect();
      let newX = e.clientX - canvasRect.left - dragOffset.current.x;
      let newY = e.clientY - canvasRect.top - dragOffset.current.y;

      setEquipment(prev => prev.map(item => 
        item.id === draggingId ? { ...item, x: newX, y: newY } : item
      ));
    };

    const onMouseUp = () => setDraggingId(null);

    if (draggingId) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [draggingId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-porcelain text-woodsmoke'}`}>
      <AnimatePresence mode="wait">
        {currentPage === 'visualizer' ? (
          <motion.div
            key="visualizer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
      <header className={`border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md ${isDarkMode ? 'border-zinc-800 bg-zinc-950/80' : 'border-mercury bg-porcelain/80'}`}>
        <BrandLogo isDarkMode={isDarkMode} />
        
        <div className="flex items-center gap-4">
          <Haptic>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'}`}
              aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
          </Haptic>

          <Haptic>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className={`p-2 rounded-full transition-colors flex items-center gap-2 ${
                isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'
              }`}
              title="Copy Share Link"
            >
              {isShared ? <Check size={20} className="text-teal-blue" /> : <Share2 size={20} />}
            </motion.button>
          </Haptic>

          <Haptic>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowQR(true)}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-200'}`}
              title="Scan for Mobile View"
            >
              <Maximize size={20} className="rotate-45" />
            </motion.button>
          </Haptic>
        </div>
      </header>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowQR(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-sm rounded-3xl p-8 shadow-2xl border ${
                isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <div className="text-center space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                  isDarkMode ? 'bg-teal-blue/20 text-teal-blue' : 'bg-teal-blue/10 text-teal-blue'
                }`}>
                  <Maximize size={32} className="rotate-45" />
                </div>
                <h2 className="text-2xl font-bold">Mobile View</h2>
                <p className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  Scan this code with your phone's camera to view the size guide in real-time.
                </p>
                
                <div className={`mt-2 p-2 rounded-lg inline-block border ${
                  isDarkMode ? 'bg-white border-zinc-800' : 'bg-white border-zinc-100'
                }`}>
                  <QRCodeSVG 
                    value={window.location.href}
                    size={80}
                    level="L"
                    includeMargin={false}
                  />
                </div>
                
                <div className="pt-6">
                  <p className="text-[10px] font-mono text-zinc-500 mb-4 break-all">
                    {window.location.href}
                  </p>
                  <Haptic>
                    <button 
                      onClick={() => setShowQR(false)}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-semibold transition-all"
                    >
                      Close
                    </button>
                  </Haptic>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1600px] mx-auto">
        {/* Controls Panel */}
        <aside className="lg:col-span-3 space-y-6">
          <section className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-mercury border-white shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-4 text-teal-blue">
              <Settings size={18} />
              <h2 className="font-semibold">Dimensions</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Unit System</label>
                <div className="flex p-1 bg-porcelain dark:bg-zinc-800 rounded-lg">
                  {(['mm', 'cm', 'inch'] as Unit[]).map((u) => (
                    <Haptic key={u}>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleUnitChange(u)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                          unit === u 
                            ? 'bg-mercury dark:bg-zinc-700 shadow-sm text-teal-blue dark:text-trinidad' 
                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                      >
                        {u.toUpperCase()}
                      </motion.button>
                    </Haptic>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Width ({unit})</label>
                  <input 
                    type="number" 
                    value={matWidth}
                    onChange={(e) => setMatWidth(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-blue/20 transition-all ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-porcelain border-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Height ({unit})</label>
                  <input 
                    type="number" 
                    value={matHeight}
                    onChange={(e) => setMatHeight(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-blue/20 transition-all ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-porcelain border-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-500 mb-2 block">Presets</label>
                <div className="grid grid-cols-1 gap-2">
                  {PRESETS.map((p) => (
                    <Haptic key={p.name}>
                      <motion.button
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setUnit(p.unit);
                          setMatWidth(p.width);
                          setMatHeight(p.height);
                        }}
                        className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                          isDarkMode 
                            ? 'bg-zinc-800 border-zinc-700 hover:border-trinidad/50' 
                            : 'bg-porcelain border-white hover:border-trinidad/50'
                        }`}
                      >
                        {p.name}
                      </motion.button>
                    </Haptic>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-mercury border-white shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-4 text-teal-blue">
              <KeyboardIcon size={18} />
              <h2 className="font-semibold">Equipment</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-500 mb-1.5 block">Keyboard Layout</label>
                <select 
                  value={keyboardLayout}
                  onChange={(e) => updateKeyboard(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-teal-blue/20 transition-all ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-porcelain border-white'
                  }`}
                >
                  {Object.keys(KEYBOARD_LAYOUTS).map(layout => (
                    <option key={layout} value={layout}>{layout} Layout</option>
                  ))}
                </select>
              </div>

              <Haptic>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={centerLayout}
                  className="w-full py-2.5 bg-teal-blue hover:bg-teal-blue/90 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-blue/20"
                >
                  <RotateCcw size={16} />
                  Center Layout
                </motion.button>
              </Haptic>
            </div>
          </section>

          <section className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-mercury border-white shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-4 text-teal-blue">
              <Minimize size={18} />
              <h2 className="font-semibold">View Options</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-medium text-zinc-500">Zoom Level</label>
                  <span className="text-xs font-bold text-trinidad">{zoom.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="2" 
                  step="0.1" 
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-trinidad"
                />
                <div className="flex justify-between mt-1 text-[10px] text-zinc-500 font-medium">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>2.0x</span>
                </div>
              </div>
            </div>
          </section>

          <section className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-mercury border-white shadow-sm'}`}>
            <div className="flex items-center gap-2 mb-4 text-teal-blue">
              <div className="bg-teal-blue/10 p-1.5 rounded-lg">
                <Sun size={18} />
              </div>
              <h2 className="font-semibold">Setup Analytics</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white/50 border-white'}`}>
                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Coverage</p>
                <p className="text-sm font-bold text-teal-blue">
                  {Math.round(((equipment.reduce((acc, i) => acc + (i.width * i.height), 0)) / (matWidthInches * matHeightInches)) * 100)}%
                </p>
              </div>
              <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-zinc-950/50 border-zinc-800' : 'bg-white/50 border-white'}`}>
                <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Status</p>
                <p className={`text-sm font-bold ${doesFit ? 'text-teal-blue' : 'text-trinidad'}`}>
                  {doesFit ? 'Optimal' : 'Conflict'}
                </p>
              </div>
            </div>
          </section>
        </aside>

        {/* Canvas Area */}
        <div className="lg:col-span-9 space-y-4">
          {/* Status Bar */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
            doesFit 
              ? (isDarkMode ? 'bg-teal-blue/10 border-teal-blue/20 text-teal-blue' : 'bg-teal-blue/5 border-teal-blue/10 text-teal-blue')
              : (isDarkMode ? 'bg-trinidad/10 border-trinidad/20 text-trinidad' : 'bg-trinidad/5 border-trinidad/10 text-trinidad')
          }`}>
            <div className="flex items-center gap-3">
              {doesFit ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
              <div>
                <p className="text-sm font-bold">
                  {doesFit ? 'Perfect Fit!' : 'Setup Overflow Detected'}
                </p>
                <p className="text-xs opacity-80">
                  {doesFit 
                    ? 'Your equipment fits comfortably on this mat size.' 
                    : 'Your setup won’t fit on this desk mat. Try a larger size.'}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-white/10 dark:bg-black/20 px-3 py-1 rounded-full">
              <Info size={14} />
              <span>{matWidth}{unit} × {matHeight}{unit}</span>
            </div>
          </div>

          {/* The Visualizer */}
          <div className={`relative rounded-3xl border overflow-hidden min-h-[600px] flex items-center justify-center transition-all ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-mercury border-white shadow-sm'
          }`}
          style={{
            backgroundImage: `radial-gradient(${isDarkMode ? '#27272a' : '#ECEEEF'} 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}>
            
            {/* Mat Container */}
            <div className="relative">
              {/* Rulers */}
              <div className="absolute -top-8 left-0 right-0 flex justify-between text-[10px] font-mono text-zinc-500 px-1">
                <span>0</span>
                <div className="h-2 w-px bg-zinc-500/30 absolute left-0 top-full"></div>
                <span className="absolute left-1/2 -translate-x-1/2">{matWidth} {unit}</span>
                <div className="h-2 w-px bg-zinc-500/30 absolute left-1/2 top-full -translate-x-1/2"></div>
                <span>{matWidth}</span>
                <div className="h-2 w-px bg-zinc-500/30 absolute right-0 top-full"></div>
              </div>

              <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-between text-[10px] font-mono text-zinc-500 py-1">
                <span>0</span>
                <div className="w-2 h-px bg-zinc-500/30 absolute top-0 left-full"></div>
                <span className="absolute top-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap">{matHeight} {unit}</span>
                <div className="w-2 h-px bg-zinc-500/30 absolute top-1/2 left-full -translate-y-1/2"></div>
                <span>{matHeight}</span>
                <div className="w-2 h-px bg-zinc-500/30 absolute bottom-0 left-full"></div>
              </div>

              {/* The Mat */}
              <motion.div 
                ref={canvasRef}
                layout
                className={`relative shadow-2xl transition-all duration-500 ${
                  doesFit 
                    ? 'border-zinc-700/50' 
                    : 'border-trinidad ring-4 ring-trinidad/20'
                }`}
                style={{
                  width: matWidthPx,
                  height: matHeightPx,
                  backgroundColor: isDarkMode ? '#09090b' : '#181A1B',
                  borderRadius: '12px',
                  borderWidth: '2px'
                }}
              >
                {/* Equipment Overlays */}
                {equipment.map((item) => (
                  <motion.div
                    key={item.id}
                    onMouseDown={(e) => onMouseDown(e, item.id)}
                    className={`absolute cursor-move rounded-lg flex flex-col items-center justify-center select-none transition-shadow ${
                      draggingId === item.id ? 'z-50 shadow-2xl scale-105' : 'z-10 shadow-lg'
                    }`}
                    style={{
                      width: item.width * PIXELS_PER_INCH,
                      height: item.height * PIXELS_PER_INCH,
                      left: item.x,
                      top: item.y,
                    }}
                  >
                    {item.type === 'keyboard' ? (
                      <RealisticKeyboard layout={keyboardLayout} isDarkMode={isDarkMode} />
                    ) : (
                      <RealisticMouse isDarkMode={isDarkMode} />
                    )}
                    
                    {/* Floating Info Label */}
                    <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter shadow-sm pointer-events-none ${
                      isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-woodsmoke/60'
                    }`}>
                      {item.name} ({item.width}"×{item.height}")
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Interactive Footer & Community */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Newsletter isDarkMode={isDarkMode} />
            <SocialFollow isDarkMode={isDarkMode} onPageChange={setCurrentPage} />
          </div>
        </div>
      </main>
      </motion.div>
    ) : (
      <div key="legal">
        {currentPage === 'about' && <AboutPage isDarkMode={isDarkMode} onBack={() => setCurrentPage('visualizer')} />}
        {currentPage === 'privacy' && <PrivacyPage isDarkMode={isDarkMode} onBack={() => setCurrentPage('visualizer')} />}
        {currentPage === 'terms' && <TermsPage isDarkMode={isDarkMode} onBack={() => setCurrentPage('visualizer')} />}
      </div>
    )}
  </AnimatePresence>
</div>
  );
}
