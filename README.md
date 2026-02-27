# ⚔️ Ecos Devorados

> *"O Abismo não devora apenas carne. Ele devora memória, identidade, esperança."*

**Ecos Devorados** é um roguelike auto-battler em desenvolvimento. Você escolhe um herói, avança por andares repletos de inimigos e toma decisões em eventos narrativos que moldam seu destino — até que o Eco te consuma, ou você o consuma primeiro.

---

## 🎮 Sobre o Jogo

O jogo é dividido em turnos de exploração onde o jogador enfrenta escolhas estratégicas em cada andar:

- **⚔️ Batalha** — Confronte inimigos cada vez mais poderosos. O combate é automático, guiado pelos perks e equipamentos do seu herói.
- **✨ Eventos** — Encontros narrativos com múltiplas escolhas que podem curar, fortalecer ou prejudicar seu personagem.
- **🎯 Perks & Itens** — Um sistema de habilidades baseado em gatilhos (`onHit`, `onKill`, `onHeal`...) que interage com os equipamentos para criar builds únicas.

### Heróis Disponíveis (MVP 0.1)

| Herói | Estilo | Bônus Inicial |
| --- | --- | --- |
| **Errante** | Crítico / Agressivo | +5% Chance de Crítico |
| **Sobrevivente** | Tanque / Sustentação | +20 HP inicial |

---

## 🚀 Rodando Localmente

**Pré-requisito:** Node.js instalado.

```bash
# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse em: **<http://localhost:3001>**

---

## 🛠 Stack

- **React + TypeScript** — Interface e lógica de jogo
- **Vite** — Bundler e dev server
- **Tailwind CSS** — Estilização

---

## 📋 Estado do Projeto

> ⚠️ **MVP 0.1 em desenvolvimento** — O jogo está em fase inicial. Mecânicas, balanceamento e conteúdo estão sujeitos a mudanças frequentes.

**Implementado:**

- [x] Motor de combate com sistema de perks e eventos
- [x] Seleção de heróis com equipamentos iniciais
- [x] Progressão de inimigos por andares
- [x] Eventos narrativos com escolhas que afetam o herói
- [x] Seleção de caminho (Batalha ou Evento) entre andares

**Planejado:**

- [ ] Sistema de loot (escolher itens após batalhas)
- [ ] Mais heróis, inimigos e eventos
- [ ] Interface de mapa visual
- [ ] Árvore de perks progressiva
- [ ] Salvamento de progresso
