import { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType, NextPage, Redirect } from 'next';
import Head from 'next/head';
import { ElementType } from 'react';
import ReactMarkdown from 'react-markdown';
import { EntryHero } from '../../components/EntryHero';
import { EntryLink, EntryLinkList } from '../../components/EntryLinkList';
import { NavBar } from '../../components/NavBar';
import { NavSideBar } from '../../components/NavSideBar';
import { DB, Types } from '../../api/db';
import type { StaticProps as AppStaticProps } from '../_app';

function renderMD(markdownContent: string) {
    return <ReactMarkdown components={renderMD.components}>{markdownContent}</ReactMarkdown>;
}
renderMD.components = { a: EntryLink };

function mapEntry(
    { id, title, links, markdownContent, subEntries }: Types.MappedEntryTree,
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

const Entry: NextPage<AppStaticProps & StaticProps> = ({ appTitle, buildDate, ...props }) => {
    if (props.error) {
        return <div>Ups... Już naprawiam 😅</div>;
    }
    const {
        entry: { title, id, links, markdownContent, subEntries },
        navbarEntries,
        lastUpdated
    } = props;

    return (
        <>
            <Head>
                <title>
                    {title} | {appTitle}
                </title>
            </Head>
            <NavBar appTitle={appTitle} />
            <EntryHero id={id} title={title} lastUpdate={lastUpdated} buildDate={buildDate}>
                <EntryLinkList links={links} />
            </EntryHero>
            <div className="container">
                <div className="columns">
                    <div className="column col-3 col-lg-4 hide-md">
                        <NavSideBar mainEntries={navbarEntries} currentId={id} currentSubEntries={subEntries} />
                    </div>
                    <div className="column col-9 col-lg-8 col-md-12">
                        {renderMD(markdownContent)}
                        {subEntries.map((subEntry, subIndex) => mapEntry(subEntry, subIndex))}
                    </div>
                </div>
            </div>
        </>
    );
};
Entry.displayName = 'Entry';
export default Entry;

type StaticProps = InferGetStaticPropsType<typeof getStaticProps>;
export const getStaticProps = async ({ params: { id } = {} }: GetStaticPropsContext<{ id?: string }>) => {
    const revalidate = parseInt(process.env.REVALIDATE_TIMEOUT || '10', 10);

    let error = false;
    let navbarEntries: Types.NavbarEntry[] = [];
    let entry: Types.MappedEntryTree | null = null;
    let lastUpdated: string | null = null;

    if (typeof id === 'string' && id) {
        try {
            const data = await DB.getMainEntry(id);

            if (data) {
                ({ entry, lastUpdated } = data);
            }
        } catch (err) {
            console.error(err);
            error = true;
        }

        if (entry) {
            try {
                navbarEntries = await DB.getNavbar();
            } catch (error) {
                console.error(error);
            }
        }
    }

    if (entry || error) {
        return {
            props: {
                buildDate: new Date().toISOString(),
                error,
                navbarEntries,
                entry,
                lastUpdated
            } as
                | {
                      buildDate: string;
                      error: true;
                      navbarEntries: Types.NavbarEntry[];
                      entry: undefined;
                      lastUpdated: undefined;
                  }
                | {
                      buildDate: string;
                      error: false;
                      navbarEntries: Types.NavbarEntry[];
                      entry: Types.MappedEntryTree;
                      lastUpdated: string;
                  },
            revalidate
        };
    }

    return {
        redirect: {
            destination: '/',
            permanent: false
        },
        revalidate
    } as { redirect: Redirect; revalidate: number };
};

export const getStaticPaths: GetStaticPaths = async () => {
    let paths: Array<{ params: { id: string } }> = [];
    try {
        paths = (await DB.getMainEntryIds())?.map(id => ({ params: { id } })) ?? [];
    } catch {}

    return {
        paths,
        fallback: 'blocking'
    };
};
