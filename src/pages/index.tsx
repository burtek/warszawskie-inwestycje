import type { InferGetStaticPropsType, NextPage } from 'next';
import Head from 'next/head';
import { ChangelogAccordion } from '../components/ChangelogAccordion';
import { EntryCard } from '../components/EntryCard';
import { NavBar } from '../components/NavBar';
import { DB, Types } from '../api/db';
import type { StaticProps as AppStaticProps } from './_app';

const Home: NextPage<AppStaticProps & StaticProps> = ({ appTitle, changelog, error, mainEntries }) => {
    const mapCard = ({ id, lastUpdate, title }: Types.HomepageEntry) => (
        <div className="column col-2 col-xl-3 col-lg-4 col-sm-6 col-xs-12" key={id}>
            <EntryCard id={id} lastUpdate={lastUpdate} title={title} />
        </div>
    );

    if (error) {
        return <div>Ups... Już naprawiam 😅</div>;
    }

    return (
        <>
            <Head>
                <title>{appTitle}</title>
            </Head>
            <NavBar appTitle={appTitle} />
            <div className="hero hero-sm bg-gray">
                <div className="hero-body">
                    <h1>{appTitle}</h1>
                    <p>
                        Zbiór informacji i linków o trwających inwestycjach w Warszawie (głównie tych które mnie
                        interesują)
                    </p>
                </div>
            </div>
            <div className="container">
                <div className="columns">{mainEntries.map(mapCard)}</div>
            </div>
            <ChangelogAccordion changelog={changelog} />
        </>
    );
};
Home.displayName = 'Home';
export default Home;

type StaticProps = InferGetStaticPropsType<typeof getStaticProps>;
export const getStaticProps = async () => {
    let changelog: Types.ChangelogItem[] = [];
    let mainEntries: Types.HomepageEntry[] = [];
    let error = false;

    try {
        ({ changelog, mainEntries } = await DB.getHomeData());
    } catch (err: unknown) {
        console.error(err);
        error = true;
    }

    return {
        props: {
            changelog,
            mainEntries,
            error
        },
        revalidate: parseInt(process.env.REVALIDATE_TIMEOUT || '10', 10)
    };
};
