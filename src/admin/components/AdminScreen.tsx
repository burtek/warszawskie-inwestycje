import { useCallback, useMemo } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { saveEntry, useAppDispatch } from '../state';
import { Button, FormSection, MDEditor } from './adminScreen.components';
import { AdminScreenDraggableLink } from './AdminScreenDraggableLink';
import { AdminScreenDraggableSubentry } from './AdminScreenDraggableSubentry';
import { EntryTree } from './EntryTree';
import {
    MappedOrphanEntry,
    useAdminScreenData,
    useAdminScreenForm,
    useButtonCallback,
    useRenderDroppableContent,
    useWrappingKeyPress
} from './hooks';

function mapParentOption(entry: MappedOrphanEntry) {
    return (
        <option key={entry.id} value={entry.id}>
            {entry.title}
        </option>
    );
}

export function AdminScreen() {
    const dispatch = useAppDispatch();

    const {
        title: [title, { onChangeTitle }],
        markdownContent: [markdownContent, { onChangeMarkdownContent }],
        links: [links, { onAddLink, onUpdateLink, onRemoveLink, onLinkDragEnd }],
        subEntries: [subEntries, { onSubentryDragEnd }],
        setFormValues
    } = useAdminScreenForm();
    const {
        entries,
        currentEntry,
        entryParentId,
        setCurrentId,
        parentSelectOptions: parentSelectOptionsArray
    } = useAdminScreenData(setFormValues);

    const onSubmit = useCallback(() => {
        if (currentEntry) {
            dispatch(
                saveEntry({
                    ...currentEntry,
                    title,
                    markdownContent: markdownContent ?? '',
                    links,
                    subEntries
                })
            );
        }
    }, [currentEntry, dispatch, links, markdownContent, subEntries, title]);
    const onReset = useButtonCallback(() => setFormValues(currentEntry), [currentEntry, setFormValues]);
    const onCancel = useButtonCallback(() => setCurrentId(null), [setCurrentId]);

    const onKeyPress = useWrappingKeyPress();

    const renderLinksDroppableContent = useRenderDroppableContent(
        links,
        (link, index) => (
            <AdminScreenDraggableLink
                key={link.id}
                link={link}
                onChange={onUpdateLink}
                onRemove={onRemoveLink}
                index={index}
            />
        ),
        [onRemoveLink, onUpdateLink]
    );

    const renderSubentriesDroppableContent = useRenderDroppableContent(
        subEntries,
        (id, index) => (
            <AdminScreenDraggableSubentry
                key={id}
                id={id}
                title={entries[id]?.title ?? 'WTF'}
                onNavigate={setCurrentId}
                index={index}
            />
        ),
        [entries, setCurrentId]
    );

    const parentSelectOptions = useMemo(
        () => parentSelectOptionsArray.map(mapParentOption),
        [parentSelectOptionsArray]
    );

    return (
        <div className="container">
            <div className="columns">
                <EntryTree className="column col-3" currentId={currentEntry?.id ?? null} setCurrentId={setCurrentId} />
                <div className="admin-column pb-2 column col-9">
                    {currentEntry && (
                        <>
                            <FormSection id="entry-id" label="ID">
                                <input
                                    className="form-input"
                                    type="text"
                                    id="entry-id"
                                    value={currentEntry.id}
                                    readOnly
                                />
                            </FormSection>
                            <div className="columns">
                                <FormSection id="entry-title" label="Tytuł" className="column col-6">
                                    <input
                                        className="form-input"
                                        type="text"
                                        id="entry-title"
                                        placeholder="Title"
                                        value={title}
                                        onChange={onChangeTitle}
                                    />
                                </FormSection>
                                <FormSection id="entry-parent" label="Nadsekcja" className="column col-6">
                                    <select
                                        className="form-select"
                                        id="entry-parent"
                                        placeholder="Nadsekcja"
                                        value={entryParentId}
                                        onChange={() => alert('Not implemented')}
                                        disabled={false}>
                                        {parentSelectOptions}
                                    </select>
                                </FormSection>
                            </div>
                            <FormSection id="entry-md-content" label="Treść">
                                <MDEditor
                                    textareaProps={{ id: 'entry-md-content' }}
                                    value={markdownContent}
                                    onChange={onChangeMarkdownContent}
                                    onKeyPress={onKeyPress}
                                />
                            </FormSection>
                            <FormSection id="entry-links" label="Linki">
                                <DragDropContext onDragEnd={onLinkDragEnd}>
                                    <Droppable droppableId="LINKS">{renderLinksDroppableContent}</Droppable>
                                </DragDropContext>
                                <div className="btn-group btn-group-block pt-2">
                                    <Button onClick={onAddLink} icon="plus" text="Dodaj link" />
                                </div>
                            </FormSection>
                            <FormSection id="entry-subentries" label="Podsekcje">
                                {subEntries.length > 0 ? (
                                    <DragDropContext onDragEnd={onSubentryDragEnd}>
                                        <Droppable droppableId="SUBENTRIES">
                                            {renderSubentriesDroppableContent}
                                        </Droppable>
                                    </DragDropContext>
                                ) : (
                                    <div>Brak podsekcji</div>
                                )}
                            </FormSection>
                            <div className="btn-group btn-group-block pt-2">
                                <Button icon="check" onClick={onSubmit} primary text="Zapisz" />
                                <Button icon="refresh" onClick={onReset} text="Przywróć wartości oryginalne" />
                                <Button icon="cross" onClick={onCancel} text="Anuluj" />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
AdminScreen.displayName = 'AdminScreen';
