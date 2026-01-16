import React from 'react';

export default function Option3Page() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-retro-cream via-white to-retro-teal/20 p-8 space-y-12 text-slate-800">

            {/* Header */}
            <div className="pb-8">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-800 mb-2">Soft Glass</h1>
                <p className="text-slate-500 font-medium">Clean, translucent, approachable, iOS-inspired.</p>
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* 1. Buttons */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Buttons</h3>
                    <div className="flex flex-col gap-4 items-start">
                        <button className="px-6 py-3 rounded-2xl bg-retro-blue text-white font-semibold shadow-lg shadow-retro-blue/20 hover:bg-retro-blue/90 hover:scale-[1.02] transition-all">
                            Primary Action
                        </button>
                        <button className="px-6 py-3 rounded-2xl bg-white text-slate-600 font-semibold shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
                            Secondary Action
                        </button>
                    </div>
                </div>

                {/* 2. Inputs */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Inputs</h3>
                    <div className="space-y-4 max-w-sm">
                        <div className="bg-white/60 backdrop-blur-xl p-1 rounded-2xl shadow-sm border border-white">
                            <input type="text" placeholder="Search artists..."
                                className="w-full bg-transparent px-4 py-3 text-slate-700 placeholder-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Cards / List Items */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">My Squad</h3>
                    <div className="bg-white/40 backdrop-blur-2xl border border-white/60 rounded-3xl p-6 shadow-xl shadow-slate-200/50">
                        <div className="space-y-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/50 transition-colors cursor-pointer">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-retro-blue to-retro-teal p-[2px]">
                                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-slate-600">AG</div>
                                    </div>
                                    <div className="flex-1 border-b border-slate-100 pb-3 mb-0 last:border-0 last:pb-0">
                                        <div className="text-slate-800 font-semibold text-lg">Andres Guerra</div>
                                        <div className="text-xs text-retro-blue font-medium">Active now</div>
                                    </div>
                                    <div className="text-slate-300">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
