import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { ElementType, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { EntryHero } from '../../components/EntryHero';
import { EntryLink, EntryLinkList } from '../../components/EntryLinkList';
import { NavBar } from '../../components/NavBar';
import { NavSideBar } from '../../components/NavSideBar';
import { BaseDataEntry, DB, ExpandedDataEntry } from '../../db';
import type { StaticProps as AppStaticProps } from '../_app';

function renderMD(markdownContent: string) {
    return <ReactMarkdown components={renderMD.components}>{markdownContent}</ReactMarkdown>;
}
renderMD.components = { a: EntryLink };

function mapEntry(
    { id, title, links, markdownContent, subEntries }: ExpandedDataEntry,
    index: number,
    level: number = 1
) {
    const Component = `h${level + 1}` as ElementType;
    const numberString = level === 1 ? `${index + 1}.` : '';

    return (
        <div key={id} style={{ marginLeft: (level - 1) * 30 }}>
            <Component id={id}>
                {numberString} {title}
            </Component>
            <EntryLinkList links={links} />
            {renderMD(markdownContent)}
            {subEntries.map((subEntry, subIndex) => mapEntry(subEntry, subIndex, level + 1))}
        </div>
    );
}

const Entry: NextPage<AppStaticProps & StaticProps> = ({
    appTitle,
    buildDate,
    entry: { title, id, lastUpdate, links, markdownContent, subEntries },
    mainEntries
}) => {
    const navSideBar = useMemo(
        () => <NavSideBar mainEntries={mainEntries} currentId={id} currentSubEntries={subEntries} />,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [id, mainEntries.length, subEntries.length, ...mainEntries, ...subEntries]
    );

    return (
        <>
            <Head>
                <title>
                    {title} | {appTitle}
                </title>
            </Head>
            <NavBar appTitle={appTitle} />
            <EntryHero id={id} title={title} lastUpdate={lastUpdate} buildDate={buildDate}>
                <EntryLinkList links={links} />
            </EntryHero>
            <div className="container">
                <div className="columns">
                    <div className="column col-3 col-lg-4 hide-md">{navSideBar}</div>
                    <div className="column col-9 col-lg-8 col-md-12">
                        {renderMD(markdownContent)}
                        {subEntries.map((subEntry, subIndex) => mapEntry(subEntry, subIndex))}
                    </div>
                </div>
            </div>
        </>
    );
};
export default Entry;

type StaticProps = {
    buildDate: string;
    entry: ExpandedDataEntry;
    mainEntries: BaseDataEntry[];
};
export const getStaticProps: GetStaticProps<StaticProps> = async ({ params: { id } = {} }) => {
    if (typeof id === 'string' && id) {
        const mainEntries = await DB.getMainEntries();

        if (mainEntries.some(entry => entry.id.toLowerCase() === id.toLowerCase())) {
            const entry = await DB.getEntry(id, true);

            if (entry) {
                return {
                    props: {
                        buildDate: new Date().toISOString(),
                        entry,
                        mainEntries
                    },
                    revalidate: parseInt(process.env.REVALIDATE_TIMEOUT || '10', 10)
                };
            }
        }
    }

    return {
        redirect: {
            destination: '/',
            permanent: false
        },
        revalidate: parseInt(process.env.REVALIDATE_TIMEOUT || '10', 10)
    };
};

export const getStaticPaths: GetStaticPaths = async () => ({
    paths: (await DB.getMainEntriesIds()).map(id => ({ params: { id } })),
    fallback: 'blocking'
});
