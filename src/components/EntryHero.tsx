// import Image from 'next/image';
import type { PropsWithChildren } from 'react';
// import { getImageForEntry } from '../images';
import { DateView } from './DateView';

export function EntryHero({ buildDate, children, id, lastUpdate, title }: Props) {
    // const image = getImageForEntry(id);

    return (
        <div className="hero hero-sm hero-entry bg-gray">
            <div className="hero-body columns p-relative">
                <div className="column col-3 col-lg-4 hide-md" />
                <div className="column col-9 col-lg-8 col-md-12">
                    <h1>{title}</h1>
                    {children}
                    <p className="text-gray text-small">
                        Ostatnia zmiana: <DateView>{lastUpdate}</DateView> (według stanu na{' '}
                        <DateView>{buildDate}</DateView>)
                    </p>
                </div>
                {/* <div className="hero-image-wrapper hide-lg">
                    {image && (
                        <Image
                            key={id}
                            src={image}
                            alt={title}
                            layout="fill"
                            objectFit="contain"
                            objectPosition="right"
                            priority
                            placeholder="empty"
                        />
                    )}
                </div> */}
            </div>
        </div>
    );
}
EntryHero.displayName = 'EntryHero';

type Props = PropsWithChildren<{
    id: string;
    title: string;
    lastUpdate: string;

    buildDate: string;
}>;
