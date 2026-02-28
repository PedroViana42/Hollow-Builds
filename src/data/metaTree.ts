import { EntityStats } from '../engine/types';

export interface TalentNode {
    id: string;
    name: string;
    description: string;
    cost: number;
    prerequisites: string[]; // IDs de talentos necessários para desbloquear este
    tier: number;            // Camada visual na árvore
    applyEffect: (stats: EntityStats) => void;
}

export const TALENT_TREE: Record<string, TalentNode> = {
    // TIER 1 (Raiz)
    't_vitalidade_1': {
        id: 't_vitalidade_1',
        name: 'Vitalidade I',
        description: '+10 de Vida Máxima (HP) para todos os Heróis.',
        cost: 15,
        prerequisites: [],
        tier: 1,
        applyEffect: (stats) => {
            stats.maxHp += 10;
            stats.hp += 10;
        }
    },

    // TIER 2
    't_forca_1': {
        id: 't_forca_1',
        name: 'Força Bruta I',
        description: '+2 de Dano Base em todos os ataques.',
        cost: 30,
        prerequisites: ['t_vitalidade_1'],
        tier: 2,
        applyEffect: (stats) => {
            stats.damage += 2;
        }
    },
    't_pele_ferro_1': {
        id: 't_pele_ferro_1',
        name: 'Pele de Ferro I',
        description: '+20 de Vida Máxima extra. Sobrevivência ampliada.',
        cost: 25,
        prerequisites: ['t_vitalidade_1'],
        tier: 2,
        applyEffect: (stats) => {
            stats.maxHp += 20;
            stats.hp += 20;
        }
    },

    // TIER 3
    't_foco_crit_1': {
        id: 't_foco_crit_1',
        name: 'Foco Crítico I',
        description: '+10% de Chance de Acerto Crítico Permanente.',
        cost: 60,
        prerequisites: ['t_forca_1'],
        tier: 3,
        applyEffect: (stats) => {
            stats.critChance += 0.10;
        }
    }
};
