import React, { useEffect } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import ProductStrip from '../components/landing/ProductStrip';
import IntroSection from '../components/landing/IntroSection';
import WhatIsSpendWise from '../components/landing/WhatIsSpendWise';
import FeatureShowcase from '../components/landing/FeatureShowcase';
import AnalyticsStory from '../components/landing/AnalyticsStory';
import DashboardPreviewSection from '../components/landing/DashboardPreviewSection';
import HowItWorks from '../components/landing/HowItWorks';
import SecuritySection from '../components/landing/SecuritySection';
import FinalCTA from '../components/landing/FinalCTA';
import LandingFooter from '../components/landing/LandingFooter';

export default function Landing() {
  // Smooth scroll support for hash anchors
  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location;
      if (hash) {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F7FB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-600 dark:selection:text-indigo-300 relative overflow-x-hidden transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-indigo-500/5 dark:from-emerald-500/10 via-cyan-500/5 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[35%] -left-[200px] w-[600px] h-[600px] bg-indigo-500/5 dark:bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[65%] -right-[200px] w-[600px] h-[600px] bg-purple-500/5 dark:bg-emerald-600/5 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <LandingNavbar />

        {/* Hero Section */}
        <main>
          <Hero />

          {/* Product Module Marquee Strip */}
          <ProductStrip />

          {/* High-level Narrative & Cashflow Topology */}
          <section id="product">
            <IntroSection />
          </section>

          {/* What is SpendWise: 8 Architecture Pillars */}
          <WhatIsSpendWise />

          {/* Interactive Feature Deep Dive (8 Switchable Tabs) */}
          <section id="features">
            <FeatureShowcase />
          </section>

          {/* Analytics & Financial Trajectory Breakdown */}
          <AnalyticsStory />

          {/* Live Full-Resolution Dashboard Mockup */}
          <DashboardPreviewSection />

          {/* 3-Step Setup Journey */}
          <section id="how-it-works">
            <HowItWorks />
          </section>

          {/* Security & Multi-Tenant Architecture */}
          <section id="security">
            <SecuritySection />
          </section>

          {/* High-impact Closing CTA */}
          <FinalCTA />
        </main>

        {/* Footer */}
        <LandingFooter />
      </div>
    </div>
  );
}
