import { Item } from '../engine/types';

export const ITEMS: Item[] = [
    // Armas
    {
        id: 'i_espada_enferrujada',
        name: 'Espada Enferrujada',
        type: 'weapon',
        statsModifiers: { damage: 3 }
    },
    {
        id: 'i_adaga_errante',
        name: 'Adaga do Errante',
        type: 'weapon',
        statsModifiers: { damage: 1, critChance: 0.10 }
    },
    // Armaduras
    {
        id: 'i_cota_malha_rasgada',
        name: 'Cota de Malha Rasgada',
        type: 'armor',
        statsModifiers: { maxHp: 20, hp: 20 }
    },
    {
        id: 'i_manto_sombras',
        name: 'Manto de Sombras',
        type: 'armor',
        statsModifiers: { maxHp: 10, hp: 10, critChance: 0.05 }
    },
    // Relíquias
    {
        id: 'i_anel_vitalidade',
        name: 'Anel da Vitalidade',
        type: 'relic',
        statsModifiers: {} // Efeito especial: +2 em toda cura (implementar na engine)
    },
    {
        id: 'i_amuleto_espinhos',
        name: 'Amuleto de Espinhos',
        type: 'relic',
        statsModifiers: {} // Efeito especial: +1 dano em retaliações (implementar na engine)
    }
];
