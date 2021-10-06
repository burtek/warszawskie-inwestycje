import { ChangeEventHandler, FC, useCallback } from 'react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { LinkWithId } from '../state';
import { useButtonCallback } from './hooks/useButtonCallback';

const useLinkChangeHandlers = (
    link: LinkWithId,
    setter: (link: LinkWithId) => void
): [ChangeEventHandler<HTMLInputElement>, ChangeEventHandler<HTMLInputElement>] => [
    useCallback<ChangeEventHandler<HTMLInputElement>>(
        event =>
            setter({
                ...link,
                label: event.target.value
            }),
        [setter, link]
    ),
    useCallback<ChangeEventHandler<HTMLInputElement>>(
        event =>
            setter({
                ...link,
                url: event.target.value
            }),
        [setter, link]
    )
];

export const AdminScreenDraggableLink: FC<{
    link: LinkWithId;
    onChange: (link: LinkWithId) => void;
    onRemove: (id: LinkWithId['id']) => void;
    index: number;
}> = ({ link, link: { id, label, url }, onChange, onRemove, index }) => {
    const [onLabelChange, onUrlChange] = useLinkChangeHandlers(link, onChange);
    const onRemoveClicked = useButtonCallback(() => onRemove(id), [id, onRemove]);
    const onOpenLink = useButtonCallback(() => window.open(url, '_blank'), [url]);

    const renderDraggableContent = useCallback(
        (provided: DraggableProvided) => (
            <div ref={provided.innerRef} {...provided.draggableProps} className="columns">
                <div {...provided.dragHandleProps}>
                    <i className="icon icon-more-vert ml-2" />
                </div>
                <div className="column col-3">
                    <input className="form-input" value={label} onChange={onLabelChange} />
                </div>
                <div className="column col-8">
                    <input className="form-input url-input" value={url} onChange={onUrlChange} />
                </div>
                <div>
                    <button className="btn btn-action" onClick={onOpenLink}>
                        <i className="icon icon-share" />
                    </button>
                    <button className="btn btn-action" onClick={onRemoveClicked}>
                        <i className="icon icon-delete" />
                    </button>
                </div>
            </div>
        ),
        [label, onLabelChange, onOpenLink, onRemoveClicked, onUrlChange, url]
    );

    return (
        <Draggable draggableId={id} index={index}>
            {renderDraggableContent}
        </Draggable>
    );
};
AdminScreenDraggableLink.displayName = 'AdminScreenDraggableLink';
