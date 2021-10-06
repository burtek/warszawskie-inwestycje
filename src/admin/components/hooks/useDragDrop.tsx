import { DependencyList, useCallback, useDebugValue } from 'react';
import { DroppableProvided, DropResult } from 'react-beautiful-dnd';

export const useDragDropEnd = <T extends unknown>(setData: (updater: (oldData: T[]) => T[]) => void) =>
    useCallback(
        (result: DropResult) => {
            if (!result.destination) {
                return;
            }
            const [destinationIndex, sourceIndex] = [result.destination.index, result.source.index];

            setData(oldArray => {
                const newArray = [...oldArray];
                const [removed] = newArray.splice(sourceIndex, 1);
                newArray.splice(destinationIndex, 0, removed);
                return newArray;
            });
        },
        [setData]
    );

export const useRenderDroppableContent = <T extends unknown>(
    data: T[],
    mapFn: (entry: T, index: number) => JSX.Element,
    deps: DependencyList
) => {
    useDebugValue(`items: ${data.length}`);
    return useCallback(
        (provided: DroppableProvided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
                {data.map(mapFn)}
                {provided.placeholder}
            </div>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [data, ...deps]
    );
};
