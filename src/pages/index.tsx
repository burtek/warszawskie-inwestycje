import type { InferGetStaticPropsType, NextPage } from 'next';
import Head from 'next/head';
import { Accordion } from '../components/ChangelogAccordion';
import { EntryCard } from '../components/EntryCard';
import { NavBar } from '../components/NavBar';
import { BaseDataEntry, DB, MapDataEntry, mapDatumToStringIds } from '../db';
import type { StaticProps as AppStaticProps } from './_app';

const Home: NextPage<AppStaticProps & StaticProps> = ({ appTitle, changelog, mainEntries }) => {
    const mapCard = ({ id, title }: MapDataEntry<BaseDataEntry>) => (
        <div className='column col-2 col-xl-3 col-lg-4 col-sm-6 col-xs-12' key={id}>
            <EntryCard id={id} title={title} />
        </div>
    );

    return (
        <>
            <Head>
                <title>{appTitle}</title>
            </Head>
            <NavBar appTitle={appTitle} />
            <div className='hero hero-sm bg-gray'>
                <div className='hero-body'>
                    <h1>{appTitle}</h1>
                    <p>
                        Zbiór informacji i linków o trwających inwestycjach w Warszawie (głównie tych które mnie
                        interesują)
                    </p>
                </div>
            </div>
            <div className='container'>
                <div className='columns'>{mainEntries.map(mapCard)}</div>
            </div>
            <Accordion changes={changelog} />
        </>
    );
};
export default Home;

type StaticProps = InferGetStaticPropsType<typeof getStaticProps>;
export const getStaticProps = async () => {
    const [mainEntries, changelog] = await Promise.all([DB.getMainEntries(), DB.getChangelog()]);

    return {
        props: {
            changelog,
            mainEntries: mainEntries.map(mapDatumToStringIds)
        },
        revalidate: parseInt(process.env.REVALIDATE_TIMEOUT || '10', 10)
    };
};
