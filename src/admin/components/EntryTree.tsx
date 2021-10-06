import { FC, MouseEventHandler, useCallback, useEffect, useRef } from 'react';
import { addNewEntry, useAppDispatch } from '../state';
import { MappedEntry, MappedOrphanEntry, useEntriesTree } from './hooks/useEntriesTree';

const Entry: FC<{
    entry: MappedEntry | MappedOrphanEntry;
    currentId: string | null;
    setCurrentId: (id: string) => void;
}> = ({ currentId, entry, setCurrentId }) => {
    const isCurrent = entry.id === currentId;
    const ref = useRef<HTMLLIElement>(null);
    const onClick = useCallback<MouseEventHandler>(
        event => {
            event.preventDefault();
            setCurrentId(entry.id);
        },
        [entry.id, setCurrentId]
    );

    useEffect(() => {
        if (isCurrent) {
            ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [isCurrent]);

    return (
        <li key={entry.id} ref={ref}>
            <a className={isCurrent ? 'text-bold' : ''} href="#" onClick={onClick}>
                {entry.title}
            </a>
            {'subEntries' in entry && entry.subEntries.length > 0 && (
                <ul className="ml-2">
                    {entry.subEntries.map(entry => (
                        <Entry key={entry.id} entry={entry} currentId={currentId} setCurrentId={setCurrentId} />
                    ))}
                </ul>
            )}
        </li>
    );
};

export function EntryTree({ className, currentId, setCurrentId }: Props) {
    const dispatch = useAppDispatch();

    const { treeEntries, orphanEntries } = useEntriesTree();
    const onAddNew = useCallback(() => dispatch(addNewEntry()), [dispatch]);

    return (
        <div className={`${className} admin-sidebar`}>
            <div className="admin-sidebar-list">
                {orphanEntries.length > 0 && (
                    <>
                        <ul className="orphaned-entries">
                            {orphanEntries.map(entry => (
                                <Entry key={entry.id} entry={entry} currentId={currentId} setCurrentId={setCurrentId} />
                            ))}
                        </ul>
                        <hr />
                    </>
                )}
                <ul>
                    {treeEntries.map(entry => (
                        <Entry key={entry.id} entry={entry} currentId={currentId} setCurrentId={setCurrentId} />
                    ))}
                </ul>
            </div>
            <div className="admin-sidebar-button btn-group btn-group-block">
                <button className="btn btn-primary" onClick={onAddNew}>
                    Dodaj wpis
                </button>
            </div>
        </div>
    );
}
EntryTree.displayName = 'EntryTree';

interface Props {
    className: string;
    currentId: string | null;
    setCurrentId: (id: string) => void;
}
