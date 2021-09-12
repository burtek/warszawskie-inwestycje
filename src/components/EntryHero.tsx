import Image from 'next/image';
import type { PropsWithChildren } from 'react';
import { getImageForEntry } from '../images';

export function EntryHero({ children, id, title }: Props) {
    const image = getImageForEntry(id);

    return (
        <div className='hero hero-sm hero-entry bg-gray'>
            <div className='hero-body columns p-relative'>
                <div className='column col-3 col-lg-4 hide-md' />
                <div className='column col-5 col-lg-4'>
                    <h1>{title}</h1>
                    {children}
                </div>
                <div className='hero-image-wrapper hide-lg'>
                    {image && (
                        <Image
                            key={id}
                            src={image}
                            alt={title}
                            layout='fill'
                            objectFit='contain'
                            objectPosition='right'
                            priority
                            placeholder='empty'
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

type Props = PropsWithChildren<{
    id: string;
    title: string;
}>;
