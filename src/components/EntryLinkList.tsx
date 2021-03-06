import { PropsWithChildren } from 'react';

export function EntryLink({ href = '', title, children }: LinkProps) {
    let host = new URL(href).host;
    if (host.startsWith('www.')) {
        host = host.substring(4);
    }

    return (
        <a target="_blank" rel="noopener noreferrer" href={href} title={title ? `${title} (${host})` : host}>
            {children}
        </a>
    );
}
EntryLink.displayName = 'EntryLink';
type LinkProps = PropsWithChildren<{
    href?: string;
    title?: string;
}>;

export function EntryLinkList({ links }: ListProps) {
    if (links.length === 0) {
        return null;
    }

    return (
        <ul className="link-list">
            {links.map((link, index) => (
                <li key={`${link.url}-${index}`}>
                    <EntryLink href={link.url}>{link.label}</EntryLink>
                </li>
            ))}
        </ul>
    );
}
EntryLinkList.displayName = 'EntryLinkList';
interface ListProps {
    links: Array<{
        url: string;
        label: string;
    }>;
}
