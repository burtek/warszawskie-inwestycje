import { Dispatch, SetStateAction, useCallback, ChangeEventHandler } from 'react';

export const useChangeEventHandler = (setter: Dispatch<SetStateAction<string>>) =>
    useCallback<ChangeEventHandler<HTMLInputElement>>(
        event => {
            setter(event.target.value);
        },
        [setter]
    );
