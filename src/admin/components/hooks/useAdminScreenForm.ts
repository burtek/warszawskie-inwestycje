import { nanoid } from '@reduxjs/toolkit';
import { useCallback, useState } from 'react';
import { EntryWithLinksWithIds, LinkWithId } from '../../state';
import { useButtonCallback } from './useButtonCallback';
import { useChangeEventHandler } from './useChangeEventHandler';
import { useDragDropEnd } from './useDragDrop';

export const useAdminScreenForm = () => {
    const [title, setTitle] = useState('');
    const [markdownContent, onChangeMarkdownContent] = useState<string | undefined>('');
    const [links, setLinks] = useState<LinkWithId[]>([]);
    const [subEntries, setSubEntries] = useState<string[]>([]);
    const [parent, setParent] = useState<string | null>(null);

    const setFormValues = useCallback((entry: EntryWithLinksWithIds | null) => {
        setTitle(entry?.title ?? '');
        onChangeMarkdownContent(entry?.markdownContent ?? '');
        setLinks(entry?.links ?? []);
        setSubEntries(entry?.subEntries ?? []);
        setParent(null);
    }, []);

    const onChangeTitle = useChangeEventHandler(setTitle);
    const onChangeParent = useChangeEventHandler(setParent);

    const onAddLink = useButtonCallback(() => setLinks(links => [...links, { id: nanoid(), label: '', url: '' }]), []);
    const onUpdateLink = useCallback(
        (link: LinkWithId) =>
            setLinks(links => Object.assign([...links], { [links.findIndex(l => l.id === link.id)]: link })),
        []
    );
    const onRemoveLink = useCallback(
        (id: LinkWithId['id']) => setLinks(links => links.filter(link => link.id !== id)),
        []
    );
    const onLinkDragEnd = useDragDropEnd(setLinks);

    const onSubentryDragEnd = useDragDropEnd(setSubEntries);

    return {
        title: [title, { onChangeTitle }] as const,
        markdownContent: [markdownContent, { onChangeMarkdownContent }] as const,
        links: [links, { onAddLink, onUpdateLink, onRemoveLink, onLinkDragEnd }] as const,
        subEntries: [subEntries, { onSubentryDragEnd }] as const,
        parent: [parent, { onChangeParent }] as const,
        setFormValues
    };
};
