import { withSession } from '../../../api/lib/session';

export default withSession(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store, max-age=0');

    req.session.destroy();
    res.redirect('/');
});
