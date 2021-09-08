import Image from 'next/image';
import Link from 'next/link';

export function EntryCard({ id, title, image, content }: Props) {
    return (
        <div className='card'>
            <div className='card-header'>
                <div className='card-title h5'>{title}</div>
            </div>
            {image && (
                <div className='card-image'>
                    <Image src={image} className='img-responsive' alt={title} placeholder='blur' />
                </div>
            )}
            {content && <div className='card-body'>{content}</div>}
            <div className='card-footer'>
                <Link href={`/entry/${id}`}>
                    <a className='btn btn-primary'>Więcej informacji</a>
                </Link>
            </div>
        </div>
    );
}
EntryCard.displayName = 'EntryCard';

interface Props {
    id: string;
    title: string;
    image?: StaticImageData;
    content?: string | JSX.Element;
}
