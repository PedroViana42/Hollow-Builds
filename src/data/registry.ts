import { Entity } from '../engine/types';

// Templates de Heróis
export const HEROES: Record<string, Entity> = {
    ERRANTE: {
        id: 'h_errante',
        name: 'Errante',
        hp: 40,
        maxHp: 40,
        damage: 6,
        critChance: 0.15, // +5% base comparado ao padrão (assumindo 10% como base)
        perks: []
    },
    SOBREVIVENTE: {
        id: 'h_sobrevivente',
        name: 'Sobrevivente',
        hp: 60, // +20 vida inicial (base 40)
        maxHp: 60,
        damage: 5,
        critChance: 0.10,
        perks: []
    }
};

// Templates de Inimigos e Chefes
export const ENEMIES: Record<string, Entity> = {
    MONSTRO_GENERICO_1: {
        id: 'e_monstro_1',
        name: 'Verme das Sombras',
        hp: 20,
        maxHp: 20,
        damage: 3,
        critChance: 0.05,
        perks: []
    },
    MONSTRO_GENERICO_2: {
        id: 'e_monstro_2',
        name: 'Espreitador do Abismo',
        hp: 35,
        maxHp: 35,
        damage: 5,
        critChance: 0.08,
        perks: []
    },
    CARCEREIRO: {
        id: 'e_carcereiro',
        name: 'O Carcereiro',
        hp: 120,
        maxHp: 120,
        damage: 12, // Dano bruto
        critChance: 0.05,
        perks: [] // Sub-chefe do Andar 5
    },
    FRAGMENTO_DEVORADOR: {
        id: 'e_fragmento_devorador',
        name: 'Fragmento do Devorador',
        hp: 300,
        maxHp: 300,
        damage: 20,
        critChance: 0.12,
        perks: [] // Chefe Final Andar 10
    }
};
