import { NIL as NIL_UUID } from 'uuid';
import UUID from 'uuid-mongodb';
import * as yup from 'yup';
import { getAdminData } from '../../../api/db/getters';
import { getEntries, getMain, MainMain } from '../../../api/db/getters/_collections';
import { Entry, mapEntries, MappedEntry } from '../../../api/db/getters/_types';
import { uuidToString } from '../../../api/db/utils';
import { withAuthorizedSession } from '../../../api/lib/session';

const saveEntryLinkSchema = yup.object({
    label: yup.string().required('Link must have label'),
    url: yup.string().required('Link must have url')
});
const saveEntrySchema = yup.object({
    id: yup.string().uuid('Entry id must be UUID').required('Entry id must be provided'),
    title: yup.string().required('Entry title must be provided'),
    markdownContent: yup.string().required('Entry markdownContent must be provided'),
    links: yup.array(saveEntryLinkSchema).required('Entry links array must be provided'),
    subEntries: yup.array(yup.string().required()).required('Entry title must be provided')
});
const saveEntryParentSchema = yup.string().uuid().nullable().defined();

const reqBodySchema = yup.object({
    entry: saveEntrySchema,
    parent: saveEntryParentSchema
});

export type ADMIN_DATA_POST_ARG_ENTRY = yup.Asserts<typeof saveEntrySchema>;
export type ADMIN_DATA_POST_ARG_ENTRY_PARENT = yup.Asserts<typeof saveEntryParentSchema>;

export type ADMIN_DATA_GET_RETURN = ReturnType<typeof getAdminData> extends Promise<infer R> ? R : never;
export type ADMIN_DATA_POST_RETURN = {
    entries: Record<string, MappedEntry<Entry>>;
    mainEntries?: string[];
};
export type ADMIN_DATA_ERROR_RETURN = {
    error: string | yup.ValidationError;
};

export default withAuthorizedSession<ADMIN_DATA_GET_RETURN | ADMIN_DATA_POST_RETURN | ADMIN_DATA_ERROR_RETURN>(
    async (req, res, session, db) => {
        if (req.method === 'GET') {
            const data = await getAdminData(db);
            res.status(200).json(data);
        } else if (req.method === 'POST') {
            try {
                const reqBody = JSON.parse(req.body);

                const {
                    entry: { id, title, markdownContent, links, subEntries },
                    parent
                } = reqBodySchema.validateSync(reqBody);

                const entryId = UUID.from(id);

                let updateResult: {
                    updateOk: boolean;
                    mainEntries?: string[];
                    entries: Entry[];
                } = {
                    updateOk: true,
                    mainEntries: [],
                    entries: []
                };

                // TODO: move to db
                const { ok: updateOk, value: updatedEntry } = await getEntries(db).findOneAndUpdate(
                    { _id: entryId },
                    {
                        $set: {
                            _id: entryId,
                            title,
                            markdownContent,
                            links,
                            subEntries: subEntries.map(sid => UUID.from(sid)),
                            _modified: new Date()
                        },
                        $setOnInsert: {
                            _created: new Date()
                        }
                    },
                    { returnDocument: 'after', session, upsert: true }
                );
                updateResult.updateOk &&= updateOk === 1;
                if (updateOk && updatedEntry) {
                    updateResult.entries.push(updatedEntry);
                }

                // TODO: move to db?
                if (updateOk && parent !== null) {
                    if (parent === NIL_UUID) {
                        const [
                            { ok: mainEntriesOk, value: mainEntriesValue },
                            { ok: oldParentEntryOk, value: oldParentEntry }
                        ] = await Promise.all([
                            getMain<MainMain>(db).findOneAndUpdate(
                                { type: 'main' },
                                { $addToSet: { data: entryId } },
                                { returnDocument: 'after', session }
                            ),
                            getEntries(db).findOneAndUpdate(
                                { subEntries: entryId },
                                {
                                    $pull: { subEntries: entryId },
                                    $set: { _modified: new Date() }
                                },
                                { returnDocument: 'after', session }
                            )
                        ]);

                        updateResult.updateOk &&= [mainEntriesOk, oldParentEntryOk].every(ok => ok === 1);

                        updateResult.mainEntries = mainEntriesValue?.data.map(uuidToString) ?? updateResult.mainEntries;
                        if (oldParentEntry) {
                            updateResult.entries.push(oldParentEntry);
                        }
                    } else {
                        const parentId = UUID.from(parent);

                        const [
                            { ok: mainEntriesOk, value: mainEntriesValue },
                            { ok: oldParentEntryOk, value: oldParentEntry },
                            { ok: newParentEntryOk, value: newParentEntry }
                        ] = await Promise.all([
                            getMain<MainMain>(db).findOneAndUpdate(
                                { type: 'main' },
                                { $pull: { data: entryId } },
                                { returnDocument: 'after', session }
                            ),
                            getEntries(db).findOneAndUpdate(
                                {
                                    _id: { $ne: parentId },
                                    subEntries: entryId
                                },
                                {
                                    $pull: { subEntries: entryId },
                                    $set: { _modified: new Date() }
                                },
                                { returnDocument: 'after', session }
                            ),
                            getEntries(db).findOneAndUpdate(
                                { _id: parentId },
                                {
                                    $addToSet: { subEntries: entryId },
                                    $set: { _modified: new Date() }
                                },
                                { returnDocument: 'after', session }
                            )
                        ]);

                        updateResult.updateOk &&= [mainEntriesOk, oldParentEntryOk, newParentEntryOk].every(
                            ok => ok === 1
                        );

                        updateResult.mainEntries = mainEntriesValue?.data.map(uuidToString) ?? updateResult.mainEntries;
                        if (oldParentEntry) {
                            updateResult.entries.push(oldParentEntry);
                        }
                        if (newParentEntry) {
                            updateResult.entries.push(newParentEntry);
                        }
                    }
                } else if (updateOk && parent === null) {
                    updateResult.mainEntries = undefined;
                }

                if (updateResult.updateOk) {
                    res.status(200).json({
                        entries: mapEntries(updateResult.entries),
                        mainEntries: updateResult.mainEntries
                    });
                    return;
                } else {
                    res.status(500).json({ error: 'DB update went wrong' });
                }
            } catch (error) {
                console.log(error);
                if (error instanceof yup.ValidationError) {
                    res.status(400).json({ error });
                } else {
                    res.status(500).json({ error: 'Something went wrong' });
                }
            }
            throw new Error('Abort transaction');
        } else {
            res.status(405).json({ error: 'Only GET and POST methods are allowed' });
        }
    }
);
