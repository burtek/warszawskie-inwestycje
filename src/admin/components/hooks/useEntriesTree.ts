import { useMemo } from 'react';
import { RootState, StateEntries, useAppSelector } from '../../state';
import { Dictionary } from '@reduxjs/toolkit';
import mapValues from 'lodash/mapValues';
import reduce from 'lodash/reduce';

export type MappedEntry = { id: string; title: string; subEntries: MappedEntry[] };
export type MappedOrphanEntry = { id: string; title: string };
export function makeTree(
    entries: StateEntries,
    mainEntries: RootState['mainEntries']
): [MappedEntry[], MappedOrphanEntry[]] {
    const used = mapValues(entries, () => false);

    const mapIdToEntry = (id: string): MappedEntry => {
        used[id] = true;
        return {
            id,
            title: entries[id]?.title ?? 'BROKEN ENTRY',
            subEntries: entries[id]?.subEntries.map(mapIdToEntry) ?? []
        };
    };

    return [
        mainEntries.map(mapIdToEntry),
        reduce<Dictionary<boolean>, string[]>(
            used,
            (acc, isUsed, id) => (isUsed ? acc : [...acc, id]),
            []
        ).map<MappedOrphanEntry>(id => ({
            id,
            title: entries[id].title
        }))
    ];
}

export const useEntriesTree = () => {
    const entries = useAppSelector(state => state.entries);
    const mainEntries = useAppSelector(state => state.mainEntries);

    return useMemo(() => {
        const [treeEntries, orphanEntries] = makeTree(entries, mainEntries);
        return { treeEntries, orphanEntries };
    }, [entries, mainEntries]);
};
