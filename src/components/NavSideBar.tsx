import isEqual from 'lodash/isEqual';
import Link from 'next/link';
import { memo, useCallback } from 'react';

export function NavSideBarComp({ mainEntries, currentId, currentSubEntries }: Props) {
    const mapSubEntries = useCallback(
        ({ id, title }: BaseEntry) => (
            <li className="nav-item" key={id}>
                <Link href={`#${id}`}>
                    <a>{title}</a>
                </Link>
            </li>
        ),
        []
    );
    const mapEntries = useCallback(
        ({ id, title }: BaseEntry) => {
            const thisCurrent = currentId === id;
            return (
                <li className={'nav-item' + (thisCurrent ? ' active' : '')} key={id}>
                    <Link href={`/entry/${id}`}>
                        <a>{title}</a>
                    </Link>
                    {thisCurrent && <ul className="nav">{currentSubEntries.map(mapSubEntries)}</ul>}
                </li>
            );
        },
        [currentId, currentSubEntries, mapSubEntries]
    );

    return (
        <ul className="nav p-sticky">
            <li className="nav-item">
                <Link href="/">
                    <a>Główna</a>
                </Link>
            </li>
            <li className="nav-item active">
                <a href="#" onClick={e => e.preventDefault()}>
                    Obszary
                </a>
                <ul className="nav">{mainEntries.map(mapEntries)}</ul>
            </li>
        </ul>
    );
}
NavSideBarComp.displayName = 'NavSideBar';

export const NavSideBar = memo(NavSideBarComp, (prevProps, nextProps) => isEqual(prevProps, nextProps));

interface BaseEntry {
    id: string;
    title: string;
}

interface Props {
    mainEntries: BaseEntry[];
    currentId: string;
    currentSubEntries: BaseEntry[];
}
