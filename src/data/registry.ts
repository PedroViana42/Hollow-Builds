import { Entity } from '../engine/types';
import { PERKS } from './perks';

// Templates de Heróis
export const HEROES: Record<string, Entity> = {
    ERRANTE: {
        id: 'h_errante',
        name: 'Errante',
        hp: 120,
        maxHp: 120,
        damage: 6,
        critChance: 0.15,
        perks: []
    },
    SOBREVIVENTE: {
        id: 'h_sobrevivente',
        name: 'Sobrevivente',
        hp: 155,
        maxHp: 155,
        damage: 6,
        critChance: 0.10,
        perks: []
    },
    CULTISTA: {
        id: 'h_cultista',
        name: 'Cultista Arrependido',
        hp: 90,
        maxHp: 90,
        damage: 9,
        critChance: 0.20,
        perks: [PERKS.find(p => p.id === 'p_transfusao_critica')!]
    },
    FLAGELADO: {
        id: 'h_flagelado',
        name: 'O Flagelado',
        hp: 160,
        maxHp: 160,
        damage: 6,
        critChance: 0.10,
        perks: [
            PERKS.find(p => p.id === 'p_sangue_fervente')!,
            PERKS.find(p => p.id === 'p_escudo_adrenalina')!
        ]
    }
};

// Templates de Inimigos e Chefes
export const ENEMIES: Record<string, Entity> = {
    MONSTRO_GENERICO_1: {
        id: 'e_monstro_1',
        name: 'Verme das Sombras',
        hp: 30,
        maxHp: 30,
        damage: 2,
        critChance: 0.05,
        perks: []
    },
    CARRASCO_SILENCIOSO: {
        id: 'e_carrasco',
        name: 'Carrasco Silencioso',
        hp: 50,
        maxHp: 50,
        damage: 9,
        critChance: 0.15,
        perks: [PERKS.find(p => p.id === 'p_transfusao_critica')!]
    },
    MONSTRO_GENERICO_2: {
        id: 'e_monstro_2',
        name: 'Espreitador do Abismo',
        hp: 50,
        maxHp: 50,
        damage: 3,
        critChance: 0.08,
        perks: []
    },
    CASCA_ESPINHOSA: {
        id: 'e_casca_espinhosa',
        name: 'Casca Espinhosa',
        hp: 75,
        maxHp: 75,
        damage: 4,
        critChance: 0.05,
        perks: [PERKS.find(p => p.id === 'p_sangue_fervente')!]
    },
    CARCEREIRO: {
        id: 'e_carcereiro',
        name: 'O Carcereiro',
        hp: 90,
        maxHp: 90,
        damage: 7,
        critChance: 0.05,
        perks: []
    },
    PARASITA_ABISMO: {
        id: 'e_parasita_abismo',
        name: 'Parasita do Abismo',
        hp: 110,
        maxHp: 110,
        damage: 3,
        critChance: 0.0,
        perks: [PERKS.find(p => p.id === 'p_lamina_sanguessuga')!]
    },
    FRAGMENTO_DEVORADOR: {
        id: 'e_fragmento_devorador',
        name: 'Fragmento do Devorador',
        hp: 160,
        maxHp: 160,
        damage: 8,
        critChance: 0.12,
        perks: []
    }
};

export const ENEMY_PROGRESSION_POOL: string[] = [
    'MONSTRO_GENERICO_1',
    'CARRASCO_SILENCIOSO',
    'MONSTRO_GENERICO_2',
    'CASCA_ESPINHOSA',
    'CARCEREIRO',
    'PARASITA_ABISMO',
    'FRAGMENTO_DEVORADOR'
];
