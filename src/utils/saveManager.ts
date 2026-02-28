import { GameState } from '../engine/GameState';
import { Entity, IGameState, Item, Perk, MapNode } from '../engine/types';
import { ITEMS } from '../data/items';
import { PERKS } from '../data/perks';
import { HEROES, ENEMIES } from '../data/registry';

const SAVE_KEY = 'ecos_devorados_save';

// Essa é a estrutura minimalista e segura para JSON
export interface SerializedSaveData {
    player: {
        id: string; // Para saber qual template base usar
        name: string;
        hp: number;
        maxHp: number;
        damage: number;
        critChance: number;
        equipmentIds: string[];
        perkIds: string[];
    };
    enemy: {
        id: string; // Para saber qual inimigo recriar
        hp: number;
        maxHp: number;
    };
    combatLog: string[];
    currentPhase: string;
    currentFloor: number;
    mapNodes?: MapNode[];
    currentMapRow?: number;
}

export function saveGame(
    gameState: IGameState,
    currentPhase: string,
    currentFloor: number,
    mapNodes: MapNode[] = [],
    currentMapRow: number = 0
) {
    const data: SerializedSaveData = {
        player: {
            id: "h_" + gameState.player.name.toLowerCase().replace(' ', '_'), // Assumindo padrão ou salvando o ID base
            name: gameState.player.name,
            hp: gameState.player.hp,
            maxHp: gameState.player.maxHp,
            damage: gameState.player.damage,
            critChance: gameState.player.critChance,
            equipmentIds: gameState.player.equipment?.map(e => e.id) || [],
            perkIds: gameState.player.perks.map(p => p.id)
        },
        enemy: {
            id: gameState.enemy.id,
            hp: gameState.enemy.hp,
            maxHp: gameState.enemy.maxHp
        },
        combatLog: gameState.combatLog,
        currentPhase,
        currentFloor,
        mapNodes,
        currentMapRow
    };

    // Correção no ID do player já que o template pode ter diferenças pequenas
    if (gameState.player.name === 'Errante') data.player.id = 'h_errante';
    if (gameState.player.name === 'Sobrevivente') data.player.id = 'h_sobrevivente';

    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    console.log('Progress saved!', data);
}

export function hasSavedGame(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
}

export function loadGame(): {
    gameState: IGameState,
    phase: string,
    floor: number,
    mapNodes: MapNode[],
    currentMapRow: number
} | null {
    const saveString = localStorage.getItem(SAVE_KEY);
    if (!saveString) return null;

    try {
        const data: SerializedSaveData = JSON.parse(saveString);

        // 1. Encontrar os templates originais
        const baseHeroTemplate = Object.values(HEROES).find(h => h.id === data.player.id);
        const baseEnemyTemplate = Object.values(ENEMIES).find(e => e.id === data.enemy.id);

        if (!baseHeroTemplate || !baseEnemyTemplate) {
            console.error('Save data is corrupted or refers to missing entities.');
            return null;
        }

        // 2. Reidratar Itens e Perks do banco de dados (RESTAURAR AS FUNÇÕES)
        const hydratedEquipment: Item[] = data.player.equipmentIds
            .map(id => ITEMS.find(item => item.id === id))
            .filter((item): item is Item => item !== undefined);

        const hydratedPerks: Perk[] = data.player.perkIds
            .map(id => PERKS.find(perk => perk.id === id))
            .filter((perk): perk is Perk => perk !== undefined);

        // 3. Reconstruir a Entidade do Jogador com os stats exatos do momento do save
        const hydratedPlayer: Entity = {
            ...baseHeroTemplate,
            name: data.player.name,
            hp: data.player.hp,
            maxHp: data.player.maxHp,
            damage: data.player.damage,
            critChance: data.player.critChance,
            equipment: hydratedEquipment,
            perks: hydratedPerks
        };

        // 4. Reconstruir a Entidade do Inimigo com seu HP do momento do save
        const hydratedEnemy: Entity = {
            ...baseEnemyTemplate,
            hp: data.enemy.hp,
            maxHp: data.enemy.maxHp
            // Inimigos atuais não têm equipamentos dinâmicos no jogo ainda
        };

        // 5. Instanciar a classe viva do motor (isso recria os buffers e lida com referências corretamente)
        const newGameState = new GameState(hydratedPlayer, hydratedEnemy);
        newGameState.combatLog = data.combatLog; // Restaurar a história das batalhas

        return {
            gameState: newGameState,
            phase: data.currentPhase,
            floor: data.currentFloor,
            mapNodes: data.mapNodes || [],
            currentMapRow: data.currentMapRow || 0
        };
    } catch (err) {
        console.error('Failed to load save file', err);
        return null;
    }
}

export function clearSave() {
    localStorage.removeItem(SAVE_KEY);
}
