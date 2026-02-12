'use client';

interface LoadingDotsProps {
  color?: 'cyan' | 'amber';
  className?: string;
}

const colorClasses = {
  cyan: 'bg-cyan-400',
  amber: 'bg-amber-400',
};

export function LoadingDots({ color = 'cyan', className }: LoadingDotsProps) {
  const dotClass = colorClasses[color];
  return (
    <div className={`flex space-x-1 ${className ?? ''}`}>
      <div className={`w-2 h-2 rounded-full animate-bounce ${dotClass}`} style={{ animationDelay: '0ms' }} />
      <div className={`w-2 h-2 rounded-full animate-bounce ${dotClass}`} style={{ animationDelay: '150ms' }} />
      <div className={`w-2 h-2 rounded-full animate-bounce ${dotClass}`} style={{ animationDelay: '300ms' }} />
    </div>
  );
}
