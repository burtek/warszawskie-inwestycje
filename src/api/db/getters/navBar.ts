import type { Binary, Db } from 'mongodb';
import { uuidToString } from '../utils';
import { getMain } from './_collections';
import { NavbarEntry } from './_types';

export async function getNavbar(db: Db) {
    const raw = await getRawNavbarEntry(db);
    return raw.map<NavbarEntry>(({ _id, ...rest }) => ({ id: uuidToString(_id), ...rest }));
}

function getRawNavbarEntry(db: Db) {
    return getMain(db)
        .aggregate<{
            _id: Binary;
            title: string;
        }>([
            { $match: { type: 'main' } },
            { $unwind: { path: '$data' } },
            {
                $lookup: {
                    from: 'entries',
                    localField: 'data',
                    foreignField: '_id',
                    as: 'data'
                }
            },
            { $unwind: { path: '$data' } },
            {
                $project: {
                    _id: '$data._id',
                    title: '$data.title'
                }
            }
        ])
        .toArray();
}
