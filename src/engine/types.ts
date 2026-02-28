/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EventType = 'onHit' | 'onCriticalHit' | 'onDamageTaken' | 'onKill' | 'onHeal';

export interface EntityStats {
  hp: number;
  maxHp: number;
  damage: number;
  critChance: number;
}

export interface Entity extends EntityStats {
  id: string;
  name: string;
  perks: Perk[];
  equipment?: Item[];
}

export interface Perk {
  id: string;
  name: string;
  description: string;
  trigger: EventType;
  // Payload type can be specific based on trigger, but kept generic for data definition
  action?: (state: any, owner: Entity, payload: any) => void;
}

export type ItemType = 'weapon' | 'armor' | 'relic';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  statsModifiers: Partial<EntityStats>;
}

export interface GameEventChoice {
  text: string;
  action: (state: any) => void;
}

export interface GameEvent {
  id: string;
  name: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  weight: number;
  condition?: (state: IGameState) => boolean;
  choices: GameEventChoice[];
}

export interface IGameState {
  player: Entity;
  enemy: Entity;
  combatLog: string[];
  isGameOver: boolean;
  log(msg: string): void;
  getOpponent(entity: Entity): Entity;
  dealDamage(attacker: Entity, target: Entity, amount: number, isCrit?: boolean, sourceType?: 'attack' | 'effect'): void;
  heal(target: Entity, amount: number): void;
  tick(): void;
}

export type MapNodeType = 'battle' | 'elite' | 'event' | 'rest';

export interface MapNode {
  id: string;
  type: MapNodeType;
  connectedNodes: string[];
  row: number; // Indicates the depth in the floor routing
}
