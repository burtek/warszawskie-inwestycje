import Image from 'next/image';
import Link from 'next/link';
import type { PropsWithChildren } from 'react';
import { getImageForEntry } from '../images';
import { DateView } from './DateView';

export function EntryCard({ id, lastUpdate, title, children }: Props) {
    const image = getImageForEntry(id);

    return (
        <div className='card card-fullheight mt-2 p-relative'>
            <div className='card-header'>
                <div className='card-title h5'>{title}</div>
            </div>
            {image && (
                <div className='card-image'>
                    <Image src={image} className='img-responsive' alt={title} placeholder='blur' objectFit='cover' />
                </div>
            )}
            {children && <div className='card-body'>{children}</div>}
            <div className='card-footer'>
                <p className='text-gray text-small'>
                    Ostatnia aktualizacja: <DateView>{lastUpdate}</DateView>
                </p>
                <Link href={`/entry/${id}`}>
                    <a className='btn btn-primary'>Więcej informacji</a>
                </Link>
            </div>
        </div>
    );
}
EntryCard.displayName = 'EntryCard';

type Props = PropsWithChildren<{
    id: string;
    lastUpdate: string;
    title: string;
}>;
