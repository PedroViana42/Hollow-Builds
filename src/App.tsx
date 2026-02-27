import React, { useState, useMemo, useCallback } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { Entity, GameEvent, GameEventChoice } from './engine/types';
import { HEROES, ENEMIES } from './data/registry';
import { ITEMS } from './data/items';
import { PERKS } from './data/perks';
import { EVENTS } from './data/events';

type GamePhase = 'SELECT_HERO' | 'BATTLE' | 'MAP_SELECTION' | 'EVENT' | 'VICTORY' | 'DEFEAT';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('SELECT_HERO');
  const [selectedHero, setSelectedHero] = useState<Entity | null>(null);
  const [currentEnemyKey, setCurrentEnemyKey] = useState<string>('MONSTRO_GENERICO_1');
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [floor, setFloor] = useState(1);

  const currentEnemy = useMemo(() => ENEMIES[currentEnemyKey], [currentEnemyKey]);

  const { gameState, isRunning, startGame, pauseGame, resetGame, tickCount } = useGameLoop(
    selectedHero || HEROES.SOBREVIVENTE,
    currentEnemy
  );

  const { player, enemy, combatLog, isGameOver } = gameState;

  const handleHeroSelect = (hero: Entity) => {
    const heroWithGear = { ...hero };
    if (hero.id === 'h_errante') {
      heroWithGear.equipment = [ITEMS.find(i => i.id === 'i_adaga_errante')!];
      heroWithGear.perks = [PERKS.find(p => p.id === 'p_furia_focada')!];
    } else {
      heroWithGear.equipment = [ITEMS.find(i => i.id === 'i_cota_malha_rasgada')!];
      heroWithGear.perks = [PERKS.find(p => p.id === 'p_lamina_sanguessuga')!];
    }

    setSelectedHero(heroWithGear);
    setPhase('BATTLE');
  };

  const handleWin = () => {
    if (phase === 'BATTLE') {
      setFloor(f => f + 1);
      setPhase('MAP_SELECTION');
    }
  };

  const goToBattle = () => {
    const enemyKeys = Object.keys(ENEMIES);
    const currentIndex = enemyKeys.indexOf(currentEnemyKey);
    const nextIndex = (currentIndex + 1) % enemyKeys.length;
    setCurrentEnemyKey(enemyKeys[nextIndex]);

    setSelectedHero({ ...player });
    resetGame();
    setPhase('BATTLE');
  };

  const goToEvent = () => {
    const randomEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    setCurrentEvent(randomEvent);
    setPhase('EVENT');
  };

  const handleEventChoice = (choice: GameEventChoice) => {
    choice.action(gameState);
    setSelectedHero({ ...player });
    setPhase('MAP_SELECTION');
  };

  const handleReturnToHome = useCallback(() => {
    setFloor(1);
    setCurrentEnemyKey('MONSTRO_GENERICO_1');
    setSelectedHero(null);
    setPhase('SELECT_HERO');
    resetGame();
  }, [resetGame]);

  if (phase === 'SELECT_HERO') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center justify-center font-sans overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none"></div>
        <h1 className="text-7xl font-black mb-4 text-emerald-500 tracking-tighter uppercase italic drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">Ecos Devorados</h1>
        <p className="text-zinc-500 mb-12 font-mono tracking-widest uppercase text-xs">Selecione seu Herói para o Abismo</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full px-4">
          {Object.values(HEROES).map(hero => (
            <button
              key={hero.id}
              onClick={() => handleHeroSelect(hero)}
              className="group bg-zinc-900 border border-zinc-800 p-10 rounded-3xl hover:border-emerald-500 transition-all text-left relative overflow-hidden active:scale-95"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                <span className="text-8xl font-black">{hero.name[0]}</span>
              </div>
              <h2 className="text-4xl font-black mb-3 group-hover:text-emerald-400 tracking-tight">{hero.name}</h2>
              <div className="flex gap-6 mb-8 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> HP: {hero.hp}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-full"></span> Dano: {hero.damage}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Crit: {Math.round(hero.critChance * 100)}%</div>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px]">
                {hero.id === 'h_errante' ? 'Um guerreiro ágil que busca brechas fatais nas defesas inimigas através de precisão cirúrgica.' : 'Um lutador resiliente que aguenta punição extrema enquanto drena a vida de seus oponentes.'}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'MAP_SELECTION') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center justify-center font-sans">
        <h2 className="text-4xl font-black mb-2 text-zinc-400 tracking-tighter uppercase italic">Andar {floor}</h2>
        <p className="text-zinc-600 mb-12 uppercase tracking-[0.3em] font-mono text-xs">Caminhos da Perdição</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-3xl">
          <button
            onClick={goToBattle}
            className="group relative bg-zinc-900 border border-zinc-800 p-12 rounded-full aspect-square flex flex-col items-center justify-center hover:border-red-500 transition-all active:scale-95 shadow-2xl shadow-red-950/10"
          >
            <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-500">⚔️</div>
            <span className="text-xl font-black tracking-widest uppercase group-hover:text-red-500">Batalha</span>
            <span className="text-[10px] text-zinc-600 mt-2 uppercase font-mono">Enfrente o {currentEnemy.name}</span>
          </button>
          <button
            onClick={goToEvent}
            className="group relative bg-zinc-900 border border-zinc-800 p-12 rounded-full aspect-square flex flex-col items-center justify-center hover:border-emerald-500 transition-all active:scale-95 shadow-2xl shadow-emerald-950/10"
          >
            <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-500">✨</div>
            <span className="text-xl font-black tracking-widest uppercase group-hover:text-emerald-500">Evento</span>
            <span className="text-[10px] text-zinc-600 mt-2 uppercase font-mono">Encontro Inesperado</span>
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'EVENT' && currentEvent) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center justify-center font-sans">
        <div className="max-w-2xl w-full bg-zinc-900 border-2 border-emerald-900/30 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 text-zinc-800 pointer-events-none">
            <span className="text-9xl font-black opacity-10 leading-none">?</span>
          </div>
          <h2 className="text-3xl font-black mb-6 text-emerald-400 tracking-tight uppercase italic">{currentEvent.name}</h2>
          <p className="text-lg text-zinc-400 leading-relaxed mb-12 italic font-serif">"{currentEvent.description}"</p>
          <div className="flex flex-col gap-4">
            {currentEvent.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleEventChoice(choice)}
                className="w-full bg-zinc-800 hover:bg-emerald-600 p-5 rounded-2xl text-left border border-zinc-700 hover:border-emerald-400 transition-all group active:scale-[0.98]"
              >
                <span className="font-bold text-zinc-300 group-hover:text-white">{choice.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Battle Info & Controls */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <header className="flex justify-between items-center bg-zinc-900 p-5 rounded-2xl border border-zinc-800 shadow-2xl">
            <div>
              <h1 className="text-xl font-bold text-emerald-500 tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Ecos Devorados
              </h1>
              <p className="text-xs text-zinc-500 font-mono">Andar {floor} - {currentEnemy.name}</p>
            </div>
            <div className="flex gap-3">
              {!isRunning && !isGameOver && (
                <button onClick={startGame} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/20">
                  INICIAR
                </button>
              )}
              {isRunning && (
                <button onClick={pauseGame} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold transition-all">
                  PAUSAR
                </button>
              )}
              <button onClick={handleReturnToHome} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl font-bold transition-all text-xs">
                DESISTIR
              </button>
            </div>
          </header>

          {/* Health Bars Container */}
          <div className="grid grid-cols-2 gap-1 bg-zinc-900 p-1 rounded-3xl border border-zinc-800 overflow-hidden">
            <div className="bg-zinc-950 p-6 rounded-2xl">
              <div className="flex justify-between items-end mb-3">
                <span className="font-black text-emerald-400 text-lg uppercase tracking-wider">{player.name}</span>
                <span className="font-mono text-xs text-zinc-500">{player.hp} / {player.maxHp} HP</span>
              </div>
              <div className="h-5 bg-zinc-900 rounded-full p-1 border border-zinc-800">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                  style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-zinc-950 p-6 rounded-2xl">
              <div className="flex justify-between items-end mb-3 flex-row-reverse">
                <span className="font-black text-red-500 text-lg uppercase tracking-wider">{enemy.name}</span>
                <span className="font-mono text-xs text-zinc-500">{enemy.hp} / {enemy.maxHp} HP</span>
              </div>
              <div className="h-5 bg-zinc-900 rounded-full p-1 border border-zinc-800 flex justify-end">
                <div
                  className="h-full bg-red-600 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                  style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Arena Visuals */}
          <div className="h-80 bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center justify-center gap-32 relative overflow-hidden group shadow-inner">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-emerald-500 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-red-500 rounded-full"></div>
            </div>

            {/* Player Sprite */}
            <div className={`relative z-10 w-32 h-32 bg-emerald-950 border-4 border-emerald-500 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center transition-all duration-100 ${tickCount % 2 !== 0 ? 'translate-x-4 scale-110 shadow-emerald-500/40' : 'translate-x-0 scale-100 shadow-emerald-500/10'}`}>
              <span className="text-5xl font-black text-emerald-500 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">{player.name[0]}</span>
              {isRunning && tickCount % 2 !== 0 && (
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-emerald-400 font-black text-2xl animate-bounce drop-shadow-md">
                  -{player.damage}
                </div>
              )}
            </div>

            <div className="text-4xl font-black text-zinc-800 italic select-none">VS</div>

            {/* Enemy Sprite */}
            <div className={`relative z-10 w-32 h-32 bg-red-950 border-4 border-red-600 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.2)] flex items-center justify-center transition-all duration-100 ${tickCount % 2 === 0 && isRunning ? 'translate-x-0 scale-100 shadow-red-600/10' : '-translate-x-4 scale-110 shadow-red-600/40'}`}>
              <span className="text-5xl font-black text-red-600 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">{enemy.name[0]}</span>
              {isRunning && tickCount % 2 === 0 && (
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-red-400 font-black text-2xl animate-bounce drop-shadow-md">
                  -{enemy.damage}
                </div>
              )}
            </div>

            {isGameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md z-20 animate-in fade-in duration-500 p-8 text-center">
                <h2 className={`text-6xl font-black mb-12 tracking-tighter uppercase italic drop-shadow-2xl ${player.hp > 0 ? 'text-emerald-400 animate-pulse' : 'text-red-700'}`}>
                  {player.hp > 0 ? 'Inimigo Expurgado' : 'Venceu o Eco'}
                </h2>
                {player.hp > 0 ? (
                  <button onClick={handleWin} className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-2xl transition-all hover:scale-110 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                    PROSSEGUIR
                  </button>
                ) : (
                  <button onClick={handleReturnToHome} className="px-12 py-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black text-2xl transition-all hover:scale-110">
                    REENCARNAR
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Inventory & History */}
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-xl flex flex-col gap-2">
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              <span>Status Base</span>
              <span className="text-emerald-500">Lv. {floor}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-zinc-950 p-2 rounded-xl text-center border border-zinc-800">
                <div className="text-[8px] text-zinc-600 uppercase">Ataque</div>
                <div className="text-lg font-black text-amber-500">{player.damage}</div>
              </div>
              <div className="bg-zinc-950 p-2 rounded-xl text-center border border-zinc-800">
                <div className="text-[8px] text-zinc-600 uppercase">Crítico</div>
                <div className="text-lg font-black text-emerald-500">{Math.round(player.critChance * 100)}%</div>
              </div>
            </div>
          </div>

          {/* Inventory/Equipment */}
          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-xl">
            <h3 className="text-xs font-black mb-4 text-zinc-500 uppercase tracking-[0.2em]">Equipamentos</h3>
            <div className="flex flex-col gap-2">
              {player.equipment?.map(item => (
                <div key={item.id} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 group hover:border-emerald-500/50 transition-colors">
                  <div className="text-xs font-bold text-zinc-300 mb-1 group-hover:text-emerald-400">{item.name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono flex flex-wrap gap-x-2">
                    {Object.entries(item.statsModifiers).map(([stat, val]) => (
                      <span key={stat}>+{val} {stat}</span>
                    ))}
                  </div>
                </div>
              ))}
              {(!player.equipment || player.equipment.length === 0) && <p className="text-xs text-zinc-600 italic">Vazio...</p>}
            </div>
          </div>

          {/* Perks */}
          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 shadow-xl">
            <h3 className="text-xs font-black mb-4 text-zinc-500 uppercase tracking-[0.2em]">Perks Ativos</h3>
            <div className="flex flex-col gap-4">
              {player.perks.map(perk => (
                <div key={perk.id} className="relative group">
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs font-bold text-emerald-400">{perk.name}</div>
                    <div className="text-[8px] px-1.5 py-0.5 bg-zinc-800 rounded group-hover:bg-emerald-900/30 text-zinc-500 uppercase font-mono tracking-tighter">
                      {perk.trigger}
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-tight">{perk.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Combat Log */}
          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex-1 flex flex-col min-h-[350px] shadow-xl overflow-hidden">
            <h3 className="text-xs font-black mb-4 text-zinc-500 uppercase tracking-[0.2em]">Sincronia do Abismo</h3>
            <div className="flex-1 overflow-y-auto font-mono text-[9px] text-zinc-600 flex flex-col gap-2 pr-2 custom-scrollbar">
              {[...combatLog].reverse().map((log, i) => (
                <div key={i} className="pb-1 border-b border-zinc-800/30 last:border-0 leading-relaxed animate-in fade-in duration-300">
                  <span className={log.includes('CRÍTICO') ? 'text-amber-500 font-black' : log.includes('curou') ? 'text-emerald-500' : log.includes('derrotado') ? 'text-red-500 font-black' : ''}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
