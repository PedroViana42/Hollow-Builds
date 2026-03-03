import { Item } from '../engine/types';

export const ITEMS: Item[] = [
    // Armas
    {
        id: 'i_espada_enferrujada',
        name: 'Espada Enferrujada',
        type: 'weapon',
        statsModifiers: { damage: 2 }
    },
    {
        id: 'i_adaga_errante',
        name: 'Adaga do Errante',
        type: 'weapon',
        statsModifiers: { damage: 1, critChance: 0.05 }
    },
    // Armaduras
    {
        id: 'i_cota_malha_rasgada',
        name: 'Cota de Malha Rasgada',
        type: 'armor',
        statsModifiers: { maxHp: 10, hp: 10 }
    },
    {
        id: 'i_manto_sombras',
        name: 'Manto de Sombras',
        type: 'armor',
        statsModifiers: { maxHp: 5, hp: 5, critChance: 0.02 }
    },
    // Relíquias
    {
        id: 'i_anel_vitalidade',
        name: 'Anel da Vitalidade',
        type: 'relic',
        tier: 1,
        statsModifiers: {},
        effects: { healingBonus: 2 } // Efeito especial: +2 em toda cura
    },
    {
        id: 'i_amuleto_espinhos',
        name: 'Amuleto de Espinhos',
        type: 'relic',
        tier: 1,
        statsModifiers: {},
        effects: { retaliationDamage: 1 } // Efeito especial: +1 dano em retaliações
    }
];
