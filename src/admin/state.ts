import { AnyAction, configureStore, createAsyncThunk, createSlice, nanoid } from '@reduxjs/toolkit';
import type { Dictionary } from 'lodash';
import _pick from 'lodash/fp/pick';
import mapValues from 'lodash/mapValues';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { Entry, Link, MappedEntry } from '../api/db/getters/_types';
import { Api, ADMIN_DATA_GET_RETURN, ADMIN_DATA_POST_RETURN } from './api';

export enum SESSION_STATE {
    UNKNOWN,
    LOGGED_OUT,
    LOGGED_IN,
    LOGGING_IN,
    ERROR
}

async function handleError<R>(
    result: Response,
    rejectWithValue: (value: { state: SESSION_STATE; reason: string }) => R
) {
    const json = await result.json();

    switch (result.status) {
        case 401:
        case 403:
            toast.error((json as { error: string }).error);
            return rejectWithValue({
                state: SESSION_STATE.LOGGED_OUT,
                reason: (json as { error: string }).error
            });
        case 400:
        case 500:
            toast.error((json as { error: string }).error);
            return rejectWithValue({
                state: SESSION_STATE.ERROR,
                reason: (json as { error: string }).error
            });
        default:
            throw await result.json();
    }
}

export const getData = createAsyncThunk<
    ADMIN_DATA_GET_RETURN,
    void,
    { rejectValue: { state: SESSION_STATE; reason: string } }
>('getData', async (_arg, { rejectWithValue }) => {
    const getResult = await Api.getData();

    switch (getResult.status) {
        case 200:
            return getResult.json();
        default:
            return handleError(getResult, rejectWithValue);
    }
});

export const logIn = createAsyncThunk<
    void,
    { username: string; password: string },
    { rejectValue: { state: SESSION_STATE; reason: string } }
>('userLogin', async ({ username, password }, { dispatch, rejectWithValue, getState }) => {
    const logInResult = await Api.logIn(username, password);

    switch (logInResult.status) {
        case 200:
            toast.success('Zalogowano!');
            if (!(getState() as RootState).hasData) {
                dispatch(getData());
            }
            return;
        default:
            return handleError(logInResult, rejectWithValue);
    }
});

export const saveEntry = createAsyncThunk<
    ADMIN_DATA_POST_RETURN,
    { entry: EntryWithLinksWithIds; parent: string | null },
    { rejectValue: { state: SESSION_STATE; reason: string } }
>('saveEntry', async ({ entry, parent }, { rejectWithValue }) => {
    const saveResult = await Api.saveEntry(
        {
            id: entry.id,
            title: entry.title,
            markdownContent: entry.markdownContent,
            links: entry.links.map<Link>(_pick(['label', 'url'])),
            subEntries: entry.subEntries
        },
        parent
    );

    switch (saveResult.status) {
        case 200:
            toast.success('Zapisano!');
            return saveResult.json();
        default:
            return handleError(saveResult, rejectWithValue);
    }
});

type Changelog = ADMIN_DATA_GET_RETURN['changelog'];
type MainEntries = ADMIN_DATA_GET_RETURN['mainEntries'];
export interface LinkWithId extends Link {
    id: string;
}
export type EntryWithLinksWithIds = {
    [K in keyof MappedEntry<Entry>]: K extends 'links' ? LinkWithId[] : MappedEntry<Entry>[K];
};
export type StateEntries = Dictionary<EntryWithLinksWithIds>;

const rejectedActions = [logIn.rejected, getData.rejected, saveEntry.rejected] as const;
function isMyRejectedAction(action: AnyAction): action is ReturnType<typeof rejectedActions[number]> {
    return rejectedActions.map(action => action.type).includes(action.type);
}

const updateEntriesActions = [saveEntry.fulfilled] as const;
function isUpdateEntriesAction(action: AnyAction): action is ReturnType<typeof updateEntriesActions[number]> {
    return updateEntriesActions.map(action => action.type).includes(action.type);
}

const slice = createSlice({
    name: 'main',
    initialState: {
        hasData: false,
        sessionState: SESSION_STATE.UNKNOWN,
        changelog: [] as Changelog,
        mainEntries: [] as MainEntries,
        entries: {} as StateEntries,
        logInScreenMessage: ''
    },
    reducers: {
        addNewEntry(state) {
            const uuid = uuidv4();
            state.entries[uuid] = {
                id: uuid,
                title: uuid,
                markdownContent: '',
                links: [],
                subEntries: [],
                _created: new Date().toISOString(),
                _modified: new Date().toISOString()
            };
        }
    },
    extraReducers: builder =>
        builder
            .addCase(logIn.pending, state => {
                state.sessionState = SESSION_STATE.LOGGING_IN;
                state.logInScreenMessage = '';
            })
            .addCase(logIn.fulfilled, state => {
                state.sessionState = SESSION_STATE.LOGGED_IN;
                state.logInScreenMessage = '';
            })
            .addCase(getData.fulfilled, (state, action) => {
                state.sessionState = SESSION_STATE.LOGGED_IN;
                state.logInScreenMessage = '';

                state.hasData = true;
                state.changelog = action.payload.changelog;
                state.mainEntries = action.payload.mainEntries;
                state.entries = mapValues(action.payload.entries, entry => ({
                    ...entry,
                    links: entry.links.map(link => ({
                        id: nanoid(),
                        ...link
                    }))
                }));
            })
            .addMatcher(isUpdateEntriesAction, (state, action) => {
                const { entries, mainEntries } = action.payload;

                state.entries = {
                    ...state.entries,
                    ...mapValues(entries, entry => ({
                        ...entry,
                        links: entry.links.map(link => ({
                            id: nanoid(),
                            ...link
                        }))
                    }))
                };
                if (mainEntries) {
                    state.mainEntries = mainEntries;
                }
            })
            .addMatcher(isMyRejectedAction, (state, action) => {
                state.sessionState = action.payload?.state || SESSION_STATE.ERROR;

                const message = action.payload?.reason ?? action.error.message ?? 'Unknown error';
                state.logInScreenMessage = typeof message === 'string' ? message : JSON.stringify(message);
            })
});

export const { addNewEntry } = slice.actions;

export const adminStore = configureStore({
    reducer: slice.reducer
});

export type RootState = ReturnType<typeof adminStore.getState>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppDispatch = typeof adminStore.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
