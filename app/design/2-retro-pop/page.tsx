import React from 'react';

export default function Option2Page() {
    return (
        <div className="min-h-screen bg-retro-cream p-8 space-y-12 text-retro-dark font-sans">

            {/* Header */}
            <div className="border-b-4 border-retro-dark pb-8 border-dashed">
                <h1 className="text-5xl font-black mb-2 uppercase italic tracking-tighter">Retro Pop</h1>
                <p className="font-bold opacity-70">Fun, bold, nostalgic grid layout.</p>
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* 1. Buttons */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-retro-dark inline-block">Buttons</h3>
                    <div className="flex flex-col gap-4 items-start">
                        <button className="px-8 py-3 bg-retro-orange text-white font-black uppercase tracking-wider border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(26,44,50,1)] transition-all">
                            Primary Action
                        </button>
                        <button className="px-8 py-3 bg-white text-retro-dark font-bold border-2 border-retro-dark shadow-[4px_4px_0px_0px_rgba(26,44,50,1)] hover:bg-retro-teal/20 transition-all">
                            Secondary Action
                        </button>
                    </div>
                </div>

                {/* 2. Inputs */}
                <div className="space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-retro-dark inline-block">Inputs</h3>
                    <div className="space-y-4 max-w-sm">
                        <input type="text" placeholder="Search artists..."
                            className="w-full bg-white border-2 border-retro-dark px-4 py-3 font-bold placeholder-retro-dark/40 focus:outline-none focus:bg-retro-teal/10 focus:shadow-[4px_4px_0px_0px_rgba(75,146,162,1)] transition-all"
                        />
                        <div className="flex gap-2">
                            <div className="flex-1 h-12 bg-white border-2 border-retro-dark flex items-center px-4 font-bold text-retro-dark/60">Select Day...</div>
                        </div>
                    </div>
                </div>

                {/* 3. Cards / List Items */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-retro-dark inline-block">Interactions</h3>
                    <div className="bg-white border-2 border-retro-dark p-6 shadow-[8px_8px_0px_0px_rgba(26,44,50,1)]">
                        <div className="flex items-center justify-between mb-6 border-b-2 border-retro-dark pb-4">
                            <h2 className="text-3xl font-black uppercase italic">My Squad</h2>
                            <button className="w-10 h-10 bg-retro-teal border-2 border-retro-dark text-white font-black text-xl hover:bg-retro-blue transition-colors">+</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 p-4 border-2 border-retro-dark bg-retro-cream/30 hover:bg-retro-orange/20 cursor-pointer transition-colors">
                                    <div className="w-12 h-12 rounded-full border-2 border-retro-dark bg-retro-blue flex items-center justify-center text-white font-black">AG</div>
                                    <div className="flex-1">
                                        <div className="font-black uppercase">Andres Guerra</div>
                                        <div className="text-xs font-bold bg-retro-teal px-2 py-0.5 inline-block border border-retro-dark text-white">READY</div>
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
