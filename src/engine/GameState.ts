import { Entity, EventType, IGameState } from './types';

export class GameState implements IGameState {
  player: Entity;
  enemy: Entity;
  combatLog: string[] = [];
  isGameOver: boolean = false;
  private triggerDepth: number = 0;
  private readonly MAX_RECURSION_DEPTH: number = 10;

  constructor(player: Entity, enemy: Entity) {
    // Deep copy to avoid mutating initial templates
    this.player = {
      ...player,
      hp: player.hp,
      maxHp: player.maxHp,
      damage: player.damage,
      critChance: player.critChance,
      perks: [...player.perks],
      equipment: player.equipment ? [...player.equipment] : []
    };
    this.enemy = {
      ...enemy,
      hp: enemy.hp,
      maxHp: enemy.maxHp,
      damage: enemy.damage,
      critChance: enemy.critChance,
      perks: [...enemy.perks],
      equipment: enemy.equipment ? [...enemy.equipment] : []
    };

  }

  log(msg: string) {
    this.combatLog.push(msg);
    // Keep log size manageable
    if (this.combatLog.length > 50) {
      this.combatLog.shift();
    }
  }

  getOpponent(entity: Entity): Entity {
    return entity.id === this.player.id ? this.enemy : this.player;
  }

  private triggerEvent(eventType: EventType, owner: Entity, payload: any) {
    if (this.triggerDepth >= this.MAX_RECURSION_DEPTH) {
      this.log(`AVISO: Limite de recursão atingido para ${owner.name}!`);
      return;
    }

    const perks = owner.perks.filter(p => p.trigger === eventType);
    if (perks.length === 0) return;

    this.triggerDepth++;
    try {
      for (const perk of perks) {
        if (perk.action) {
          perk.action(this, owner, payload);
        }
      }
    } finally {
      this.triggerDepth--;
    }
  }

  dealDamage(attacker: Entity, target: Entity, amount: number, isCrit: boolean = false, sourceType: 'attack' | 'effect' = 'attack') {
    if (target.hp <= 0 || attacker.hp <= 0) return;

    target.hp -= amount;
    this.log(`${attacker.name} causou ${amount} de dano a ${target.name} ${sourceType === 'effect' ? '(Efeito)' : ''}${isCrit ? ' (CRÍTICO!)' : ''}.`);

    if (sourceType === 'attack') {
      this.triggerEvent('onHit', attacker, { target, amount, isCrit });
    }
    this.triggerEvent('onDamageTaken', target, { source: attacker, amount, isCrit, sourceType });

    if (isCrit && sourceType === 'attack') {
      this.triggerEvent('onCriticalHit', attacker, { target, amount });
    }

    if (target.hp <= 0) {
      target.hp = 0;
      this.log(`${target.name} foi derrotado!`);
      this.triggerEvent('onKill', attacker, { victim: target });
      this.isGameOver = true;
    }
  }

  heal(target: Entity, amount: number) {
    if (target.hp <= 0) return;

    const actualHeal = Math.min(target.maxHp - target.hp, amount);
    if (actualHeal > 0) {
      target.hp += actualHeal;
      this.log(`${target.name} curou ${actualHeal} HP.`);
      this.triggerEvent('onHeal', target, { amount: actualHeal });
    }
  }

  attack(attacker: Entity, target: Entity) {
    if (this.isGameOver) return;
    const isCrit = Math.random() < attacker.critChance;
    const damage = isCrit ? attacker.damage * 2 : attacker.damage;
    this.dealDamage(attacker, target, damage, isCrit, 'attack');
  }

  tick() {
    if (this.isGameOver || this.player.hp <= 0 || this.enemy.hp <= 0) {
      if (!this.isGameOver) this.isGameOver = true;
      return;
    }

    // Player attacks enemy
    this.attack(this.player, this.enemy);

    // Enemy attacks player (if still alive)
    if (this.enemy.hp > 0 && this.player.hp > 0 && !this.isGameOver) {
      this.attack(this.enemy, this.player);
    }
  }
}
