import { motion, useMotionValue, useTransform, useReducedMotion, animate } from "framer-motion";
import React, { useState } from "react";
import { ImageIcon } from "lucide-react";

interface SwipeCardProps {
  imageSrc: string;
  filename: string;
  filesize: string;
  nextImageSrc?: string;
  peekImageSrc?: string;
  onSwipeComplete: (direction: 'left' | 'right' | 'up') => void;
}

export function SwipeCard({
  imageSrc,
  filename,
  filesize,
  nextImageSrc,
  peekImageSrc,
  onSwipeComplete,
}: SwipeCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);

  // Motion Values for Drag Gestures
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Subtle proportional rotation (max ~8deg)
  const rotate = useTransform(x, [-300, 0, 300], [-8, 0, 8]);

  // Smooth scaling corner tag opacities based on drag distance
  const deleteOpacity = useTransform(x, [-120, -30, 0], [1, 0.4, 0]);
  const keepOpacity = useTransform(x, [0, 30, 120], [0, 0.4, 1]);
  const maybeOpacity = useTransform(y, [0, -30, -100], [0, 0.4, 1]);

  // Drag End / Release Handler
  const handleDragEnd = (_: any, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
    const thresholdX = 100;
    const thresholdY = -80;

    if (info.offset.y < thresholdY) {
      // Swipe Up -> MAYBE
      setExitDirection('up');
      setIsExiting(true);
      if (prefersReducedMotion) {
        onSwipeComplete('up');
      } else {
        animate(y, -600, { duration: 0.25, ease: 'easeOut' }).then(() => onSwipeComplete('up'));
      }
    } else if (info.offset.x > thresholdX) {
      // Swipe Right -> KEEP
      setExitDirection('right');
      setIsExiting(true);
      if (prefersReducedMotion) {
        onSwipeComplete('right');
      } else {
        animate(x, 600, { duration: 0.25, ease: 'easeOut' }).then(() => onSwipeComplete('right'));
      }
    } else if (info.offset.x < -thresholdX) {
      // Swipe Left -> DELETE
      setExitDirection('left');
      setIsExiting(true);
      if (prefersReducedMotion) {
        onSwipeComplete('left');
      } else {
        animate(x, -600, { duration: 0.25, ease: 'easeOut' }).then(() => onSwipeComplete('left'));
      }
    } else {
      // Under threshold: spring back to center
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 });
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 25 });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between select-none">
      
      {/* Photo Deck Stack Container */}
      <div className="relative w-full h-[320px] sm:h-[380px] flex items-center justify-center">
        
        {/* Peek Card #2 (Scale ~0.92, Offset y: 16px) */}
        {peekImageSrc && (
          <div 
            className="absolute w-full h-full rounded-xl border border-border bg-surface overflow-hidden opacity-40 shadow-none pointer-events-none"
            style={{ transform: 'translateY(16px) scale(0.92)', zIndex: 1 }}
          >
            {peekImageSrc ? (
              <img src={peekImageSrc} alt="" className="w-full h-full object-contain bg-bg" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-bg">
                <ImageIcon className="h-8 w-8 text-text-secondary/20" />
              </div>
            )}
          </div>
        )}

        {/* Peek Card #1 (Scale ~0.96, Offset y: 8px) */}
        {nextImageSrc && (
          <div 
            className="absolute w-full h-full rounded-xl border border-border bg-surface overflow-hidden opacity-75 shadow-none pointer-events-none"
            style={{ transform: 'translateY(8px) scale(0.96)', zIndex: 2 }}
          >
            {nextImageSrc ? (
              <img src={nextImageSrc} alt="" className="w-full h-full object-contain bg-bg" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-bg">
                <ImageIcon className="h-8 w-8 text-text-secondary/30" />
              </div>
            )}
          </div>
        )}

        {/* Active Draggable Card */}
        <motion.div
          style={{
            x,
            y,
            rotate: prefersReducedMotion ? 0 : rotate,
            zIndex: 10,
          }}
          drag={!isExiting}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.65}
          onDragEnd={handleDragEnd}
          whileTap={{ cursor: "grabbing" }}
          className="absolute w-full h-full rounded-xl border border-border bg-surface overflow-hidden cursor-grab flex flex-col justify-between shadow-none"
        >
          {/* Tag Overlays */}

          {/* DELETE Tag (Top-Left, Coral #F2555A) */}
          <motion.div
            style={{ opacity: deleteOpacity }}
            className="absolute top-4 left-4 z-20 px-3 py-1 rounded border border-danger bg-bg/90 text-danger font-mono text-xs font-bold uppercase tracking-wider select-none pointer-events-none"
          >
            DELETE
          </motion.div>

          {/* KEEP Tag (Top-Right, Green #3DD68C) */}
          <motion.div
            style={{ opacity: keepOpacity }}
            className="absolute top-4 right-4 z-20 px-3 py-1 rounded border border-success bg-bg/90 text-success font-mono text-xs font-bold uppercase tracking-wider select-none pointer-events-none"
          >
            KEEP
          </motion.div>

          {/* MAYBE Tag (Top-Center, Muted Text #8B8B99) */}
          <motion.div
            style={{ opacity: maybeOpacity }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded border border-text-secondary bg-bg/90 text-text-secondary font-mono text-xs font-bold uppercase tracking-wider select-none pointer-events-none"
          >
            MAYBE
          </motion.div>

          {/* Image Display */}
          <div className="w-full h-full bg-bg flex items-center justify-center overflow-hidden">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt={filename}
                className="w-full h-full object-contain pointer-events-none"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-text-secondary/40 font-mono text-xs">
                <ImageIcon className="h-8 w-8 animate-pulse text-text-secondary/30" />
                <span>Loading preview...</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Understated Metadata Below Card (Filename + Size in Mono font, text-secondary) */}
      <div className="w-full pt-3 flex items-center justify-between text-center font-mono text-xs text-text-secondary">
        <span className="truncate max-w-[200px] sm:max-w-[240px]" title={filename}>
          {filename}
        </span>
        <span className="shrink-0 text-[11px] text-text-secondary/80 ml-2">
          {filesize}
        </span>
      </div>

    </div>
  );
}
