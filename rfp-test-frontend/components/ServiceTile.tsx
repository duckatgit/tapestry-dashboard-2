'use client'

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ServiceTileProps {
  title: string;
  description: string;
  icon: LucideIcon;
  detailedInfo: string;
  ctaText: string;
  ctaAction: () => void;
  // New prop for screenshot image
  screenshotUrl?: string;
}

const ServiceTile: React.FC<ServiceTileProps> = ({
  title,
  description,
  icon: Icon,
  detailedInfo,
  ctaText,
  ctaAction,
  screenshotUrl,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className="transition-all duration-300 h-[260px] shadow-md hover:shadow-glow hover:border-orange-500 overflow-hidden bg-gray-800/60 backdrop-blur-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {!isHovered ? (
        // Default content - centered icon and text
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-orange-500/20">
            <Icon className="text-orange-500" />
          </div>
          <h3 className="text-2xl font-semibold leading-none tracking-tight mb-2">{title}</h3>
          <CardDescription className="max-w-[80%]">
            {description}
          </CardDescription>
        </div>
      ) : (
        // Hovered content - Updated background
        <div className="h-full flex flex-col justify-between p-6 bg-gray-800">
          {/* Title Section with Icon */}
          <div className="flex items-center justify-center gap-2 mb-2"> 
            <Icon className="text-orange-500 w-5 h-5" /> 
            <h3 className="text-xl font-semibold">{title}</h3> 
          </div>
          
          {/* Original Middle section restored */}
          {screenshotUrl ? (
            <div className="flex-grow flex items-center justify-center"> 
              <div className="border-2 border-orange-500 rounded-md overflow-hidden p-1 w-full max-w-[85%] bg-orange-500/5">
                <img 
                  src={screenshotUrl} 
                  alt={`${title} screenshot`} 
                  className="w-full h-auto rounded"
                />
              </div>
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center"> 
              <p className="text-sm text-muted-foreground bg-background/50 p-4 rounded-md border border-orange-500/20"> 
                {detailedInfo}
              </p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-3 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-colors min-h-[32px]"
            onClick={(e) => {
              e.stopPropagation();
              ctaAction();
            }}
          >
            {ctaText}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ServiceTile;
