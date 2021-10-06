import type { Db } from 'mongodb';
import { uuidToString } from '../utils';
import { ChangelogItem, Entry, MainEntryItem, mapEntries } from './_types';

export async function getAdminData(db: Db) {
    const [{ changelog, mainEntries }] = await db
        .collection('main')
        .aggregate<{ changelog: ChangelogItem[]; mainEntries: MainEntryItem[] }>([
            {
                $facet: {
                    changelog: [
                        { $match: { type: 'changelog' } },
                        { $unwind: { path: '$data' } },
                        {
                            $project: {
                                _id: 0,
                                description: '$data.description',
                                date: { $toString: '$data.date' }
                            }
                        }
                    ],
                    mainEntries: [
                        { $match: { type: 'main' } },
                        { $unwind: { path: '$data' } },
                        {
                            $project: {
                                _id: 0,
                                id: '$data'
                            }
                        }
                    ]
                }
            }
        ])
        .toArray();

    const entries = mapEntries(await db.collection<Entry>('entries').find().toArray());

    return {
        changelog,
        entries,
        mainEntries: mainEntries.map(({ id }) => uuidToString(id))
    };
}
