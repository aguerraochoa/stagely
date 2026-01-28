'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoadingScreensPage() {
  const [selectedLoader, setSelectedLoader] = useState<number | null>(null)

  const loaders = [
    {
      id: 1,
      name: 'Retro Bouncing Dots',
      component: (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 bg-retro-orange border-2 border-retro-dark rounded-full animate-bounce shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]" style={{ animationDelay: '0s' }}></div>
          <div className="w-4 h-4 bg-retro-teal border-2 border-retro-dark rounded-full animate-bounce shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 bg-retro-orange border-2 border-retro-dark rounded-full animate-bounce shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]" style={{ animationDelay: '0.4s' }}></div>
        </div>
      ),
    },
    {
      id: 2,
      name: 'Retro Spinner Square',
      component: (
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-retro-dark border-t-retro-orange animate-spin shadow-[4px_4px_0px_0px_rgba(26,44,50,1)]"></div>
        </div>
      ),
    },
    {
      id: 3,
      name: 'Retro Pulsing Circle',
      component: (
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-retro-orange border-4 border-retro-dark rounded-full animate-pulse shadow-[4px_4px_0px_0px_rgba(26,44,50,1)]"></div>
          <div className="absolute inset-2 bg-retro-teal border-2 border-retro-dark rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        </div>
      ),
    },
    {
      id: 4,
      name: 'Retro Bars',
      component: (
        <div className="flex items-end justify-center gap-1 h-12">
          <div className="w-3 bg-retro-orange border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ height: '20px', animationDelay: '0s' }}></div>
          <div className="w-3 bg-retro-teal border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ height: '32px', animationDelay: '0.2s' }}></div>
          <div className="w-3 bg-retro-orange border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ height: '40px', animationDelay: '0.4s' }}></div>
          <div className="w-3 bg-retro-teal border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ height: '24px', animationDelay: '0.6s' }}></div>
          <div className="w-3 bg-retro-orange border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ height: '16px', animationDelay: '0.8s' }}></div>
        </div>
      ),
    },
    {
      id: 5,
      name: 'Retro Rotating Squares',
      component: (
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-retro-dark bg-retro-orange animate-spin shadow-[4px_4px_0px_0px_rgba(26,44,50,1)]" style={{ animationDuration: '1s' }}></div>
          <div className="absolute inset-2 border-4 border-retro-dark bg-retro-teal animate-spin" style={{ animationDuration: '1s', animationDirection: 'reverse' }}></div>
        </div>
      ),
    },
    {
      id: 6,
      name: 'Retro Typography Loader',
      component: (
        <div className="text-center">
          <div className="inline-block bg-retro-teal border-4 border-retro-dark px-6 py-3 font-black text-xl uppercase italic shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] animate-pulse">
            Loading...
          </div>
        </div>
      ),
    },
    {
      id: 7,
      name: 'Retro Spinner with Dots',
      component: (
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-retro-dark border-t-retro-orange rounded-full animate-spin shadow-[4px_4px_0px_0px_rgba(26,44,50,1)]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-retro-teal border border-retro-dark rounded-full"></div>
          </div>
        </div>
      ),
    },
    {
      id: 8,
      name: 'Retro Wave',
      component: (
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-8 bg-retro-orange border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-10 bg-retro-teal border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-12 bg-retro-orange border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-10 bg-retro-teal border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-2 h-8 bg-retro-orange border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      ),
    },
    {
      id: 9,
      name: 'Retro Stagely Logo Spinner',
      component: (
        <div className="text-center">
          <div className="inline-block animate-pulse">
            <div className="text-6xl font-black text-retro-dark uppercase italic tracking-tighter transform rotate-12">
              S
            </div>
            <div className="text-xs font-black text-retro-dark uppercase mt-1">Loading...</div>
          </div>
        </div>
      ),
    },
    {
      id: 10,
      name: 'Retro Dual Spinner',
      component: (
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 bg-retro-orange border-4 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] animate-spin" style={{ animationDuration: '2s' }}></div>
          <div className="absolute inset-2 bg-retro-teal border-4 border-retro-dark animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        </div>
      ),
    },
  ]

  const copyToClipboard = (loaderId: number) => {
    const loader = loaders.find(l => l.id === loaderId)
    if (!loader) return

    // Extract the JSX and convert to a reusable component format
    let code = ''
    
    switch (loaderId) {
      case 1:
        code = `<div className="flex items-center justify-center gap-2">
  <div className="w-4 h-4 bg-retro-orange border-2 border-retro-dark rounded-full animate-bounce shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]" style={{ animationDelay: '0s' }}></div>
  <div className="w-4 h-4 bg-retro-teal border-2 border-retro-dark rounded-full animate-bounce shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]" style={{ animationDelay: '0.2s' }}></div>
  <div className="w-4 h-4 bg-retro-orange border-2 border-retro-dark rounded-full animate-bounce shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]" style={{ animationDelay: '0.4s' }}></div>
</div>`
        break
      case 2:
        code = `<div className="relative w-16 h-16">
  <div className="absolute inset-0 border-4 border-retro-dark border-t-retro-orange animate-spin shadow-[4px_4px_0px_0px_rgba(26,44,50,1)]"></div>
</div>`
        break
      case 3:
        code = `<div className="relative w-16 h-16">
  <div className="absolute inset-0 bg-retro-orange border-4 border-retro-dark rounded-full animate-pulse shadow-[4px_4px_0px_0px_rgba(26,44,50,1)]"></div>
  <div className="absolute inset-2 bg-retro-teal border-2 border-retro-dark rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
</div>`
        break
      case 4:
        code = `<div className="flex items-end justify-center gap-1 h-12">
  <div className="w-3 bg-retro-orange border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ height: '20px', animationDelay: '0s' }}></div>
  <div className="w-3 bg-retro-teal border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ height: '32px', animationDelay: '0.2s' }}></div>
  <div className="w-3 bg-retro-orange border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ height: '40px', animationDelay: '0.4s' }}></div>
  <div className="w-3 bg-retro-teal border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ height: '24px', animationDelay: '0.6s' }}></div>
  <div className="w-3 bg-retro-orange border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ height: '16px', animationDelay: '0.8s' }}></div>
</div>`
        break
      case 5:
        code = `<div className="relative w-16 h-16">
  <div className="absolute inset-0 border-4 border-retro-dark bg-retro-orange animate-spin shadow-[4px_4px_0px_0px_rgba(26,44,50,1)]" style={{ animationDuration: '1s' }}></div>
  <div className="absolute inset-2 border-4 border-retro-dark bg-retro-teal animate-spin" style={{ animationDuration: '1s', animationDirection: 'reverse' }}></div>
</div>`
        break
      case 6:
        code = `<div className="text-center">
  <div className="inline-block bg-retro-teal border-4 border-retro-dark px-6 py-3 font-black text-xl uppercase italic shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] animate-pulse">
    Loading...
  </div>
</div>`
        break
      case 7:
        code = `<div className="relative w-16 h-16">
  <div className="absolute inset-0 border-4 border-retro-dark border-t-retro-orange rounded-full animate-spin shadow-[4px_4px_0px_0px_rgba(26,44,50,1)]"></div>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <div className="w-2 h-2 bg-retro-teal border border-retro-dark rounded-full"></div>
  </div>
</div>`
        break
      case 8:
        code = `<div className="flex items-center justify-center gap-1">
  <div className="w-2 h-8 bg-retro-orange border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ animationDelay: '0s' }}></div>
  <div className="w-2 h-10 bg-retro-teal border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ animationDelay: '0.1s' }}></div>
  <div className="w-2 h-12 bg-retro-orange border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
  <div className="w-2 h-10 bg-retro-teal border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
  <div className="w-2 h-8 bg-retro-orange border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
</div>`
        break
      case 9:
        code = `<div className="text-center">
  <div className="inline-block animate-pulse">
    <div className="text-6xl font-black text-retro-dark uppercase italic tracking-tighter transform rotate-12">
      S
    </div>
    <div className="text-xs font-black text-retro-dark uppercase mt-1">Loading...</div>
  </div>
</div>`
        break
      case 10:
        code = `<div className="relative w-16 h-16">
  <div className="absolute inset-0 bg-retro-orange border-4 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] animate-spin" style={{ animationDuration: '2s' }}></div>
  <div className="absolute inset-2 bg-retro-teal border-4 border-retro-dark animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
</div>`
        break
    }

    navigator.clipboard.writeText(code)
    setSelectedLoader(loaderId)
    setTimeout(() => setSelectedLoader(null), 2000)
  }

  return (
    <div className="min-h-screen bg-retro-cream text-retro-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-4">
            <span className="text-4xl font-black text-retro-dark uppercase italic tracking-tighter">← Back</span>
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-retro-dark uppercase italic tracking-tighter mb-4">
            Loading Screens
          </h1>
          <p className="text-retro-dark font-bold text-lg opacity-70">
            Choose your favorite loader design
          </p>
        </div>

        {/* Loader Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loaders.map((loader) => (
            <div
              key={loader.id}
              className="bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl p-8 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(26,44,50,1)] transition-all"
            >
              <div className="flex flex-col items-center justify-center min-h-[200px] mb-6 bg-retro-cream border-2 border-retro-dark rounded-lg p-8">
                {loader.component}
              </div>
              <h3 className="text-xl font-black text-retro-dark uppercase italic mb-4 text-center">
                {loader.name}
              </h3>
              <button
                onClick={() => copyToClipboard(loader.id)}
                className="w-full py-3 px-4 bg-retro-orange hover:bg-retro-dark text-white border-2 border-retro-dark font-black uppercase tracking-wider rounded-lg shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:shadow-[6px_6px_0px_0px_rgba(26,44,50,1)] hover:-translate-y-0.5 transition-all"
              >
                {selectedLoader === loader.id ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>
          ))}
        </div>

        {/* Usage Instructions */}
        <div className="mt-16 bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-xl p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-retro-dark uppercase italic mb-4">
            How to Use
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-retro-dark font-bold">
            <li>Click "Copy Code" on your favorite loader</li>
            <li>Replace the current loader in your components</li>
            <li>Wrap it in a centered container: <code className="bg-retro-cream px-2 py-1 border border-retro-dark rounded text-sm">className="flex min-h-screen items-center justify-center"</code></li>
          </ol>
        </div>
      </div>
    </div>
  )
}
