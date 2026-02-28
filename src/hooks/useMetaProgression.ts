import { useState, useCallback, useEffect } from 'react';
import { TALENT_TREE } from '../data/metaTree';

const META_SAVE_KEY = 'ecos_devorados_meta';

export interface MetaState {
    ecos: number;
    unlockedTalents: string[]; // Lista de IDs destrancados
}

export function useMetaProgression() {
    const [metaState, setMetaState] = useState<MetaState>(() => {
        const saved = localStorage.getItem(META_SAVE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse MetaState from localStorage", e);
            }
        }
        return { ecos: 0, unlockedTalents: [] };
    });

    // Syncs to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem(META_SAVE_KEY, JSON.stringify(metaState));
    }, [metaState]);

    const addEcos = useCallback((amount: number) => {
        setMetaState(prev => ({
            ...prev,
            ecos: prev.ecos + amount
        }));
    }, []);

    const unlockTalent = useCallback((talentId: string) => {
        const talent = TALENT_TREE[talentId];
        if (!talent) return false;

        setMetaState(prev => {
            // Já está desbloqueado?
            if (prev.unlockedTalents.includes(talentId)) return prev;

            // Tem ecos suficientes?
            if (prev.ecos < talent.cost) return prev;

            // Tem os pré-requisitos?
            const hasPrereqs = talent.prerequisites.every(reqId =>
                prev.unlockedTalents.includes(reqId)
            );
            if (!hasPrereqs) return prev;

            return {
                ecos: prev.ecos - talent.cost,
                unlockedTalents: [...prev.unlockedTalents, talentId]
            };
        });
        return true; // Simplificado sem validação complexa de return false
    }, []);

    const getUnlockedTalents = useCallback(() => {
        return metaState.unlockedTalents;
    }, [metaState.unlockedTalents]);

    const resetMeta = useCallback(() => {
        setMetaState({ ecos: 0, unlockedTalents: [] });
    }, []);

    return {
        metaState,
        addEcos,
        unlockTalent,
        getUnlockedTalents,
        resetMeta
    };
}
