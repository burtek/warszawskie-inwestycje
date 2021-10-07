import crypto from 'crypto';
import { MongoClient } from 'mongodb';
import { getDbUrl } from '../../../api/lib/dbUrl';
import { DbUser, SessionUser, SESSION_KEY_USER, withSession } from '../../../api/lib/session';

function hashPassword(
    password: string,
    salt = crypto.randomBytes(128),
    iterations = 10000,
    keyLength = 128,
    digest = 'sha512'
) {
    const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest);

    return { hash, salt, iterations, keyLength, digest };
}

export default withSession(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    const { username, password } = JSON.parse(req.body);

    if (!username || !password) {
        res.status(400).json({ error: 'Username and password must be filled' });
        return;
    }

    try {
        const client = new MongoClient(
            getDbUrl(
                process.env.DB_ADMIN_USER as string,
                process.env.DB_ADMIN_PASS as string,
                process.env.DB_ADMIN_DB as string
            ),
            { maxIdleTimeMS: 1000 }
        );
        await client.connect();

        const user = await client.db(process.env.DB_ADMIN_DB).collection<DbUser>('users').findOne({ username });
        if (!user) {
            res.status(401).json({ error: 'Unknown user or wrong password' });
            return;
        }
        const attemptHash = hashPassword(
            password,
            user.auth.salt.buffer,
            user.auth.iterations,
            user.auth.keyLength,
            user.auth.digest
        ).hash;
        if (user.auth.password.buffer.compare(attemptHash) !== 0) {
            res.status(401).json({ error: 'Unknown user or wrong password' });
            return;
        }

        req.session.set<SessionUser>(SESSION_KEY_USER, { username, roles: user.roles });
        // req.session.set(SESSION_KEY_VERIFY, new Date().toISOString());
        await req.session.save();

        if (!user.roles.includes(process.env.DB_ADMIN_ROLE as string)) {
            res.status(403).json({ error: 'Not authorized to use this app' });
            return;
        }

        res.status(200).json({ error: null });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});
