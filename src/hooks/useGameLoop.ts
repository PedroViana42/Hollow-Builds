import { useEffect, useState, useRef, useCallback } from 'react';
import { GameState } from '../engine/GameState';
import { Entity, IGameState } from '../engine/types';

export function useGameLoop(initialPlayer: Entity, initialEnemy: Entity) {
  const [snapshot, setSnapshot] = useState<IGameState>(new GameState(initialPlayer, initialEnemy));
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);

  // Ref still helps keep the same instance between intervals if needed, 
  // but snapshot is what the UI uses.
  const gameStateRef = useRef<GameState>(snapshot as GameState);

  const updateSnapshot = useCallback(() => {
    const current = gameStateRef.current;
    // Criar um novo objeto que mantém as propriedades e RECONECTA os métodos
    // Isso garante que React detecte a mudança e os eventos possam chamar state.log() etc.
    setSnapshot({
      ...current,
      log: current.log.bind(current),
      heal: current.heal.bind(current),
      dealDamage: current.dealDamage.bind(current),
      getOpponent: current.getOpponent.bind(current),
      tick: current.tick.bind(current),
    } as IGameState);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (!gameStateRef.current.isGameOver) {
        gameStateRef.current.tick();
        setTickCount(c => c + 1);
        updateSnapshot();
      } else {
        setIsRunning(false);
        updateSnapshot();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, updateSnapshot]);

  const startGame = useCallback(() => setIsRunning(true), []);
  const pauseGame = useCallback(() => setIsRunning(false), []);

  const resetGame = useCallback((player: Entity, enemy: Entity) => {
    const newState = new GameState(player, enemy);
    gameStateRef.current = newState;
    setSnapshot(newState);
    setTickCount(0);
    setIsRunning(false);
  }, []);

  return {
    gameState: snapshot,
    tickCount,
    isRunning,
    startGame,
    pauseGame,
    resetGame
  };
}
