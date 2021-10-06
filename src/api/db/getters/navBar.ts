import type { Binary, Db } from 'mongodb';
import { uuidToString } from '../utils';
import { NavbarEntry } from './_types';

interface RawNavbarEntry {
    _id: Binary;
    title: string;
}

export async function getNavbar(db: Db) {
    return (
        await db
            .collection('main')
            .aggregate<RawNavbarEntry>([
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
            .toArray()
    ).map<NavbarEntry>(({ _id, ...rest }) => ({ id: uuidToString(_id), ...rest }));
}
