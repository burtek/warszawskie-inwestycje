import { Entry } from '../data';
import Image from 'next/image';
import { PropsWithChildren } from 'react';

export function EntryHero({ children, id, image, title }: Props) {
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
                            height='100%'
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

interface Props extends PropsWithChildren<Pick<Entry, 'id' | 'image' | 'title'>> {}
