import { GameState } from './src/engine/GameState';
import { HEROES, ENEMIES, ENEMY_PROGRESSION_POOL } from './src/data/registry';
import { ITEMS } from './src/data/items';
import { PERKS } from './src/data/perks';
import { Entity } from './src/engine/types';
import { scaleEnemyStats } from './src/utils/scaler';

const ENEMY_KEYS = ENEMY_PROGRESSION_POOL;
const RUNS_PER_HERO = 500;
const HERO_LIST = Object.values(HEROES);
const TOTAL_RUNS = RUNS_PER_HERO * HERO_LIST.length;

interface RunResult {
    heroId: string;
    heroName: string;
    highestFloor: number;
    itemsGathered: number;
    killedBy: string;
}

function equipHero(heroTemplate: Entity): Entity {
    const hero = { ...heroTemplate, perks: [...heroTemplate.perks], equipment: [] };

    if (hero.id === 'h_errante') {
        hero.equipment = [ITEMS.find(i => i.id === 'i_adaga_errante')!];
        hero.perks = [PERKS.find(p => p.id === 'p_furia_focada')!];
    } else if (hero.id === 'h_sobrevivente') {
        hero.equipment = [ITEMS.find(i => i.id === 'i_cota_malha_rasgada')!];
        hero.perks = [PERKS.find(p => p.id === 'p_lamina_sanguessuga')!];
    } else {
        // Cultista e Flagelado já trazem Perks no template base no registry.ts
        // Não adicione equipamentos extra aqui para manter base.
    }

    hero.equipment.forEach(item => {
        if (item.statsModifiers.maxHp) {
            hero.maxHp += item.statsModifiers.maxHp;
            hero.hp += item.statsModifiers.maxHp;
        }
        if (item.statsModifiers.damage) hero.damage += item.statsModifiers.damage;
        if (item.statsModifiers.critChance) hero.critChance += item.statsModifiers.critChance;
    });

    return hero;
}

function simulateRun(heroTemplate: Entity): RunResult {
    let hero = equipHero(heroTemplate);
    let highestFloor = 0;
    let isDead = false;
    let itemsGatheredCount = hero.equipment.length;
    let killedBy = "";

    while (!isDead) {
        // Determinando inimigo do andar atual (Ciclo infinito)
        const enemyKey = ENEMY_KEYS[highestFloor % ENEMY_KEYS.length];
        const enemyTemplate = ENEMIES[enemyKey];

        // Simular Buff de Status do Inimigo baseado no Floor usando escalonamento Exponencial Pós-Chefe
        const scaledEnemy = scaleEnemyStats(enemyTemplate, highestFloor + 1);

        const state = new GameState(hero, scaledEnemy);

        while (!state.isGameOver) {
            state.tick();
        }

        if (state.player.hp <= 0) {
            isDead = true;
            highestFloor++; // Morte neste andar
            killedBy = enemyKey;
        } else {
            highestFloor++;
            hero = { ...state.player };

            // Lógica de Loot (Pega 1 item aleatório não possuído após a vitória, parecido com App.tsx)
            const playerItemIds = new Set(hero.equipment.map(item => item.id));
            const availableItems = ITEMS.filter(item => !playerItemIds.has(item.id));

            if (availableItems.length > 0) {
                // Sorteia 1
                const randomIndex = Math.floor(Math.random() * availableItems.length);
                const awardedItem = availableItems[randomIndex];

                hero.equipment = [...hero.equipment, awardedItem];
                itemsGatheredCount++;

                // Muta Status como em App.tsx
                if (awardedItem.statsModifiers.maxHp) {
                    hero.maxHp += awardedItem.statsModifiers.maxHp;
                    hero.hp += awardedItem.statsModifiers.maxHp;
                }
                if (awardedItem.statsModifiers.damage) hero.damage += awardedItem.statsModifiers.damage;
                if (awardedItem.statsModifiers.critChance) hero.critChance += awardedItem.statsModifiers.critChance;
            }
        }
    }

    return {
        heroId: heroTemplate.id,
        heroName: heroTemplate.name,
        highestFloor,
        itemsGathered: itemsGatheredCount,
        killedBy
    };
}

function main() {
    console.log(`\nIniciando simulação de Sobrevivência (Scaling Infinito + Loots)`);
    console.log(`Buscando recordes para ${TOTAL_RUNS} runs...\n`);

    const results: RunResult[] = [];

    for (let i = 0; i < RUNS_PER_HERO; i++) {
        HERO_LIST.forEach(hero => {
            results.push(simulateRun(hero));
        });
    }

    // Calcular Andar Médio e Máximo Geral
    const totalFloors = results.reduce((acc, r) => acc + r.highestFloor, 0);
    const avgFloor = (totalFloors / TOTAL_RUNS).toFixed(1);
    const maxFloor = Math.max(...results.map(r => r.highestFloor));

    console.log(`=== ESTATÍSTICAS GERAIS ===`);
    console.log(`Andar Médio Alcançado: ${avgFloor}`);
    console.log(`Máximo Absoluto Alcançado: Floor ${maxFloor}\n`);

    console.log(`=== DESEMPENHO POR HERÓI ===`);
    for (const h of HERO_LIST) {
        const heroRuns = results.filter(r => r.heroId === h.id);
        const heroTotalFloors = heroRuns.reduce((acc, r) => acc + r.highestFloor, 0);
        const heroAvgFloor = (heroTotalFloors / heroRuns.length).toFixed(1);
        const heroMax = Math.max(...heroRuns.map(r => r.highestFloor));
        const heroItems = heroRuns.reduce((acc, r) => acc + r.itemsGathered, 0) / heroRuns.length;

        console.log(`${h.name}:`);
        console.log(`  - Média: Andar ${heroAvgFloor}`);
        console.log(`  - Recorde: Andar ${heroMax}`);
        console.log(`  - Itens Médios Acumulados: ${heroItems.toFixed(1)}`);
    }

    // Top 3 Inimigos Assassinos
    console.log(`\n=== MAIORES AMEAÇAS (Causa de Morte) ===`);
    const deathCounts: Record<string, number> = {};
    results.forEach(r => {
        deathCounts[r.killedBy] = (deathCounts[r.killedBy] || 0) + 1;
    });

    const sortedThreats = Object.entries(deathCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
    sortedThreats.forEach(([enemyKey, count], idx) => {
        const percentage = ((count / TOTAL_RUNS) * 100).toFixed(1);
        console.log(`${idx + 1}. ${ENEMIES[enemyKey].name} (${percentage}%)`);
    });
}

main();
