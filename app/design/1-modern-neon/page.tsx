import React from 'react';

export default function Option1Page() {
    return (
        <div className="min-h-screen bg-slate-900 p-8 space-y-12">

            {/* Header */}
            <div className="border-b border-slate-700 pb-8">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-retro-orange to-purple-600 mb-2">Modern Neon</h1>
                <p className="text-slate-400">Dark, sleek, high contrast, vibrant gradients.</p>
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* 1. Buttons */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Buttons</h3>
                    <div className="flex flex-col gap-4 items-start">
                        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-retro-orange to-purple-600 text-white font-bold shadow-[0_0_20px_rgba(230,126,69,0.3)] hover:scale-105 transition-transform">
                            Primary Action
                        </button>
                        <button className="px-6 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold hover:bg-slate-700 transition-colors">
                            Secondary Action
                        </button>
                        <button className="px-4 py-2 rounded-full border border-retro-teal text-retro-teal text-xs font-bold uppercase tracking-wider hover:bg-retro-teal/10">
                            Tag / Filter
                        </button>
                    </div>
                </div>

                {/* 2. Inputs */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Inputs</h3>
                    <div className="space-y-4 max-w-sm">
                        <input type="text" placeholder="Search artists..."
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-retro-orange focus:ring-1 focus:ring-retro-orange transition-all"
                        />
                        <div className="flex gap-2">
                            <div className="flex-1 h-12 bg-slate-800/50 rounded-xl border border-slate-700 flex items-center px-4 text-slate-400">Select Day...</div>
                        </div>
                    </div>
                </div>

                {/* 3. Cards / List Items */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Interactions</h3>
                    <div className="bg-slate-800/30 border border-slate-700 rounded-2xl p-6 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white">My Squad</h2>
                            <button className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white">+</button>
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-slate-700">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-retro-blue to-retro-teal flex items-center justify-center text-white font-bold">AG</div>
                                    <div className="flex-1">
                                        <div className="text-white font-bold">Andres Guerra</div>
                                        <div className="text-xs text-slate-400">Ready for Day 1</div>
                                    </div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
