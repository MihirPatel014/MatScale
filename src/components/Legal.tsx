import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, FileText, Users, Globe, Mail, Heart } from 'lucide-react';
import { Haptic } from './HapticAction';

interface PageLayoutProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onBack: () => void;
  isDarkMode: boolean;
}

const PageLayout: React.FC<PageLayoutProps> = ({ title, icon, children, onBack, isDarkMode }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="max-w-4xl mx-auto py-12 px-6"
  >
    <Haptic>
      <button 
        onClick={onBack}
        className={`flex items-center gap-2 mb-8 px-4 py-2 rounded-xl transition-all font-bold text-sm ${
          isDarkMode ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400' : 'bg-white hover:bg-zinc-100 text-zinc-500 shadow-sm'
        }`}
      >
        <ArrowLeft size={16} /> Back to Visualizer
      </button>
    </Haptic>

    <div className="flex items-center gap-4 mb-12">
      <div className="p-4 bg-teal-blue rounded-2xl text-white shadow-xl shadow-teal-blue/20">
        {icon}
      </div>
      <h1 className={`text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>{title}</h1>
    </div>

    <div className={`max-w-none ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>
      {children}
    </div>
  </motion.div>
);

export const AboutPage = ({ onBack, isDarkMode }: { onBack: () => void, isDarkMode: boolean }) => (
  <PageLayout title="About Us" icon={<Users size={32} />} onBack={onBack} isDarkMode={isDarkMode}>
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>The MatScale Mission</h2>
        <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
          MatScale was born out of a simple frustration: buying a desk mat only to find out it's too small for your 
          keyboard and mouse combo. We built the world's first high-fidelity desk mat visualizer to help you 
          visualize your setup with mathematical precision before you hit "Buy."
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-porcelain border-zinc-100'}`}>
          <Globe className="text-trinidad mb-4" />
          <h3 className="font-bold mb-2">Global Scale</h3>
          <p className="text-xs opacity-70">Supporting mm, cm, and inches to cater to the global mechanical keyboard community.</p>
        </div>
        <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-porcelain border-zinc-100'}`}>
          <Heart className="text-teal-blue mb-4" />
          <h3 className="font-bold mb-2">Community First</h3>
          <p className="text-xs opacity-70">Built by enthusiasts, for enthusiasts. No ads, no tracking, just tools.</p>
        </div>
      </div>

      <section className="space-y-4 pt-8 border-t border-zinc-800/10 dark:border-zinc-800/50">
        <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>The Team</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          We are a distributed team of designers and developers who spend way too much time looking at custom keycaps 
          and artisan cables. MatScale is our contribution to the aesthetic workspace movement.
        </p>
      </section>
    </div>
  </PageLayout>
);

export const PrivacyPage = ({ onBack, isDarkMode }: { onBack: () => void, isDarkMode: boolean }) => (
  <PageLayout title="Privacy Policy" icon={<Shield size={32} />} onBack={onBack} isDarkMode={isDarkMode}>
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>1. Data Collection</h2>
        <p className="text-sm opacity-70">
          We respect your privacy. MatScale is a client-side application. We do not store your setup coordinates, 
          mat dimensions, or browser data on our servers.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>2. Newsletter</h2>
        <p className="text-sm opacity-70">
          If you choose to join our newsletter, we only store your email address for the sole purpose of sending 
          you project updates. You can unsubscribe at any time.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>3. Cookies</h2>
        <p className="text-sm opacity-70">
          We use session storage to improve your experience (e.g., remembering if you've seen the QR code). 
          These are strictly functional and contain no tracking information.
        </p>
      </section>
    </div>
  </PageLayout>
);

export const TermsPage = ({ onBack, isDarkMode }: { onBack: () => void, isDarkMode: boolean }) => (
  <PageLayout title="Terms of Service" icon={<FileText size={32} />} onBack={onBack} isDarkMode={isDarkMode}>
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>1. Usage</h2>
        <p className="text-sm opacity-70">
          MatScale is provided for personal, non-commercial use. You may use it to plan your setups and share 
          visualizations with others.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>2. Accuracy</h2>
        <p className="text-sm opacity-70">
          While we strive for 1:1 scale accuracy, browser rendering and display densities vary. Always verify 
          measurements with the physical manufacturer's specifications before making a purchase.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>3. Intellectual Property</h2>
        <p className="text-sm opacity-70">
          The code and design patterns used in MatScale are the property of the developers. Peripherals 
          shown are generic representations of common layouts.
        </p>
      </section>
    </div>
  </PageLayout>
);
