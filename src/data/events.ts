import { GameEvent, IGameState } from '../engine/types';
import { PERKS } from './perks';

export const EVENTS: GameEvent[] = [
    {
        id: 'ev_arena_silenciosa',
        name: 'Arena Silenciosa',
        description: 'Você entra em uma arena circular. O silêncio é ensurdecedor, mas o sangue no chão conta histórias de lutas passadas.',
        type: 'positive',
        weight: 15,
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
        type: 'neutral',
        weight: 10,
        choices: [
            {
                text: 'Atravessar correndo (-10 HP, +1 Perk aleatório)',
                action: (state) => {
                    state.player.hp -= 10;
                    const availablePerks = PERKS.filter(p => !state.player.perks.some(playerPerk => playerPerk.id === p.id));
                    if (availablePerks.length > 0) {
                        const randomPerk = availablePerks[Math.floor(Math.random() * availablePerks.length)];
                        state.player.perks.push(randomPerk);
                        state.log(`Você atravessou, se feriu, mas compreendeu: ${randomPerk.name}`);
                    } else {
                        state.player.damage += 3;
                        state.log('Você atravessou e se feriu. Sua fúria aumentou (+3 Dano).');
                    }
                }
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
        type: 'neutral',
        weight: 12,
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
        type: 'positive',
        weight: 18,
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
        type: 'positive',
        weight: 10,
        choices: [
            {
                text: 'Ler tomo de guerra (+1 Perk)',
                action: (state) => {
                    const availablePerks = PERKS.filter(p => !state.player.perks.some(playerPerk => playerPerk.id === p.id));
                    if (availablePerks.length > 0) {
                        const randomPerk = availablePerks[Math.floor(Math.random() * availablePerks.length)];
                        state.player.perks.push(randomPerk);
                        state.log(`Você estudou as páginas antigas e aprendeu: ${randomPerk.name}`);
                    } else {
                        state.player.critChance += 0.05;
                        state.log('O tomo reforçou seus fundamentos crueis (+5% Crit).');
                    }
                }
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
        type: 'positive',
        weight: 12,
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
    },
    {
        id: 'ev_mestre_armas',
        name: 'O Mestre de Armas Caído',
        description: 'O esqueleto de um guerreiro lendário ainda segura firmemente sua espada. Uma aura de conhecimento marcial envolve o local.',
        type: 'positive',
        weight: 8,
        condition: (state: IGameState) => !state.player.perks.some(p => p.id === 'p_golpe_embalo'),
        choices: [
            {
                text: 'Estudar sua postura de combate (-15 Max HP, Aprender "Golpe de Embalo")',
                action: (state) => {
                    state.player.maxHp -= 15;
                    const perkId = 'p_golpe_embalo';
                    const hasPerk = state.player.perks.some(p => p.id === perkId);

                    if (hasPerk) {
                        state.player.damage += 5;
                        state.log('Você já conhecia essa técnica. Seu entendimento se aprofundou (+5 Dano).');
                    } else {
                        const perk = PERKS.find(p => p.id === perkId)!;
                        state.player.perks.push(perk);
                        state.log(`Você absorveu o conhecimento: ${perk.name}`);
                    }
                }
            },
            {
                text: 'Prestar respeito e partir (Cura 20 HP)',
                action: (state) => { state.heal(state.player, 20); }
            }
        ]
    },
    {
        id: 'ev_monge_sanguinario',
        name: 'O Monge Sanguinário',
        description: 'Um altar profano onde monges sacrificavam o próprio sangue por poder. Uma poça escarlate ainda ferve no centro.',
        type: 'positive',
        weight: 6,
        choices: [
            {
                text: 'Beber do sangue (-20 HP, Aprender "Transfusão Crítica")',
                action: (state) => {
                    state.player.hp -= 20;
                    const perkId = 'p_transfusao_critica';
                    const hasPerk = state.player.perks.some(p => p.id === perkId);

                    if (hasPerk) {
                        state.player.damage += 5;
                        state.log('O sangue ferve, mas você já possui essa bênção (+5 Dano Permanente).');
                    } else {
                        const perk = PERKS.find(p => p.id === perkId)!;
                        state.player.perks.push(perk);
                        state.log(`Você absorveu o conhecimento: ${perk.name}`);
                    }
                }
            },
            {
                text: 'Apenas banhar suas armas (+2 Dano Temporário)',
                action: (state) => {
                    state.player.damage += 2;
                    state.log('Suas armas estão banhadas em sangue fresco.');
                }
            }
        ]
    },
    {
        id: 'ev_sombra_ladrao',
        name: 'A Sombra do Ladrão',
        description: 'Uma figura espectral furtiva tenta se esconder de você. Ela parece segurar o segredo da sobrevivência rápida.',
        type: 'neutral',
        weight: 7,
        choices: [
            {
                text: 'Encurralar e exigir seu segredo (-10 HP, Aprender "Pele Reativa")',
                action: (state) => {
                    state.player.hp -= 10;
                    const perkId = 'p_pele_reativa';
                    const hasPerk = state.player.perks.some(p => p.id === perkId);

                    if (hasPerk) {
                        state.player.critChance += 0.05;
                        state.log('A sombra tenta te enganar, mas você fica mais letal (+5% Crit).');
                    } else {
                        const perk = PERKS.find(p => p.id === perkId)!;
                        state.player.perks.push(perk);
                        state.log(`Você absorveu o conhecimento: ${perk.name}`);
                    }
                }
            },
            {
                text: 'Ignorar a sombra (+10 Max HP)',
                action: (state) => {
                    state.player.maxHp += 10;
                    state.player.hp += 10;
                    state.log('Você seguiu seu caminho ileso, ganhando vitalidade.');
                }
            }
        ]
    },
    {
        id: 'ev_gas_alucinogeno',
        name: 'Gás Alucinógeno',
        description: 'Um gás esverdeado brota do chão subitamente. As paredes começam a derreter e seus maiores medos se materializam diante dos seus olhos.',
        type: 'negative',
        weight: 4,
        choices: [
            {
                text: 'Correr às cegas pelas paredes irregulares (-20% HP Atual)',
                action: (state) => {
                    const damage = Math.floor(state.player.hp * 0.2);
                    state.player.hp -= damage;
                    state.log(`Você bateu contra as paredes tentando fugir (-${damage} HP).`);
                }
            },
            {
                text: 'Enfrentar suas ilusões paralisantes (-2 Dano Permanente)',
                action: (state) => {
                    state.player.damage = Math.max(1, state.player.damage - 2);
                    state.log('O pesadelo estilhaçou sua confiança. Seu dano foi reduzido permanentemente.');
                }
            }
        ]
    },
    {
        id: 'ev_ladrao_ecos',
        name: 'O Ladrão de Ecos',
        description: 'Um espectro multi-braços surge rastejando pelo teto. Ele sussurra que quer um "brinquedo brilhante" da sua mochila, ou levará sua carne.',
        type: 'negative',
        weight: 3,
        choices: [
            {
                text: 'Entregar um equipamento aleatoriamente (Perde 1 Item)',
                action: (state) => {
                    if (state.player.equipment && state.player.equipment.length > 0) {
                        const randomIndex = Math.floor(Math.random() * state.player.equipment.length);
                        const stolenItem = state.player.equipment[randomIndex];
                        state.player.equipment.splice(randomIndex, 1);

                        // Removendo os mods do item (abordagem crua rápida)
                        if (stolenItem.statsModifiers.maxHp) {
                            state.player.maxHp -= stolenItem.statsModifiers.maxHp;
                            state.player.hp = Math.min(state.player.hp, state.player.maxHp);
                        }
                        if (stolenItem.statsModifiers.damage) state.player.damage -= stolenItem.statsModifiers.damage;
                        if (stolenItem.statsModifiers.critChance) state.player.critChance -= stolenItem.statsModifiers.critChance;

                        state.log(`O Ladrão de Ecos soluçou malignamente ao levar seu item: ${stolenItem.name}`);
                    } else {
                        state.player.hp -= 15;
                        state.log('O ladrão revirou seus bolsos vazios, frustrou-se e o feriu em repúdio (-15 HP).');
                    }
                }
            },
            {
                text: 'Afugentá-lo com força bruta (-25 HP Direto)',
                action: (state) => {
                    state.player.hp -= 25;
                    state.log('O espectro cravou suas garras em você antes de recuar (-25 HP).');
                }
            }
        ]
    },
    {
        id: 'ev_fonte_sangue',
        name: 'Fonte de Sangue',
        description: 'Você encontra uma fonte borbulhante escarlate. Seu corpo estilhaçado instintivamente deseja se jogar nela.',
        type: 'positive',
        weight: 15,
        condition: (state: IGameState) => state.player.hp < state.player.maxHp * 0.4,
        choices: [
            {
                text: 'Beber avidamente (Cura 50% Max HP)',
                action: (state) => {
                    const healAmount = Math.floor(state.player.maxHp * 0.5);
                    state.heal(state.player, healAmount);
                    state.log(`A vitalidade da fonte restaura seus ossos (+${healAmount} HP).`);
                }
            },
            {
                text: 'Absorver o poder cristalizado (+2 Dano Permanente)',
                action: (state) => {
                    state.player.damage += 2;
                    state.log('Você ignorou a dor e extraiu as pedras de sangue da fonte (+2 Dano).');
                }
            }
        ]
    }
];

export function getRandomEvent(eventsPool: GameEvent[], state: IGameState): GameEvent {
    const eligibleEvents = eventsPool.filter(ev => !ev.condition || ev.condition(state));

    // Fallback caso todas as conditions batam false misteriosamente 
    // (O que não deve acontecer dado que temos eventos base sem condition)
    if (eligibleEvents.length === 0) return eventsPool[0];

    const totalWeight = eligibleEvents.reduce((sum, ev) => sum + ev.weight, 0);
    let random = Math.random() * totalWeight;

    for (const event of eligibleEvents) {
        if (random <= event.weight) {
            return event;
        }
        random -= event.weight;
    }

    // Fallback in case of precision issues
    return eligibleEvents[eligibleEvents.length - 1];
}
