// import { MongoClient } from 'mongodb';
import dayjs from 'dayjs';
import { Binary, ClientSession, Db, MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';
import { Session, withIronSession } from 'next-iron-session';
import { getDbUrl } from './dbUrl';
// import { getDbUrl } from './dbUrl';

export type NextIronRequest = NextApiRequest & { session: Session };
export type NextIronHandler<Res = any> = (req: NextIronRequest, res: NextApiResponse<Res>) => void | Promise<void>;
export type NextDbIronHandler<Res = any> = (
    req: NextIronRequest,
    res: NextApiResponse<Res>,
    session: ClientSession,
    db: Db
) => void | Promise<void>;

export const SESSION_KEY_USER = 'user';
export const SESSION_KEY_VERIFY = 'lastVerify';
export const SESSION_MAX_AGE_MINS = 30;

export interface SessionUser {
    username: string;
    roles: string[];
}

export interface DbUser {
    username: string;
    roles: string[];
    auth: {
        password: Binary;
        salt: Binary;
        iterations: number;
        keyLength: number;
        digest: string;
    };
}

export const withSession = <Res = any>(handler: NextIronHandler<Res>) =>
    withIronSession(handler, {
        password: process.env.COOKIE_PASS as string,
        cookieName: process.env.COOKIE_NAME as string,
        cookieOptions: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: dayjs().add(SESSION_MAX_AGE_MINS, 'minutes').toDate()
        },
        ttl: SESSION_MAX_AGE_MINS * 60
    });

export const withAuthorizedSession = <Res = any>(handler: NextDbIronHandler<Res>) =>
    withSession(async (req, res) => {
        res.setHeader('Cache-Control', 'no-store, max-age=0');

        const sessionUser = req.session.get<SessionUser>(SESSION_KEY_USER);
        if (!sessionUser) {
            res.status(403).json({ error: 'Not logged in' });
            return;
        } else if (!sessionUser.roles.includes(process.env.DB_ADMIN_ROLE as string)) {
            res.status(403).json({ error: 'Not authorized to use this app' });
            return;
        }

        let client: MongoClient | undefined;
        let session: ClientSession | undefined;
        try {
            client = new MongoClient(
                getDbUrl(
                    process.env.DB_ADMIN_USER as string,
                    process.env.DB_ADMIN_PASS as string,
                    process.env.DB_DB as string,
                    process.env.DB_HOST as string
                ),
                { maxIdleTimeMS: 1000 }
            );
            await client.connect();

            session = client.startSession();
            const wiDb = client.db('wi');

            await session.withTransaction(async session => handler(req, res, session, wiDb));
        } catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error });
            }
        } finally {
            session?.endSession();
            client?.close();
        }
    });
