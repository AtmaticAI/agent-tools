'use client';

import { useRef, ReactNode } from 'react';
import { useFullscreen } from '@/lib/hooks/use-fullscreen';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullscreenWrapperProps {
  children: ReactNode;
  className?: string;
}

export function FullscreenWrapper({ children, className }: FullscreenWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative',
        isFullscreen && 'bg-background p-6 overflow-auto',
        className
      )}
    >
      <Button
        variant="outline"
        size="icon"
        className={cn(
          'absolute z-10 h-8 w-8',
          isFullscreen ? 'top-2 right-2' : 'top-2 right-2'
        )}
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen'}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
      {children}
    </div>
  );
}
