import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Receipt, Users, Zap, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface LandingProps {
  onSignIn?: () => void;
}

export function Landing({ onSignIn }: LandingProps) {
  const navigate = useNavigate();

  const handleSignInClick = () => {
    if (onSignIn) {
      onSignIn();
    } else {
      navigate('/dashboard');
    }
  };

  const handleAction = () => {
    const raw = localStorage.getItem('splitx_user') || localStorage.getItem('userEmail');
    if (raw) {
      navigate('/dashboard');
    } else if (onSignIn) {
      onSignIn();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-coral-500/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none z-0"></div>

      <header className="px-6 py-6 flex items-center justify-between relative z-10 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
            <Zap className="text-slate-950 h-5 w-5 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-100">SplitX</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <Button
            variant="ghost"
            className="hidden sm:inline-flex"
            onClick={handleSignInClick}
          >
            Sign In
          </Button>

          <Button onClick={handleAction}>Get Started</Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            100% Free Forever, Zero hidden fees
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-100 mb-6 leading-[1.1]">
            Split bills with friends, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">without the math.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The intelligent settlement engine that calculates the absolute minimum number of payments required to clear all group debts.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleAction} className="w-full sm:w-auto group">
              Start Splitting Now
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="secondary" onClick={handleSignInClick} className="w-full sm:w-auto">
              Sign In to Account
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto w-full text-left"
        >
          {[
            { icon: Users, title: 'Group Expense Tracking', desc: 'Add friends, log expenses, and see who owes who at a glance in real-time.' },
            { icon: Zap, title: 'Smart Settlement', desc: 'Our algorithm minimizes back-and-forth transfers. Settle 10 debts with just 3 payments.' },
            { icon: ShieldCheck, title: 'Zero Sign-up Barrier', desc: 'Jump right in. No mandatory accounts required to start splitting with your group.' },
          ].map((feature, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-white/40 dark:border-slate-800/60 backdrop-blur-2xl shadow-xl transition-all hover:bg-white/50 dark:hover:bg-slate-900/50">
              <div className="h-12 w-12 rounded-2xl bg-white/50 dark:bg-slate-800 flex items-center justify-center mb-4 backdrop-blur-md shadow-inner">
                <feature.icon className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}