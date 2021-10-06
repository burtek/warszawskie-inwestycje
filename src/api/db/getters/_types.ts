import _ from 'lodash';
import _fp from 'lodash/fp';
import { uuidToString } from '../utils';
import type { Binary } from 'mongodb';

export interface ChangelogItem {
    date: string;
    description: string;
}
export interface MainEntryItem {
    id: Binary;
}

export interface Link {
    label: string;
    url: string;
}

export interface NavbarEntry {
    id: string;
    title: string;
}
export interface BaseEntry {
    _id: Binary;
    title: string;
    markdownContent: string;
    links: Link[];
    subEntries: Binary[];
}
export interface Entry extends BaseEntry {
    _created: Date;
    _modified: Date;
}
export type MappedEntry<E extends BaseEntry = BaseEntry> = { id: string } & {
    [K in keyof Omit<E, '_id'>]: E[K] extends Binary[] ? string[] : E[K] extends Date ? string : E[K];
};
export type MappedEntryTree<E extends BaseEntry = BaseEntry> = Omit<MappedEntry<E>, 'subEntries'> & {
    subEntries: MappedEntryTree<E>[];
};
export interface HomepageEntry {
    id: string;
    title: string;
    markdownContent: string;
    lastUpdate: string;
}

export const mapEntries = _.flow(
    _fp.map<Entry, MappedEntry<Entry>>(({ _id, subEntries, _created, _modified, ...entry }) => ({
        id: uuidToString(_id),
        subEntries: subEntries.map(uuidToString),
        _created: _created.toISOString(),
        _modified: _modified.toISOString(),
        ...entry
    })),
    _fp.keyBy(entry => entry.id)
);
