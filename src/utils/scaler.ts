import { Entity } from '../engine/types';

/**
 * Escalonamento Exponencial de Inimigos
 * Aplica multiplicadores matemáticos baseados no andar atual (floor).
 */
export function scaleEnemyStats(enemyTemplate: Entity, floor: number): Entity {
    let hpMultiplier = 1;
    let dmgMultiplier = 1;

    if (floor <= 7) {
        // Do andar 1 ao 7: HP cresce 15%, Dano 8% por andar
        hpMultiplier = Math.pow(1.15, floor - 1);
        dmgMultiplier = Math.pow(1.08, floor - 1);
    } else {
        // Do andar 8 em diante: Curva pós-chefe intensa (HP 30%, Dano 15%) em cima do andar 7
        const baseHp7 = Math.pow(1.15, 6);
        const baseDmg7 = Math.pow(1.08, 6);

        hpMultiplier = baseHp7 * Math.pow(1.30, floor - 7);
        dmgMultiplier = baseDmg7 * Math.pow(1.15, floor - 7);
    }

    return {
        ...enemyTemplate,
        hp: Math.floor(enemyTemplate.hp * hpMultiplier),
        maxHp: Math.floor(enemyTemplate.maxHp * hpMultiplier),
        damage: Math.floor(enemyTemplate.damage * dmgMultiplier)
    };
}
