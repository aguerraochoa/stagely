import React from 'react';

export default function Option5Page() {
    return (
        <div className="min-h-screen bg-slate-100 p-8 space-y-12 font-mono text-slate-800">

            {/* Header */}
            <div className="bg-white border-2 border-slate-300 p-8 rounded-sm shadow-sm relative overflow-hidden">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-100 rounded-r-full border-r-2 border-t-2 border-b-2 border-slate-300"></div>
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-8 bg-slate-100 rounded-l-full border-l-2 border-t-2 border-b-2 border-slate-300"></div>

                <h1 className="text-3xl font-bold uppercase tracking-widest text-center border-b-2 border-slate-200 pb-4 mb-4">Admit One</h1>
                <p className="text-center text-xs uppercase text-slate-400">Stagely Design Verification Ticket • No. 000001</p>
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* 1. Buttons */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase text-slate-400">Controls</h3>
                    <div className="flex flex-col gap-4 items-start">
                        <button className="w-full bg-retro-blue text-white py-3 px-6 font-bold uppercase tracking-widest border-2 border-retro-blue border-dashed hover:bg-white hover:text-retro-blue transition-colors">
                            [ Get Access ]
                        </button>
                        <button className="w-full bg-white text-slate-500 py-3 px-6 font-bold uppercase tracking-widest border-2 border-slate-300 border-dashed hover:border-slate-500 transition-colors">
                            [ Cancel ]
                        </button>
                    </div>
                </div>

                {/* 2. Inputs */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase text-slate-400">Data Entry</h3>
                    <div className="space-y-4 max-w-sm">
                        <div className="bg-white p-2 border border-slate-300 shadow-inner">
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search Query</label>
                            <input type="text" className="w-full bg-slate-50 border-b border-slate-300 p-1 font-bold focus:outline-none focus:border-retro-blue" placeholder="Type here..." />
                        </div>
                    </div>
                </div>

                {/* 3. Cards / List Items */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold uppercase text-slate-400">Roster</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex bg-white shadow-sm filter drop-shadow-sm">
                                <div className="bg-retro-orange w-2"></div>
                                <div className="flex-1 p-4 border-t border-b border-r border-slate-200 flex justify-between items-center">
                                    <div>
                                        <div className="text-xs text-slate-400 uppercase">Attendee</div>
                                        <div className="text-xl font-bold uppercase">Andres Guerra</div>
                                    </div>
                                    <div className="border border-slate-300 px-2 py-1 bg-slate-50">
                                        <div className="text-[10px] uppercase text-slate-400">Zone</div>
                                        <div className="font-bold">VIP</div>
                                    </div>
                                </div>
                                <div className="w-8 border-l border-dashed border-slate-300 bg-slate-50 relative">
                                    {/* Perforations */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}
