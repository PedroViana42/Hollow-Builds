import { Perk } from './types';

export const laminaSanguessuga: Perk = {
  id: 'p_lamina_sanguessuga',
  name: 'Lâmina Sanguessuga',
  description: 'Cura 1 HP ao acertar um ataque.',
  trigger: 'onHit',
  action: (state, owner, _payload) => {
    state.heal(owner, 1);
  }
};

export const sangueFervente: Perk = {
  id: 'p_sangue_fervente',
  name: 'Sangue Fervente',
  description: 'Causa 2 de dano ao inimigo sempre que você se cura.',
  trigger: 'onHeal',
  action: (state, owner, _payload) => {
    const opponent = state.getOpponent(owner);
    state.dealDamage(owner, opponent, 2, false, 'effect');
  }
};
