import { FC, useCallback } from 'react';
import { Draggable, DraggableProvided } from 'react-beautiful-dnd';
import { useButtonCallback } from './hooks/useButtonCallback';

export const AdminScreenDraggableSubentry: FC<{
    id: string;
    title: string;
    onNavigate: (id: string) => void;
    index: number;
}> = ({ id, title, onNavigate, index }) => {
    const onNavigateClick = useButtonCallback(() => onNavigate(id), [id, onNavigate]);

    const renderDraggableContent = useCallback(
        (provided: DraggableProvided) => (
            <div ref={provided.innerRef} {...provided.draggableProps} className="columns">
                <div {...provided.dragHandleProps}>
                    <i className="icon icon-more-vert ml-2" />
                </div>
                <div className="column col-11">
                    <span>{title}</span>
                    <span className="pl-1 text-italic text-gray">({id})</span>
                </div>
                <div>
                    <button className="btn btn-action" onClick={onNavigateClick}>
                        <i className="icon icon-edit" />
                    </button>
                </div>
            </div>
        ),
        [id, onNavigateClick, title]
    );

    return (
        <Draggable draggableId={id} index={index}>
            {renderDraggableContent}
        </Draggable>
    );
};
AdminScreenDraggableSubentry.displayName = 'AdminScreenDraggableSubentry';
