import { Dispatch, SetStateAction, useCallback, ChangeEventHandler } from 'react';

export const useChangeEventHandler = (setter: (data: string) => void) =>
    useCallback<ChangeEventHandler<HTMLElement & { value: string }>>(
        event => {
            setter(event.target.value);
        },
        [setter]
    );
