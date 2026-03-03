import React from 'react';

interface TarotCardProps {
    name: string;
    imageUrl?: string;
    hp?: number;
    damage?: number;
    critChance?: number;
    customClass?: string;
    onClick?: () => void;
    flip?: boolean;
}

export const TarotCard: React.FC<TarotCardProps> = ({
    name,
    imageUrl,
    hp,
    damage,
    critChance,
    customClass = '',
    onClick,
    flip = false,
}) => {
    return (
        <div
            onClick={onClick}
            className={`relative w-48 h-72 rounded-2xl border border-zinc-700 bg-zinc-900 shadow-2xl overflow-hidden transition-all duration-300 select-none
        ${onClick ? 'cursor-pointer hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:border-emerald-500/50 active:scale-95' : ''}
        ${customClass}
      `}
        >
            {/* Background Image or Fallback */}
            <div className="absolute inset-0 bg-zinc-950">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover transform-gpu [image-rendering:-webkit-optimize-contrast] scale-105"
                        style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
                    />
                ) : (
                    <div className="w-full h-full relative">
                        <img
                            src="/imgs/versoCarta.jpg"
                            alt="Verso da Carta"
                            className="w-full h-full object-cover transform-gpu scale-105"
                            style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
                        />
                        <div className="absolute inset-0 bg-zinc-900/10 flex items-center justify-center pointer-events-none">
                            <span className="text-8xl font-black text-zinc-950/20 z-10 select-none pb-12">{name.charAt(0)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent pointer-events-none"></div>

            {/* Border effect highlight inner */}
            <div className="absolute inset-1 border border-zinc-700/50 rounded-xl pointer-events-none"></div>

            {/* Content Layer */}
            <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <div className="bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 p-3 rounded-xl mb-1 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <h3 className="text-lg font-black text-zinc-100 italic tracking-tighter leading-tight drop-shadow-md">
                        {name}
                    </h3>

                    {(hp !== undefined || damage !== undefined || critChance !== undefined) && (
                        <div className={`flex gap-2 mt-2 text-[10px] font-mono font-bold ${flip ? 'flex-row-reverse justify-end' : ''}`}>
                            {hp !== undefined && (
                                <div className="flex items-center gap-1 text-red-400">
                                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> HP {hp}
                                </div>
                            )}
                            {damage !== undefined && (
                                <div className="flex items-center gap-1 text-amber-400">
                                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span> DMG {damage}
                                </div>
                            )}
                            {critChance !== undefined && (
                                <div className="flex items-center gap-1 text-emerald-400">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> CRIT {Math.round(critChance * 100)}%
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
