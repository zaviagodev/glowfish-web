import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlowingEdgesProps {
  className?: string;
}

export function GlowingEdges({ className }: GlowingEdgesProps) {
  return (
    <div className={cn("fixed inset-0 pointer-events-none z-[100]", className)}>
      {/* Static gradient background */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'radial-gradient(circle at center, rgba(124,255,128,0.8) 0%, transparent 60%)'
        }}
      />

      {/* Static edges */}
      <div className="absolute inset-0">
        {/* Top edge */}
        <div 
          className="absolute top-0 left-[24px] right-[24px] h-[24px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            filter: 'blur(24px)'
          }}
        />

        {/* Right edge */}
        <div 
          className="absolute top-[24px] right-0 bottom-[24px] w-[24px]"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)',
            filter: 'blur(24px)'
          }}
        />

        {/* Bottom edge */}
        <div 
          className="absolute bottom-0 left-[24px] right-[24px] h-[24px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            filter: 'blur(24px)'
          }}
        />

        {/* Left edge */}
        <div 
          className="absolute top-[24px] left-0 bottom-[24px] w-[24px]"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.2), transparent)',
            filter: 'blur(24px)'
          }}
        />

        {/* Corner glows */}
        {[
          'top-0 left-0',
          'top-0 right-0',
          'bottom-0 right-0',
          'bottom-0 left-0'
        ].map((position) => (
          <div
            key={position}
            className={`absolute ${position} w-[24px] h-[24px]`}
            style={{
              background: 'radial-gradient(circle at 100% 100%, transparent 0%, transparent 70%, rgba(255,255,255,0.2) 100%)',
              filter: 'blur(24px)'
            }}
          />
        ))}
      </div>
    </div>
  );
}