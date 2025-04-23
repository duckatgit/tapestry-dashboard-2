'use client';

import React from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { Search, FileText, Users } from "lucide-react";
import ServiceTile from "../components/ServiceTile"; // Adjusted path relative to app/
import { toast } from "@/hooks/use-toast"; // Corrected path for use-toast hook

const LandingPage = () => {
  const router = useRouter(); // Initialize router

  const handleCtaAction = (path: string) => {
    console.log(`Navigating to: /${path}`);
    toast({
      title: `${path} service selected`, // Keep toast for feedback
      description: `Redirecting to /${path}...`,
      duration: 2000,
    });
    // Use router to navigate
    router.push(`/${path}`); 
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden"> 
      {/* Background Twist Image */} 
      <img 
        src="/twist.png"
        alt=""
        className="absolute top-1 left-0 w-full h-auto opacity-10 z-0 pointer-events-none" 
        aria-hidden="true" 
      />
      
      {/* Header Section */} 
      <header className="container mx-auto py-12 px-4 md:px-6 relative z-10"> 
        <div className="flex flex-col items-center text-center">
          {/* Logo using standard img tag */} 
          <img 
            src="/TL.png" 
            alt="TwistedLoop Logo"
            className="h-24 mb-6" 
          />
          
          {/* Title with text shadow */} 
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
            style={{ textShadow: '0 0 150px rgba(249, 115, 22, 1)' }} 
          >
            PE Deal Origination Platform
          </h1>
          
          {/* Description */} 
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Your integrated solution for sourcing, analyzing, and researching investment opportunities.
          </p>
        </div>
      </header>
            
      {/* Service Tiles Section */} 
      <section className="container mx-auto py-12 px-4 md:px-6 relative z-10"> 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tile 1: Company Research */} 
          {/* Tile 2: IM Analysis */} 
          <ServiceTile 
            title="IM Analysis" 
            description="Analyse Information Memorandums with the IMQualifier tool."
            icon={FileText}
            detailedInfo="Upload Information Memorandums to our AI-powered analyser. Get instant insights into financial performance, market positioning, and potential red flags."
            ctaText="Go to IMQ Tool"
            ctaAction={() => handleCtaAction("imq")} 
          />
          
          {/* Tile 3: C-Suite Analysis */} 
          <ServiceTile 
            title="C-Suite Analysis" 
            description="Conduct in-depth analysis of company leadership and management."
            icon={Users}
            detailedInfo="Evaluate the strength of the management team, CEO track record, and leadership capabilities. Get AI-powered insights on executive performance and potential."
            ctaText="Analyse Leadership"
            ctaAction={() => handleCtaAction("csuite-analysis")} 
          />
            <ServiceTile 
            title="Company Research" 
            description="Identify potential investment targets based on your criteria."
            icon={Search}
            detailedInfo="Our advanced search algorithm uses AI to identify companies matching your investment thesis. Filter by industry, size, growth rate, and many more parameters."
            ctaText="Start Research"
            ctaAction={() => handleCtaAction("research")} 
          />
        </div>
      </section>

      {/* Footer */} 
      <footer className="container mx-auto py-8 px-4 md:px-6 text-center relative z-10"> 
        <p className="text-sm text-muted-foreground">
          2025 Twisted Loop. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
