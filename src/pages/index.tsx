import type { NextPage } from 'next';
import Head from 'next/head';
import { Accordion } from '../components/ChangelogAccordion';
import { EntryCard } from '../components/EntryCard';
import { NavBar } from '../components/NavBar';
import type { StaticProps } from './_app';

const Home: NextPage<StaticProps> = ({ appTitle, data }) => {
    const { changes, entries, mainEntries } = data;

    const mapCard = (entryId: string) => {
        const entry = entries[entryId];
        return (
            <div className='column col-2 col-xl-3 col-lg-4 col-sm-6 col-xs-12' key={entryId}>
                <EntryCard id={entryId} title={entry?.title ?? '404 Not Found'} image={entry?.image} />
            </div>
        );
    };

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
            <Accordion changes={changes} />
        </>
    );
};
export default Home;
