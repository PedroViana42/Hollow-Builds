# ⚔️ Hollow Builds

> *"O Abismo não devora apenas carne. Ele devora memória, identidade, esperança."*

**Hollow Builds** é um roguelike auto-battler em desenvolvimento. Você escolhe um herói, avança por andares repletos de inimigos e toma decisões em eventos narrativos que moldam seu destino — até que o Eco te consuma, ou você o consuma primeiro.

---

## 🎮 Sobre o Jogo

O jogo é dividido em turnos de exploração onde o jogador enfrenta escolhas estratégicas em cada andar:

- **⚔️ Batalha** — Confronte inimigos cada vez mais poderosos. O combate é automático, guiado pelos perks e equipamentos do seu herói.
- **✨ Eventos** — Encontros narrativos com múltiplas escolhas que podem curar, fortalecer ou prejudicar seu personagem.
- **🎯 Perks & Itens** — Um sistema de habilidades baseado em gatilhos (`onHit`, `onKill`, `onHeal`...) que interage com os equipamentos para criar builds únicas.

### Heróis Disponíveis (MVP 0.1)

| Herói | Estilo | Bônus Inicial |
| --- | --- | --- |
| **O Errante** | Foco Crítico e Ágil | Dano fixo + Alta Chance Crítica |
| **O Sobrevivente** | Tanque e Sustentação | Cura ao bater / Equipado com armadura |
| **O Cultista** | Roubo de Vida Focado | Cura Massiva em cada Crítico |
| **O Flagelado** | Escudos e Retaliação | Reflete Dano / Diminui Dano Recebido |

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

> ✅ **MVP 0.1 Lançado!** — A base principal do motor core auto-battler procedural foi finalizada.

**Implementado:**

- [x] Motor de combate com matemática exponencial baseada em Fases
- [x] Seleção de 4 heróis com equipamentos iniciais assimétricos
- [x] Progressão infinita de inimigos por ciclos progressivos de andares
- [x] Geração Procedural de mapa em DAG (Directed Acyclic Graph)
- [x] UI Rica com Sprites em Letras, animações de combate avançadas e Histórico
- [x] Sistema RNG de Eventos Narrativos Condicionais com riscos
- [x] Sistema de Loot (Recompensas Aleatórias para compor Builds Pós-Batalha)
- [x] Meta-Progressão Permadeath (Ganhe "Ecos" ao morrer para comprar novos Talentos Base na Árvore Visual Global)
- [x] Salvamento em Cache Nativo (LocalStorage) reidratando instâncias Orientadas a Objeto do motor.

**Planejado para Atualização 0.2:**

- [ ] Novas interações entre itens consumíveis durante Eventos
- [ ] Chefe Secreto para quem alcançar a Rota Corrompida (TBD)
- [ ] Conquistas Locais
