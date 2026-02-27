import { GameEvent } from '../engine/types';

export const EVENTS: GameEvent[] = [
    {
        id: 'ev_arena_silenciosa',
        name: 'Arena Silenciosa',
        description: 'Você entra em uma arena circular. O silêncio é ensurdecedor, mas o sangue no chão conta histórias de lutas passadas.',
        choices: [
            {
                text: 'Treinar intensamente (+2 Dano)',
                action: (state) => { state.player.damage += 2; state.log('Você treinou e ficou mais forte.'); }
            },
            {
                text: 'Buscar equipamentos nos restos (+10% Crit)',
                action: (state) => { state.player.critChance += 0.10; state.log('Você encontrou uma lâmina afiada.'); }
            }
        ]
    },
    {
        id: 'ev_camara_espinhos',
        name: 'Câmara dos Espinhos',
        description: 'As paredes estão repletas de espinhos mecânicos que se movem ritmicamente.',
        choices: [
            {
                text: 'Atravessar correndo (-10 HP, +1 Perk aleatório)',
                action: (state) => { state.player.hp -= 10; state.log('Você atravessou, mas se feriu.'); }
            },
            {
                text: 'Desmontar uma armadilha (+1 Amuleto de Espinhos)',
                action: (state) => { state.log('Você obteve um componente de espinhos.'); }
            }
        ]
    },
    {
        id: 'ev_altar_brasas',
        name: 'Altar das Brasas',
        description: 'Um altar antigo que emana um calor sobrenatural.',
        choices: [
            {
                text: 'Oferecer sangue (-15 HP, +5 Dano permanente)',
                action: (state) => { state.player.hp -= 15; state.player.damage += 5; }
            },
            {
                text: 'Meditar no calor (Cura total)',
                action: (state) => { state.player.hp = state.player.maxHp; }
            }
        ]
    },
    {
        id: 'ev_acampamento',
        name: 'Acampamento',
        description: 'Um momento de relativa paz na escuridão.',
        choices: [
            {
                text: 'Descansar (Cura 30% HP)',
                action: (state) => { state.heal(state.player, Math.floor(state.player.maxHp * 0.3)); }
            },
            {
                text: 'Afiar armas (+1 Dano próximo combate)',
                action: (state) => { state.player.damage += 1; }
            }
        ]
    },
    {
        id: 'ev_biblioteca_esquecida',
        name: 'Biblioteca Esquecida',
        description: 'Livros empoeirados flutuam em salas sem gravidade.',
        choices: [
            {
                text: 'Ler tomo de guerra (+1 Perk)',
                action: (state) => { state.log('Você aprendeu um novo segredo.'); }
            },
            {
                text: 'Estudar mapas (Próximo evento será benéfico)',
                action: (state) => { state.log('Você agora conhece o caminho.'); }
            }
        ]
    },
    {
        id: 'ev_eco_perdido',
        name: 'Eco Perdido',
        description: 'Uma voz familiar sussurra seu nome de uma fenda no espaço.',
        choices: [
            {
                text: 'Ouvir a voz (+5 Max HP)',
                action: (state) => { state.player.maxHp += 5; state.player.hp += 5; }
            },
            {
                text: 'Ignorar o chamado (+5% Crit)',
                action: (state) => { state.player.critChance += 0.05; }
            }
        ]
    }
];
