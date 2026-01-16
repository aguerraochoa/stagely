import React from 'react';

export default function Option4Page() {
    return (
        <div className="min-h-screen bg-white p-8 space-y-16 text-black font-sans">

            {/* Header */}
            <div className="flex items-end gap-4 border-b border-black pb-8">
                <h1 className="text-6xl font-black tracking-tighter leading-none">Swiss<br />Style.</h1>
                <p className="text-sm font-bold uppercase tracking-widest max-w-[150px] leading-relaxed mb-1">Function over form. Grid based.</p>
            </div>

            {/* Components Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

                {/* 1. Buttons */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase underline decoration-2 underline-offset-4">Interactive</h3>
                    <div className="flex flex-col gap-4 items-start">
                        <button className="w-full md:w-auto px-8 py-4 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-retro-orange transition-colors">
                            Confirm Selection
                        </button>
                        <button className="w-full md:w-auto px-8 py-4 bg-gray-100 text-black text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
                            Cancel
                        </button>
                    </div>
                </div>

                {/* 2. Inputs */}
                <div className="space-y-6">
                    <h3 className="text-sm font-bold uppercase underline decoration-2 underline-offset-4">Input Data</h3>
                    <div className="space-y-0 border-t border-black">
                        <div className="grid grid-cols-[120px_1fr] items-center border-b border-black py-4">
                            <label className="text-xs font-bold uppercase text-gray-500">Search</label>
                            <input type="text" placeholder="Find artist..."
                                className="w-full bg-transparent font-bold text-xl placeholder-gray-300 focus:outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-[120px_1fr] items-center border-b border-black py-4">
                            <label className="text-xs font-bold uppercase text-gray-500">Filter</label>
                            <div className="font-bold text-xl text-retro-blue">All Days</div>
                        </div>
                    </div>
                </div>

                {/* 3. Cards / List Items */}
                <div className="md:col-span-2 space-y-6">
                    <h3 className="text-sm font-bold uppercase underline decoration-2 underline-offset-4">Collection</h3>
                    <div className="border border-black">
                        <div className="grid grid-cols-[80px_1fr_100px] border-b border-black bg-gray-50 py-2 px-4 text-xs font-bold uppercase">
                            <div>Status</div>
                            <div>Name</div>
                            <div className="text-right">Action</div>
                        </div>
                        <div className="divide-y divide-black">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="grid grid-cols-[80px_1fr_100px] items-center py-4 px-4 hover:bg-retro-cream transition-colors group">
                                    <div>
                                        <div className="w-3 h-3 bg-retro-orange rounded-full"></div>
                                    </div>
                                    <div className="font-bold text-2xl tracking-tight">Andres Guerra</div>
                                    <div className="text-right">
                                        <span className="text-xs font-bold uppercase underline opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
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
