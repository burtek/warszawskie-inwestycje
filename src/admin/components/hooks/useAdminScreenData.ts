import find from 'lodash/find';
import { useCallback, useMemo, useState } from 'react';
import { EntryWithLinksWithIds, useAppSelector } from '../../state';
import { MappedEntry, MappedOrphanEntry, useEntriesTree } from './useEntriesTree';

export const NULL_ENTRY_ID = '::null::';
export const MAIN_ENTRY_ID = '::mainEntry::';

const pad = (levels = 0) => Array.from({ length: levels }, () => '>___').join('');
const mapSelectOptions = (entry: MappedEntry, level = 0): MappedOrphanEntry[] => [
    { id: entry.id, title: `${pad(level)}${entry.title}` },
    ...entry.subEntries.flatMap(entry => mapSelectOptions(entry, level + 1))
];
const mapSelectOption = (entry: MappedEntry) => mapSelectOptions(entry);

const nullOption: MappedOrphanEntry = { id: NULL_ENTRY_ID, title: ':: Nieprzypisany (niewidoczny) ::' };
const mainEntryOption: MappedOrphanEntry = { id: MAIN_ENTRY_ID, title: ':: Strona Główna ::' };

export const useAdminScreenData = (setValues: (entry: EntryWithLinksWithIds | null) => void) => {
    const entries = useAppSelector(state => state.entries);
    const mainEntries = useAppSelector(state => state.mainEntries);

    const [currentEntry, setCurrentEntry] = useState<EntryWithLinksWithIds | null>(null);

    const setCurrentId = useCallback(
        (id: string | null) => {
            const entry = id === null ? null : entries[id] ?? null;
            setCurrentEntry(entry);
            setValues(entry);
        },
        [entries, setValues]
    );

    const { orphanEntries, treeEntries } = useEntriesTree();

    const entryParentId = useMemo(
        () =>
            !currentEntry
                ? NULL_ENTRY_ID
                : mainEntries.includes(currentEntry.id)
                ? MAIN_ENTRY_ID
                : find(entries, entry => entry.subEntries.includes(currentEntry.id))?.id ?? NULL_ENTRY_ID,
        [currentEntry, entries, mainEntries]
    );

    const parentSelectOptions = useMemo(
        () => [
            ...(entryParentId === NULL_ENTRY_ID ? [nullOption] : []),
            mainEntryOption,
            ...treeEntries.flatMap(mapSelectOption),
            ...orphanEntries
        ],
        [entryParentId, orphanEntries, treeEntries]
    );

    return { entries, currentEntry, entryParentId, setCurrentId, parentSelectOptions };
};
