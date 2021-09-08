import isEqual from 'lodash/isEqual';
import Link from 'next/link';
import { memo, useCallback } from 'react';
import { Entry } from '../data';

export function NavSideBarComp({ mainEntries, currentId, currentSubEntries }: Props) {
    const mapSubEntries = useCallback(
        ({ id, title }: Entry) => (
            <li className='nav-item' key={id}>
                <Link href={`#${id}`}>
                    <a>{title}</a>
                </Link>
            </li>
        ),
        []
    );
    const mapEntries = useCallback(
        ({ id, title }: Entry) => {
            const thisCurrent = currentId === id;
            return (
                <li className={'nav-item' + (thisCurrent ? ' active' : '')} key={id}>
                    <Link href={`/entry/${id}`}>
                        <a>{title}</a>
                    </Link>
                    {thisCurrent && <ul className='nav'>{currentSubEntries.map(mapSubEntries)}</ul>}
                </li>
            );
        },
        [currentId, currentSubEntries, mapSubEntries]
    );

    return (
        <ul className='nav'>
            <li className='nav-item'>
                <Link href='/'>
                    <a>Główna</a>
                </Link>
            </li>
            <li className='nav-item active'>
                <a>Obszary</a>
                <ul className='nav'>{mainEntries.map(mapEntries)}</ul>
            </li>
        </ul>
    );
}

export const NavSideBar = memo(NavSideBarComp, (prevProps, nextProps) => isEqual(prevProps, nextProps));

interface Props {
    mainEntries: Entry[];
    currentId: string;
    currentSubEntries: Entry[];
}
