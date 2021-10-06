import { getAdminData } from '../../../api/db/getters';
import { withAuthorizedSession } from '../../../api/lib/session';
import _pick from 'lodash/fp/pick';
import UUID from 'uuid-mongodb';
import * as yup from 'yup';
import { Entry, mapEntries } from '../../../api/db/getters/_types';

const saveEntryLinkSchema = yup.object().shape({
    label: yup.string().required('Link must have label'),
    url: yup.string().required('Link must have url')
});
const saveEntrySchema = yup.object().shape({
    id: yup.string().uuid('Entry id must be UUID').required('Entry id must be provided'),
    title: yup.string().required('Entry title must be provided'),
    markdownContent: yup.string().required('Entry markdownContent must be provided'),
    links: yup.array(saveEntryLinkSchema).required('Entry links array must be provided'),
    subEntries: yup.array(yup.string().required()).required('Entry title must be provided')
});
const reqBodySchema = yup.object().shape({
    entry: saveEntrySchema
});

export type ADMIN_DATA_POST_TYPE_ENTRY = yup.Asserts<typeof saveEntrySchema>;
export type ADMIN_DATA_GET_TYPE = ReturnType<typeof getAdminData> extends Promise<infer R> ? R : never;

export default withAuthorizedSession(async (req, res, db) => {
    if (req.method === 'GET') {
        const data = await getAdminData(db);
        res.status(200).json(data);
    } else if (req.method === 'POST') {
        try {
            const idParam = yup
                .string()
                .uuid('Request path must be UUID')
                .required('Request path must be UUID')
                .validateSync(req.query.id);
            const maybeEntry = JSON.parse(req.body);

            const {
                entry: { id, title, markdownContent, links, subEntries }
            } = reqBodySchema.validateSync(maybeEntry);

            const result = await db.collection<Entry>('entries').findOneAndUpdate(
                { _id: UUID.from(idParam) },
                {
                    $set: {
                        _id: UUID.from(id),
                        title,
                        markdownContent,
                        links,
                        subEntries: subEntries.map(id => UUID.from(id)),
                        _modified: new Date()
                    },
                    $setOnInsert: {
                        _created: new Date()
                    }
                }
            );

            if (result.ok && result.value) {
                res.status(200).json({ entry: mapEntries([result.value]) });
            } else {
                res.status(400).json({ error: JSON.stringify(result.lastErrorObject) });
            }
        } catch (error) {
            console.log(error);
            if (error instanceof yup.ValidationError) {
                res.status(400).json({ error });
            } else {
                res.status(500).json({ error: 'Something went wrong' });
            }
        }
    } else {
        res.status(405).json({ error: 'Only GET and POST methods are allowed' });
    }
});
