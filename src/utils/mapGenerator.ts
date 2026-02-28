import { MapNode, MapNodeType } from '../engine/types';

/**
 * Generates a simple directed acyclic graph (DAG) representing the floor map.
 * The map consists of 'rows' (depth). Start at row 0, end at maxRows.
 */
export function generateFloorMap(floor: number, maxRows: number = 5): MapNode[] {
    const nodes: MapNode[] = [];
    let nextId = 1;
    const nodesPerRow = 3; // Max width of the map

    // Níveis do andar
    const rows: MapNode[][] = Array.from({ length: maxRows }, () => []);

    // Row 0: Começo (Sempre geramos 2 a 3 opções de largada)
    const startNodesCount = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < startNodesCount; i++) {
        const node: MapNode = {
            id: `n_${nextId++}`,
            type: getRandomNodeType(0, maxRows),
            connectedNodes: [],
            row: 0
        };
        rows[0].push(node);
        nodes.push(node);
    }

    // Rows intermediárias
    for (let r = 1; r < maxRows; r++) {
        const isBossRow = r === maxRows - 1;
        const isRestRow = r === maxRows - 2; // Fogueira antes do boss

        // Determina quantos nós teremos nesta linha (funil no final)
        const countThisRow = isBossRow ? 1 : Math.floor(Math.random() * 2) + 2;

        for (let c = 0; c < countThisRow; c++) {
            let type: MapNodeType = getRandomNodeType(r, maxRows);

            if (isBossRow) type = 'elite';
            if (isRestRow) type = 'rest';

            const node: MapNode = {
                id: `n_${nextId++}`,
                type: type,
                connectedNodes: [],
                row: r
            };

            rows[r].push(node);
            nodes.push(node);
        }

        // Conecta a row anterior com a row atual
        // Garante que todo nó da row anterior tenha pelo menos 1 conexão para a frente
        rows[r - 1].forEach((prevNode, idx) => {
            // Tenta conectar direto se o index bater, ou a um aleatório
            const targetNode = rows[r][idx] || rows[r][Math.floor(Math.random() * rows[r].length)];
            if (!prevNode.connectedNodes.includes(targetNode.id)) {
                prevNode.connectedNodes.push(targetNode.id);
            }

            // 30% de chance de criar uma conexão extra cruzada (se houver mais de um nó na próxima row)
            if (rows[r].length > 1 && Math.random() > 0.7) {
                const extraTarget = rows[r][Math.floor(Math.random() * rows[r].length)];
                if (!prevNode.connectedNodes.includes(extraTarget.id)) {
                    prevNode.connectedNodes.push(extraTarget.id);
                }
            }
        });

        // Garante que todo nó da row ATUAL foi conectado por pelo menos alguém de trás
        // (para não existir um nó inalcançável flutuando)
        rows[r].forEach(currNode => {
            const isConnected = rows[r - 1].some(prev => prev.connectedNodes.includes(currNode.id));
            if (!isConnected) {
                const randomPrev = rows[r - 1][Math.floor(Math.random() * rows[r - 1].length)];
                randomPrev.connectedNodes.push(currNode.id);
            }
        });
    }

    return nodes;
}

function getRandomNodeType(row: number, maxRows: number): MapNodeType {
    const rand = Math.random();
    // Elites aparecem com mais frequencia do meio pro fim
    const eliteChance = row > 1 ? 0.25 : 0.05;

    if (rand < eliteChance) return 'elite';
    if (rand < eliteChance + 0.35) return 'event';
    return 'battle'; // Default
}
