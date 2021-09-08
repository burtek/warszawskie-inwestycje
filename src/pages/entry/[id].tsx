import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ElementType, Fragment, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import { EntryHero } from '../../components/EntryHero';
import { EntryLinkList } from '../../components/EntryLinkList';
import { NavBar } from '../../components/NavBar';
import { NavSideBar } from '../../components/NavSideBar';
import { data, Entry as DataEntry } from '../../data';
import type { StaticProps } from '../_app';

const mapLevelConfig = (level: number): [ElementType, boolean] => [`h${level + 1}` as ElementType, level < 2];

const ComponentsMapping: ReactMarkdownOptions['components'] = {
    a: ({ children, ...props }) => (
        <a rel='noreferrer' {...props}>
            {children}
        </a>
    )
};

function mapEntry(
    entries: Record<DataEntry['id'], DataEntry>,
    entryId: DataEntry['id'],
    index: number,
    level: number = 1,
    parentNumber = ''
) {
    const entry = entries[entryId];
    const [Component, numbering] = mapLevelConfig(level);
    const numberString = numbering ? `${parentNumber}${index + 1}.` : '';

    return (
        <Fragment key={entryId}>
            <Component id={level === 1 ? entryId : undefined}>
                {numberString} {entry.title}
            </Component>
            <EntryLinkList links={entry.links} />
            <ReactMarkdown components={ComponentsMapping} linkTarget='_blank'>
                {entry.markdownContent}
            </ReactMarkdown>
            {entry.subEntries.map((subentryId, subindex) =>
                mapEntry(entries, subentryId, subindex, level + 1, numberString)
            )}
        </Fragment>
    );
}

const Entry: NextPage<StaticProps> = ({ appTitle, data: { entries, mainEntries } }) => {
    const router = useRouter();
    const id = router.query.id as string;
    const entry = entries[id];

    const navMainEntries = mainEntries.map(id => entries[id]);
    const navSubEntries = (entry?.subEntries ?? []).map(id => entries[id]);
    const navSideBar = useMemo(
        () => <NavSideBar mainEntries={navMainEntries} currentId={id} currentSubEntries={navSubEntries} />,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [id, navMainEntries.length, navSubEntries.length, ...navMainEntries, ...navSubEntries]
    );

    if (!id || !entry) {
        if (id) {
            // it's not server-side, we're good to redirect
            router.replace('/');
        }
        return <></>;
    }
    const { image, title } = entry;

    return (
        <>
            <Head>
                <title>
                    {title} | {appTitle}
                </title>
            </Head>
            <NavBar appTitle={appTitle} current={{ id, title }} />
            <EntryHero id={id} title={title} image={image}>
                <EntryLinkList links={entry.links} />
            </EntryHero>
            <div className='container'>
                <div className='columns'>
                    <div className='column col-3 col-lg-4 hide-md'>{navSideBar}</div>
                    <div className='column col-9 col-lg-8 col-md-12'>
                        <ReactMarkdown components={ComponentsMapping}>{entry.markdownContent}</ReactMarkdown>
                        {entry.subEntries.map((subentryId, subindex) => mapEntry(entries, subentryId, subindex))}
                    </div>
                </div>
            </div>
        </>
    );
};
export default Entry;

export const getStaticProps: GetStaticProps = async ({ params: { id } = {} }) => {
    if (typeof id !== 'string' || !data.entries[id] || !data.mainEntries.includes(id)) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        };
    }

    return {
        props: {}
    };
};

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: data.mainEntries.map(id => ({ params: { id } })),
        fallback: 'blocking'
    };
};
