import { Perk } from '../engine/types';

export const PERKS: Perk[] = [
    // onHit
    {
        id: 'p_lamina_sanguessuga',
        name: 'Lâmina Sanguessuga',
        trigger: 'onHit',
        description: 'Cura 1 HP ao acertar um ataque.'
    },
    {
        id: 'p_faisca_constante',
        name: 'Faísca Constante',
        trigger: 'onHit',
        description: '+1 dano fixo ao acertar um ataque.'
    },
    {
        id: 'p_golpe_embalo',
        name: 'Golpe de Embalo',
        trigger: 'onHit',
        description: '+2% velocidade de ataque (acumulativo por combate).'
    },
    // onCriticalHit
    {
        id: 'p_furia_focada',
        name: 'Fúria Focada',
        trigger: 'onCriticalHit',
        description: '+3 dano no próximo ataque após um crítico.'
    },
    {
        id: 'p_transfusao_critica',
        name: 'Transfusão Crítica',
        trigger: 'onCriticalHit',
        description: 'Cura 5 HP ao causar um acerto crítico.'
    },
    // onDamageTaken
    {
        id: 'p_armadura_espinhos',
        name: 'Armadura de Espinhos',
        trigger: 'onDamageTaken',
        description: 'Reflete 2 de dano ao atacante quando você recebe dano.'
    },
    {
        id: 'p_pele_reativa',
        name: 'Pele Reativa',
        trigger: 'onDamageTaken',
        description: '+5% de chance de crítico no próximo ataque após receber dano.'
    },
    // onKill
    {
        id: 'p_banquete_almas',
        name: 'Banquete de Almas',
        trigger: 'onKill',
        description: 'Cura 20% do HP máximo ao derrotar um inimigo.'
    },
    {
        id: 'p_evolucao_sanguinaria',
        name: 'Evolução Sanguinária',
        trigger: 'onKill',
        description: '+5 HP máximo permanente ao derrotar um inimigo.'
    },
    // onHeal
    {
        id: 'p_sangue_fervente',
        name: 'Sangue Fervente',
        trigger: 'onHeal',
        description: 'Causa 2 de dano ao inimigo sempre que você se cura.'
    },
    {
        id: 'p_vigor_blindado',
        name: 'Vigor Blindado',
        trigger: 'onHeal',
        description: 'Ganha um escudo que absorve 1 de dano no próximo golpe ao se curar.'
    },
    {
        id: 'p_sobrecarga',
        name: 'Sobrecarga',
        trigger: 'onHeal',
        description: 'Se a vida estiver cheia, qualquer cura vira dano adicional no próximo ataque.'
    }
];
