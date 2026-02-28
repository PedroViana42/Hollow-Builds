import React, { useState, useMemo, useCallback } from 'react';
import { useGameLoop } from './hooks/useGameLoop';
import { Entity, GameEvent, GameEventChoice, Item, MapNode } from './engine/types';
import { HEROES, ENEMIES, ENEMY_PROGRESSION_POOL } from './data/registry';
import { ITEMS } from './data/items';
import { PERKS } from './data/perks';
import { EVENTS, getRandomEvent } from './data/events';
import { saveGame, loadGame, hasSavedGame, clearSave } from './utils/saveManager';
import { generateFloorMap } from './utils/mapGenerator';
import { useMetaProgression } from './hooks/useMetaProgression';
import { TalentTree } from './components/TalentTree';
import { TALENT_TREE } from './data/metaTree';
import { scaleEnemyStats } from './utils/scaler';

type GamePhase = 'SELECT_HERO' | 'BATTLE' | 'MAP_SELECTION' | 'EVENT' | 'VICTORY' | 'DEFEAT' | 'LOOT_SELECTION';

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('SELECT_HERO');
  const [selectedHero, setSelectedHero] = useState<Entity | null>(null);
  const [currentEnemyKey, setCurrentEnemyKey] = useState<string>('MONSTRO_GENERICO_1');
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);
  const [floor, setFloor] = useState(1);
  const [lootOptions, setLootOptions] = useState<Item[]>([]);
  const [mapNodes, setMapNodes] = useState<MapNode[]>([]);
  const [currentMapRow, setCurrentMapRow] = useState(0);
  const [hasSave, setHasSave] = useState(hasSavedGame());
  const [showTalents, setShowTalents] = useState(false);

  // Meta-Progression Core Hook
  const { metaState, addEcos, unlockTalent } = useMetaProgression();

  const currentEnemy = useMemo(() => ENEMIES[currentEnemyKey], [currentEnemyKey]);

  const { gameState, isRunning, startGame, pauseGame, resetGame, tickCount } = useGameLoop(
    selectedHero || HEROES.SOBREVIVENTE,
    currentEnemy
  );

  const { player, enemy, combatLog, isGameOver } = gameState;

  const handleHeroSelect = (hero: Entity) => {
    const heroWithGear = { ...hero, equipment: [...(hero.equipment || [])], perks: [...hero.perks] };

    if (hero.id === 'h_errante') {
      heroWithGear.equipment.push(ITEMS.find(i => i.id === 'i_adaga_errante')!);
      heroWithGear.perks.push(PERKS.find(p => p.id === 'p_furia_focada')!);
    } else if (hero.id === 'h_sobrevivente') {
      heroWithGear.equipment.push(ITEMS.find(i => i.id === 'i_cota_malha_rasgada')!);
      heroWithGear.perks.push(PERKS.find(p => p.id === 'p_lamina_sanguessuga')!);
    }

    heroWithGear.equipment.forEach(item => {
      if (item.statsModifiers.maxHp) {
        heroWithGear.maxHp += item.statsModifiers.maxHp;
        heroWithGear.hp += item.statsModifiers.maxHp;
      }
      if (item.statsModifiers.damage) heroWithGear.damage += item.statsModifiers.damage;
      if (item.statsModifiers.critChance) heroWithGear.critChance += item.statsModifiers.critChance;
    });

    // Injeção de Meta-Progressão (Aplicando efeitos de todos os talentos comprados)
    metaState.unlockedTalents.forEach(talentId => {
      const talent = TALENT_TREE[talentId];
      if (talent) talent.applyEffect(heroWithGear); // Muta os stats base permanentemente na run inteira!
    });

    const initialMap = generateFloorMap(1);
    setMapNodes(initialMap);
    setCurrentMapRow(0);

    setSelectedHero(heroWithGear);
    resetGame(heroWithGear, scaleEnemyStats(ENEMIES[currentEnemyKey], 1));
    setPhase('MAP_SELECTION');
    saveGame(gameState, 'MAP_SELECTION', floor, initialMap, 0);
  };

  const handleContinue = () => {
    const savedData = loadGame();
    if (savedData) {
      setFloor(savedData.floor);
      setPhase(savedData.phase as GamePhase);
      setMapNodes(savedData.mapNodes);
      setCurrentMapRow(savedData.currentMapRow);

      const loadedPlayer = savedData.gameState.player;
      setSelectedHero(loadedPlayer);
      setCurrentEnemyKey(savedData.gameState.enemy.id === 'e_monstro_1' ? 'MONSTRO_GENERICO_1' :
        savedData.gameState.enemy.id === 'e_monstro_2' ? 'MONSTRO_GENERICO_2' :
          savedData.gameState.enemy.id === 'e_carcereiro' ? 'CARCEREIRO' : 'FRAGMENTO_DEVORADOR');

      resetGame(loadedPlayer, savedData.gameState.enemy);

      // Override logs
      if (savedData.gameState.combatLog.length > 0) {
        savedData.gameState.log("--- Batalha Restaurada ---");
      }
    }
  };

  const handleWin = () => {
    if (phase === 'BATTLE') {
      setFloor(f => f + 1);

      const playerItemIds = new Set(player.equipment?.map(item => item.id) || []);
      const availableItems = ITEMS.filter(item => !playerItemIds.has(item.id));

      const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
      setLootOptions(shuffled.slice(0, 3));

      setPhase('LOOT_SELECTION');
      saveGame(gameState, 'LOOT_SELECTION', floor, mapNodes, currentMapRow);
    }
  };

  const handleLootSelect = (item: Item) => {
    const savedPlayer = { ...player, equipment: [...(player.equipment || [])] };
    savedPlayer.equipment.push(item);

    if (item.statsModifiers.maxHp) {
      savedPlayer.maxHp += item.statsModifiers.maxHp;
      savedPlayer.hp += item.statsModifiers.maxHp;
    }
    if (item.statsModifiers.damage) savedPlayer.damage += item.statsModifiers.damage;
    if (item.statsModifiers.critChance) savedPlayer.critChance += item.statsModifiers.critChance;

    setSelectedHero(savedPlayer);
    resetGame(savedPlayer, currentEnemy);
    setPhase('MAP_SELECTION');
    saveGame(gameState, 'MAP_SELECTION', floor, mapNodes, currentMapRow);
  };

  const handleEventChoice = (choice: GameEventChoice) => {
    choice.action(gameState);
    setSelectedHero({ ...player });
    setPhase('MAP_SELECTION');
    saveGame(gameState, 'MAP_SELECTION', floor, mapNodes, currentMapRow);
  };

  const handleNodeSelect = (node: MapNode) => {
    // Avança linha ao clicar no node
    setCurrentMapRow(node.row + 1);

    // Se passamos do Boss Row
    if (node.row >= 4) {
      const newFloor = floor + 1;
      setFloor(newFloor);
      const newMap = generateFloorMap(newFloor);
      setMapNodes(newMap);
      setCurrentMapRow(0);
      saveGame(gameState, 'MAP_SELECTION', newFloor, newMap, 0); // Salva geração
    } else {
      saveGame(gameState, 'MAP_SELECTION', floor, mapNodes, node.row + 1); // Salva avanço
    }

    if (node.type === 'battle' || node.type === 'elite') {
      goToBattle(node.type === 'elite');
    } else if (node.type === 'event') {
      goToEvent();
    } else if (node.type === 'rest') {
      gameState.heal(gameState.player, Math.floor(gameState.player.maxHp * 0.4));
      gameState.log("A fogueira restaura seu vigor perdido.");
      setSelectedHero({ ...gameState.player });
      setPhase('MAP_SELECTION');
    }
  };

  const goToBattle = (isElite: boolean = false) => {
    // No MVP Inimigo é Cíclico
    const currentIndex = ENEMY_PROGRESSION_POOL.indexOf(currentEnemyKey);
    const nextIndex = (currentIndex + 1) % ENEMY_PROGRESSION_POOL.length;
    let nextEnemyKey = ENEMY_PROGRESSION_POOL[nextIndex];

    if (isElite) {
      // Força Chefe ou equivalente mais forte temporariamente para não quebrar logica MVP
      nextEnemyKey = 'FRAGMENTO_DEVORADOR';
    }

    setCurrentEnemyKey(nextEnemyKey);

    const savedPlayer = { ...player };
    setSelectedHero(savedPlayer);
    resetGame(savedPlayer, scaleEnemyStats(ENEMIES[nextEnemyKey], floor));
    setPhase('BATTLE');
    saveGame(gameState, 'BATTLE', floor, mapNodes, currentMapRow);
  };

  const goToEvent = () => {
    const weightedEvent = getRandomEvent(EVENTS, gameState);
    setCurrentEvent(weightedEvent);
    setPhase('EVENT');
  };

  const handleReturnToHome = useCallback(() => {
    setFloor(1);
    setCurrentEnemyKey('MONSTRO_GENERICO_1');
    setSelectedHero(null);
    setPhase('SELECT_HERO');
    resetGame(HEROES.SOBREVIVENTE, scaleEnemyStats(ENEMIES['MONSTRO_GENERICO_1'], 1));
    clearSave();
    setHasSave(false);
  }, [resetGame]);

  const handleReincarnate = useCallback(() => {
    // Recompensa pela Jornada (Por andar conquistado)
    const earnedEcos = floor * 10;
    addEcos(earnedEcos);

    // Retorna para o Lobby
    handleReturnToHome();
  }, [floor, addEcos, handleReturnToHome]);

  if (phase === 'SELECT_HERO') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center justify-center font-sans overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)] pointer-events-none"></div>
        <h1 className="text-7xl font-black mb-4 text-emerald-500 tracking-tighter uppercase italic drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">Hollow Builds</h1>

        {hasSave && (
          <button
            onClick={handleContinue}
            className="mb-8 px-12 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-black text-xl transition-all shadow-lg hover:shadow-amber-500/50 hover:scale-105 active:scale-95 animate-pulse"
          >
            CONTINUAR JORNADA
          </button>
        )}

        <button
          onClick={() => setShowTalents(true)}
          className="mb-8 px-8 py-3 bg-zinc-900 border border-emerald-900/50 hover:border-emerald-500 text-emerald-400 rounded-2xl font-black text-sm transition-all shadow-lg hover:shadow-emerald-900/50 active:scale-95 flex items-center gap-3 uppercase tracking-widest"
        >
          <span className="text-xl">✧</span> Metapressão <span className="text-zinc-500 ml-2">({metaState.ecos} Ecos)</span>
        </button>

        <p className="text-zinc-500 mb-8 font-mono tracking-widest uppercase text-xs">Selecione seu Herói para o Abismo</p>
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
                {hero.id === 'h_errante' ? 'Um guerreiro ágil que busca brechas fatais nas defesas inimigas através de precisão cirúrgica.' :
                  hero.id === 'h_sobrevivente' ? 'Um lutador resiliente que aguenta punição extrema enquanto drena a vida de seus oponentes.' :
                    hero.id === 'h_cultista' ? 'Um herege focado em roubar a força vital ao dilacerar criticamente a carne inimiga.' :
                      'Uma montanha de carne e cicatrizes, revoga toda dor infligida de volta em fúria incandescente.'}
              </p>
            </button>
          ))}
        </div>

        {showTalents && (
          <TalentTree
            ecos={metaState.ecos}
            unlockedTalents={metaState.unlockedTalents}
            onUnlock={unlockTalent}
            onClose={() => setShowTalents(false)}
          />
        )}
      </div>
    );
  }

  if (phase === 'LOOT_SELECTION') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center justify-center font-sans">
        <h2 className="text-4xl font-black mb-2 text-amber-500 tracking-tighter uppercase italic">Despojos do Abismo</h2>
        <p className="text-zinc-500 mb-12 uppercase tracking-[0.3em] font-mono text-xs">Escolha sua recompensa</p>

        {lootOptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {lootOptions.map(item => (
              <button
                key={item.id}
                onClick={() => handleLootSelect(item)}
                className="group bg-zinc-900 border border-zinc-800 p-8 rounded-3xl hover:border-amber-500 transition-all text-left relative overflow-hidden active:scale-95 flex flex-col gap-4 shadow-xl hover:shadow-amber-900/20"
              >
                <div className="text-4xl mb-2">{item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : '💍'}</div>
                <h3 className="text-xl font-bold text-zinc-200 group-hover:text-amber-400">{item.name}</h3>
                <div className="flex flex-col gap-1 text-xs font-mono text-zinc-400">
                  {Object.entries(item.statsModifiers).map(([stat, val]) => (
                    <span key={stat} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                      +{val} {stat}
                    </span>
                  ))}
                  {Object.keys(item.statsModifiers).length === 0 && (
                    <span className="italic text-zinc-600">Efeito Especial Oculto</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div className="text-6xl text-zinc-700">📜</div>
            <p className="text-zinc-500 italic text-lg text-center max-w-md">O baú está vazio. Você já saqueou todos os artefatos conhecidos deste abismo.</p>
            <button
              onClick={() => {
                setSelectedHero(player);
                resetGame(player, currentEnemy);
                setPhase('MAP_SELECTION');
                saveGame(gameState, 'MAP_SELECTION', floor);
              }}
              className="mt-4 px-8 py-4 bg-zinc-800 hover:bg-zinc-700 rounded-2xl font-bold transition-all text-zinc-300"
            >
              SEGUIR ADIANTE
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'MAP_SELECTION') {
    // Filtrar apenas nós ativos desta camada (row atual) e da camada anterior
    // Para simplificar graficamente, geraremos uma UI da 'Row atual' pra vc escolher
    const availableNodes = mapNodes.filter(n => n.row === currentMapRow);

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center justify-center font-sans">
        <h2 className="text-4xl font-black mb-2 text-zinc-400 tracking-tighter uppercase italic">Andar {floor}</h2>
        <p className="text-zinc-600 mb-12 uppercase tracking-[0.3em] font-mono text-xs">Avanço de Profundidade: {currentMapRow}/5</p>

        <div className="flex gap-12 w-full justify-center flex-wrap">
          {availableNodes.map(node => {
            const isBattle = node.type === 'battle';
            const isElite = node.type === 'elite';
            const isEvent = node.type === 'event';
            const isRest = node.type === 'rest';

            const colorClass = isElite ? 'hover:border-red-600 shadow-red-950/20 group-hover:text-red-600' :
              isBattle ? 'hover:border-amber-600 shadow-amber-950/20 group-hover:text-amber-600' :
                isRest ? 'hover:border-orange-500 shadow-orange-950/20 group-hover:text-orange-500' :
                  'hover:border-emerald-500 shadow-emerald-950/20 group-hover:text-emerald-500';

            const icon = isElite ? '💀' : isBattle ? '⚔️' : isRest ? '🔥' : '✨';
            const label = isElite ? 'Chefe/Elite' : isBattle ? 'Inimigo' : isRest ? 'Fogueira' : 'Encontro';

            return (
              <div key={node.id} className="flex flex-col items-center gap-4">
                <button
                  onClick={() => handleNodeSelect(node)}
                  className={`group relative bg-zinc-900 border-2 border-zinc-800 w-36 h-36 rounded-3xl flex flex-col items-center justify-center transition-all active:scale-95 shadow-2xl ${colorClass}`}
                >
                  <div className="text-5xl mb-2 group-hover:scale-110 transition-transform duration-300">{icon}</div>
                  <span className={`text-[10px] font-black tracking-widest uppercase transition-colors text-zinc-500 ${colorClass.split(' ').pop()}`}>
                    {label}
                  </span>
                </button>

                {/* Visual indicator se houver mais de uma row sobrando */}
                {currentMapRow < 4 && (
                  <div className="h-12 border-l-2 border-dashed border-zinc-800 flex items-center mt-2 group-hover:border-zinc-600">
                    <span className="w-2 h-2 rounded-full border border-zinc-700 bg-zinc-900 translate-y-6"></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'EVENT' && currentEvent) {
    const isNegative = currentEvent.type === 'negative';
    const isPositive = currentEvent.type === 'positive';

    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex flex-col items-center justify-center font-sans">
        <div className={`max-w-2xl w-full bg-zinc-900 border-2 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden transition-colors ${isNegative ? 'border-red-900/40 shadow-red-950/20' :
          isPositive ? 'border-emerald-900/30' : 'border-zinc-800'
          }`}>
          <div className="absolute top-0 right-0 p-12 text-zinc-800 pointer-events-none">
            <span className={`text-9xl font-black opacity-10 leading-none ${isNegative && 'text-red-900'} ${isPositive && 'text-emerald-900'}`}>!</span>
          </div>
          <h2 className={`text-3xl font-black mb-6 tracking-tight uppercase italic ${isNegative ? 'text-red-500' : isPositive ? 'text-emerald-400' : 'text-zinc-300'
            }`}>{currentEvent.name}</h2>
          <p className="text-lg text-zinc-400 leading-relaxed mb-12 italic font-serif">"{currentEvent.description}"</p>
          <div className="flex flex-col gap-4">
            {currentEvent.choices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleEventChoice(choice)}
                className={`w-full bg-zinc-800 p-5 rounded-2xl text-left border border-zinc-700 transition-all group active:scale-[0.98] ${isNegative ? 'hover:bg-red-900/50 hover:border-red-500' :
                  isPositive ? 'hover:bg-emerald-600 hover:border-emerald-400' :
                    'hover:bg-zinc-700 hover:border-zinc-500'
                  }`}
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
                Hollow Builds
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

            {(isGameOver || enemy.hp <= 0 || player.hp <= 0) && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md z-20 animate-in fade-in duration-500 p-8 text-center">
                <h2 className={`text-6xl font-black mb-12 tracking-tighter uppercase italic drop-shadow-2xl ${player.hp > 0 ? 'text-emerald-400 animate-pulse' : 'text-red-700'}`}>
                  {player.hp > 0 ? 'Inimigo Expurgado' : 'Venceu o Eco'}
                </h2>
                {player.hp > 0 ? (
                  <button onClick={handleWin} className="px-12 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-2xl transition-all hover:scale-110 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                    PROSSEGUIR
                  </button>
                ) : (
                  <button onClick={handleReincarnate} className="px-12 py-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black text-2xl transition-all hover:scale-110">
                    REENCARNAR <span className="text-emerald-500 text-lg ml-2">+{floor * 10} ✧</span>
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
