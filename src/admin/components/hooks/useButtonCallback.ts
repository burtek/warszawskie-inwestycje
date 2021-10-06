import { DependencyList, useCallback, MouseEventHandler } from 'react';

export const useButtonCallback = (fn: () => void, deps: DependencyList) =>
    useCallback<MouseEventHandler>(
        event => {
            event.preventDefault();
            fn();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        deps
    );
