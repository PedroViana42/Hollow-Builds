import React from 'react';
import { TALENT_TREE, TalentNode } from '../data/metaTree';

interface TalentTreeProps {
    ecos: number;
    unlockedTalents: string[];
    onUnlock: (id: string) => void;
    onClose: () => void;
}

export const TalentTree: React.FC<TalentTreeProps> = ({ ecos, unlockedTalents, onUnlock, onClose }) => {
    // Organizando por Tiers para facilitar o CSS Grid
    const tiers = [1, 2, 3];

    const canUnlock = (node: TalentNode) => {
        if (unlockedTalents.includes(node.id)) return false; // Já possui
        if (ecos < node.cost) return false; // Muito caro

        // Todos os pré-reqs estão no array de desbloqueados?
        return node.prerequisites.every(req => unlockedTalents.includes(req));
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8 backdrop-blur-md">
            <div className="w-full max-w-5xl flex flex-col items-center bg-zinc-950 border border-emerald-900/50 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">

                {/* Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.15),transparent_60%)] pointer-events-none"></div>

                {/* Header */}
                <div className="flex w-full justify-between items-start mb-12 z-10">
                    <div>
                        <h2 className="text-4xl font-black text-emerald-500 uppercase italic tracking-tighter">Convergência de Ecos</h2>
                        <p className="text-zinc-500 font-mono text-sm tracking-widest mt-2">MOLDANDO A CARNE E O ESPÍRITO</p>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-emerald-600 font-mono mb-1 uppercase tracking-widest">Saldo de Almas</div>
                        <div className="text-5xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">{ecos} <span className="text-2xl text-emerald-700">✧</span></div>
                    </div>
                </div>

                {/* Tree Container */}
                <div className="flex flex-col gap-12 w-full items-center z-10">
                    {tiers.map(tier => {
                        const nodes = Object.values(TALENT_TREE).filter(n => n.tier === tier);
                        if (nodes.length === 0) return null;

                        return (
                            <div key={tier} className="flex relative items-center justify-center gap-16 w-full">

                                {/* Linhas conectivas de CSS simples (Drawn statically for fixed 4-node design) */}
                                {tier === 2 && (
                                    <div className="absolute -top-12 h-12 w-px bg-zinc-800" />
                                )}

                                {nodes.map(node => {
                                    const isUnlocked = unlockedTalents.includes(node.id);
                                    const isAvailable = canUnlock(node);

                                    // Estilos Condicionais com base no Status
                                    const baseStyle = "w-64 p-6 rounded-2xl border-2 flex flex-col gap-2 transition-all relative overflow-hidden group";

                                    let statusStyle = "";

                                    if (isUnlocked) {
                                        statusStyle = "bg-emerald-950/80 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]";
                                    } else if (isAvailable) {
                                        statusStyle = "bg-zinc-900 border-zinc-500 hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] cursor-pointer active:scale-95";
                                    } else {
                                        statusStyle = "bg-zinc-950 border-zinc-800 opacity-60 grayscale cursor-not-allowed";
                                    }

                                    return (
                                        <button
                                            key={node.id}
                                            onClick={() => { if (isAvailable) onUnlock(node.id); }}
                                            disabled={!isAvailable && !isUnlocked}
                                            className={`${baseStyle} ${statusStyle}`}
                                        >
                                            <div className="flex justify-between items-start w-full">
                                                <span className={`font-black uppercase tracking-tight ${isUnlocked ? 'text-emerald-400' : 'text-zinc-300'} group-hover:text-white`}>
                                                    {node.name}
                                                </span>

                                                {!isUnlocked && (
                                                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${isAvailable ? 'bg-zinc-800 text-emerald-400' : 'bg-red-950 text-red-500'}`}>
                                                        {node.cost} ✧
                                                    </span>
                                                )}
                                                {isUnlocked && (
                                                    <span className="text-emerald-400 text-sm">✔</span>
                                                )}
                                            </div>

                                            <p className={`text-xs text-left leading-relaxed mt-2 ${isUnlocked ? 'text-emerald-200/70' : 'text-zinc-500'}`}>
                                                {node.description}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {/* Footer Controls */}
                <button
                    onClick={onClose}
                    className="mt-16 px-12 py-4 rounded-full border border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all font-bold tracking-widest uppercase text-sm z-10 active:scale-95"
                >
                    Retornar à Escuridão
                </button>
            </div>
        </div>
    );
};
