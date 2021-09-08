import { Entry } from '../data';

export function EntryLinkList({ links }: Props) {
    if (!links || links.length === 0) {
        return null;
    }

    return (
        <ul className='link-list'>
            {links.map((link, index) => (
                <li key={`${link.url}-${index}`}>
                    <a target='_blank' rel='noreferrer' href={link.url}>
                        {link.label}
                    </a>
                </li>
            ))}
        </ul>
    );
}

interface Props {
    links: Entry['links'] | undefined;
}
