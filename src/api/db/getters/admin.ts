import type { Db } from 'mongodb';
import { uuidToString } from '../utils';
import { getEntries, getMain } from './_collections';
import { ChangelogItem, MainEntryItem, mapEntries } from './_types';

function getDataFromMain(db: Db) {
    return getMain(db)
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
}

export async function getAdminData(db: Db) {
    const [[{ changelog, mainEntries }], entries] = await Promise.all([
        getDataFromMain(db),
        getEntries(db).find().toArray()
    ]);

    return {
        changelog,
        entries: mapEntries(entries),
        mainEntries: mainEntries.map(({ id }) => uuidToString(id))
    };
}
