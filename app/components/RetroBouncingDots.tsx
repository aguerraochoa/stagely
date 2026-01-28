'use client'

export function RetroBouncingDots({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dotSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  return (
    <div className="flex items-center justify-center gap-2" aria-label="Loading" role="status">
      <div
        className={`${dotSize} bg-retro-orange border-2 border-retro-dark rounded-full animate-bounce shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]`}
        style={{ animationDelay: '0s' }}
      />
      <div
        className={`${dotSize} bg-retro-teal border-2 border-retro-dark rounded-full animate-bounce shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]`}
        style={{ animationDelay: '0.2s' }}
      />
      <div
        className={`${dotSize} bg-retro-orange border-2 border-retro-dark rounded-full animate-bounce shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]`}
        style={{ animationDelay: '0.4s' }}
      />
    </div>
  )
}

