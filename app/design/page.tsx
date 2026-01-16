import React from 'react';

// Mock Data for Preview
const MOCK_SET = {
    id: '1',
    artist_name: 'Empire of the Sun',
    start_time: '20:00',
    end_time: '21:30',
    stage: 'Main Stage'
}
const MOCK_VOTES = [
    { name: 'Andres', priority: 'green' },
    { name: 'Sarah', priority: 'green' },
    { name: 'Mike', priority: 'yellow' },
]

export default function DesignPage() {
    return (
        <div className="min-h-screen p-8 space-y-20 pb-40">
            <header className="mb-12">
                <h1 className="text-4xl font-bold mb-4 font-mono">Design System V1</h1>
                <p className="opacity-70">Exploring 5 directions for the Stgely UI.</p>

                <div className="flex gap-4 mt-8">
                    <div className="w-12 h-12 rounded bg-retro-teal shadow-md flex items-center justify-center text-xs">Teal</div>
                    <div className="w-12 h-12 rounded bg-retro-blue shadow-md flex items-center justify-center text-xs text-white">Blue</div>
                    <div className="w-12 h-12 rounded bg-retro-cream shadow-md flex items-center justify-center text-xs border">Cream</div>
                    <div className="w-12 h-12 rounded bg-retro-orange shadow-md flex items-center justify-center text-xs text-white">Orange</div>
                    <div className="w-12 h-12 rounded bg-retro-dark shadow-md flex items-center justify-center text-xs text-white">Dark</div>
                </div>
            </header>

            {/* Option 1: The Modern Neon (Refined) */}
            <section>
                <div className="flex justify-between items-center mb-4 max-w-md">
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Option 1: Modern Neon</div>
                    <a href="/design/1-modern-neon" className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-xs font-bold uppercase text-white border border-slate-700">View Kit &rarr;</a>
                </div>
                <div className="bg-slate-900 p-8 rounded-xl relative overflow-hidden max-w-md">
                    <div className="absolute top-0 bottom-0 left-8 w-1 bg-gradient-to-b from-retro-orange to-purple-600 opacity-50"></div>
                    <div className="relative pl-12">
                        <div className="relative bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-xl p-4 shadow-[0_0_15px_rgba(230,126,69,0.1)] border-l-4 border-l-retro-orange">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Main Stage</span>
                                <span className="w-2 h-2 rounded-full bg-retro-orange animate-pulse"></span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">Empire of the Sun</h3>
                            <div className="flex justify-between items-end border-t border-slate-700 pt-3">
                                <span className="text-xs font-mono text-slate-400">20:00 - 21:30</span>
                                <AvatarPile />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Option 2: Retro Pop (Neobrutalism Lite) */}
            <section>
                <div className="flex justify-between items-center mb-4 max-w-md">
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Option 2: Retro Pop</div>
                    <a href="/design/2-retro-pop" className="bg-retro-orange hover:bg-retro-dark px-3 py-1 text-xs font-black uppercase text-white border-2 border-retro-dark shadow-[2px_2px_0px_0px_rgba(26,44,50,1)]">View Kit &rarr;</a>
                </div>
                <div className="bg-retro-cream p-8 rounded-xl max-w-md border-2 border-retro-dark">
                    <div className="relative pl-8 border-l-2 border-retro-dark border-dashed">
                        <div className="bg-white border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] rounded-lg p-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="bg-retro-blue text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-retro-dark">MAIN STAGE</span>
                                <span className="font-mono text-xs font-bold">20:00</span>
                            </div>
                            <h3 className="text-xl font-black text-retro-dark mb-4 uppercase italic">Empire of the Sun</h3>
                            <div className="flex justify-between items-center bg-retro-teal/20 -mx-4 -mb-4 px-4 py-2 border-t-2 border-retro-dark">
                                <span className="text-xs font-bold">Priority: High</span>
                                <AvatarPile dark />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Option 3: Soft Glass (iOS Style) */}
            <section>
                <div className="flex justify-between items-center mb-4 max-w-md">
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Option 3: Soft Glass</div>
                    <a href="/design/3-soft-glass" className="bg-retro-blue hover:bg-retro-blue/80 px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md">View Kit &rarr;</a>
                </div>
                <div className="bg-gradient-to-br from-retro-teal to-retro-blue p-8 rounded-3xl max-w-md">
                    <div className="bg-white/30 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-sm text-white">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-semibold tracking-tight">Empire of the Sun</h3>
                                <p className="text-sm font-medium opacity-80">Main Stage</p>
                            </div>
                            <div className="bg-white/20 px-2 py-1 rounded-md text-xs font-bold backdrop-blur-md">
                                20:00
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <AvatarPile />
                            <span className="text-xs font-medium opacity-80">Are going</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Option 4: Swiss Minimal */}
            <section>
                <div className="flex justify-between items-center mb-4 max-w-md">
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Option 4: Swiss Festival</div>
                    <a href="/design/4-swiss-minimal" className="bg-black hover:bg-gray-800 px-3 py-1 text-xs font-bold uppercase text-white">View Kit &rarr;</a>
                </div>
                <div className="bg-white p-8 rounded-xl max-w-md border border-slate-200">
                    <div className="grid grid-cols-[60px_1fr] gap-4">
                        <div className="text-right pt-1">
                            <div className="text-lg font-bold leading-none">20:00</div>
                            <div className="text-xs text-slate-400">21:30</div>
                        </div>
                        <div>
                            <div className="w-8 h-1 bg-retro-orange mb-3"></div>
                            <h3 className="text-2xl font-bold leading-tight mb-2 tracking-tighter">Empire of the Sun</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-4">Main Stage</p>
                            <AvatarPile dark />
                        </div>
                    </div>
                </div>
            </section>

            {/* Option 5: The "Ticket" (Skeuomorphic) */}
            <section>
                <div className="flex justify-between items-center mb-4 max-w-md">
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Option 5: Ticket Stub</div>
                    <a href="/design/5-ticket-stub" className="bg-slate-300 hover:bg-slate-400 px-3 py-1 rounded text-xs font-bold uppercase text-slate-700">View Kit &rarr;</a>
                </div>
                <div className="bg-slate-100 p-8 rounded-xl max-w-md">
                    <div className="bg-white rounded-lg shadow-md border-l-8 border-l-retro-blue overflow-hidden flex">
                        <div className="flex-1 p-4">
                            <h3 className="font-bold text-lg text-retro-dark">Empire of the Sun</h3>
                            <div className="text-xs text-slate-500 mb-2">Main Stage • 20:00</div>
                            <div className="flex -space-x-1">
                                {['A', 'S'].map((i) => (
                                    <div key={i} className="w-5 h-5 rounded-full bg-retro-blue text-white text-[9px] flex items-center justify-center border border-white">
                                        {i}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-12 border-l border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                            <div className="rotate-90 text-[10px] font-mono text-slate-400 whitespace-nowrap">ADMIT ONE</div>
                        </div>
                    </div>
                </div>
            </section>
        </div >
    );
}

function AvatarPile({ dark }: { dark?: boolean }) {
    const borderColor = dark ? 'border-retro-dark' : 'border-white';
    return (
        <div className="flex -space-x-2">
            <div className={`w-6 h-6 rounded-full bg-retro-orange text-white text-[9px] font-bold flex items-center justify-center border-2 ${borderColor}`}>A</div>
            <div className={`w-6 h-6 rounded-full bg-retro-orange text-white text-[9px] font-bold flex items-center justify-center border-2 ${borderColor}`}>S</div>
            <div className={`w-6 h-6 rounded-full bg-retro-teal text-retro-dark text-[9px] font-bold flex items-center justify-center border-2 ${borderColor}`}>M</div>
        </div>
    )
}
