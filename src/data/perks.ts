import { Perk, IGameState, Entity } from '../engine/types';

export const PERKS: Perk[] = [
    // onHit
    {
        id: 'p_lamina_sanguessuga',
        name: 'Lâmina Sanguessuga',
        trigger: 'onHit',
        description: 'Cura 1 HP ao acertar um ataque.',
        action: (state: IGameState, owner: Entity) => {
            state.heal(owner, 1);
        }
    },
    {
        id: 'p_faisca_constante',
        name: 'Faísca Constante',
        trigger: 'onHit',
        description: '+1 dano fixo ao acertar um ataque.',
        action: (state: IGameState, owner: Entity, payload: any) => {
            if (payload.target) {
                state.dealDamage(owner, payload.target, 1, false, 'effect');
            }
        }
    },
    {
        id: 'p_golpe_embalo',
        name: 'Golpe de Embalo',
        trigger: 'onHit',
        description: '+2% chance de crítico (acumulativo por combate).',
        action: (state: IGameState, owner: Entity) => {
            owner.critChance += 0.02;
            state.log(`${owner.name} ficou mais rápido e ganhou +2% de crítico!`);
        }
    },
    // onCriticalHit
    {
        id: 'p_furia_focada',
        name: 'Fúria Focada',
        trigger: 'onCriticalHit',
        description: '+3 dano permanente após um crítico.',
        action: (state: IGameState, owner: Entity) => {
            owner.damage += 3;
            state.log(`${owner.name} concentrou fúria e ganhou +3 de dano!`);
        }
    },
    {
        id: 'p_transfusao_critica',
        name: 'Transfusão Crítica',
        trigger: 'onCriticalHit',
        description: 'Cura 5 HP ao causar um acerto crítico.',
        action: (state: IGameState, owner: Entity) => {
            state.heal(owner, 5);
        }
    },
    // onDamageTaken
    {
        id: 'p_escudo_adrenalina',
        name: 'Escudo de Adrenalina',
        trigger: 'onDamageTaken',
        description: 'Reduz o dano recebido em 1 (Mínimo de 1 dano levado).',
        action: (state: IGameState, owner: Entity, payload: any) => {
            // Nota: Este perk precisa ser integrado no GameState (redução ativa) se não houver hook.
            // Para não quebrar o MVP que não tem "beforeDamage", vamos curar 1 hp logo após o dano!
            state.heal(owner, 1);
            state.log(`${owner.name} mitigou 1 de dano com adrenalina!`);
        }
    },
    {
        id: 'p_armadura_espinhos',
        name: 'Armadura de Espinhos',
        trigger: 'onDamageTaken',
        description: 'Reflete 2 de dano ao atacante quando você recebe dano.',
        action: (state: IGameState, owner: Entity, payload: any) => {
            if (payload.source && payload.sourceType === 'attack') {
                state.dealDamage(owner, payload.source, 2, false, 'effect');
            }
        }
    },
    {
        id: 'p_pele_reativa',
        name: 'Pele Reativa',
        trigger: 'onDamageTaken',
        description: '+5% de chance de crítico após receber dano.',
        action: (state: IGameState, owner: Entity) => {
            owner.critChance += 0.05;
            state.log(`${owner.name} reagiu com +5% chance de crítico!`);
        }
    },
    // onKill
    {
        id: 'p_banquete_almas',
        name: 'Banquete de Almas',
        trigger: 'onKill',
        description: 'Cura 20% do HP máximo ao derrotar um inimigo.',
        action: (state: IGameState, owner: Entity) => {
            state.heal(owner, Math.floor(owner.maxHp * 0.2));
        }
    },
    {
        id: 'p_evolucao_sanguinaria',
        name: 'Evolução Sanguinária',
        trigger: 'onKill',
        description: '+5 HP máximo permanente ao derrotar um inimigo.',
        action: (state: IGameState, owner: Entity) => {
            owner.maxHp += 5;
            owner.hp += 5;
            state.log(`${owner.name} devorou e ganhou +5 HP máximo!`);
        }
    },
    // onHeal
    {
        id: 'p_sangue_fervente',
        name: 'Sangue Fervente',
        trigger: 'onHeal',
        description: 'Causa 2 de dano ao inimigo sempre que você se cura.',
        action: (state: IGameState, owner: Entity) => {
            const opponent = state.getOpponent(owner);
            if (opponent && opponent.hp > 0) {
                state.dealDamage(owner, opponent, 2, false, 'effect');
            }
        }
    },
    {
        id: 'p_vigor_blindado',
        name: 'Vigor Blindado',
        trigger: 'onHeal',
        description: 'Ganha +1 HP máximo permanente ao se curar.',
        action: (state: IGameState, owner: Entity) => {
            owner.maxHp += 1;
            owner.hp += 1;
            state.log(`${owner.name} blindou-se com +1 HP máximo!`);
        }
    },
    {
        id: 'p_sobrecarga',
        name: 'Sobrecarga',
        trigger: 'onHeal',
        description: 'Ganha +1 dano permanente quando se cura.',
        action: (state: IGameState, owner: Entity) => {
            owner.damage += 1;
            state.log(`${owner.name} sobrecarregou suas armas com +1 dano!`);
        }
    }
];
