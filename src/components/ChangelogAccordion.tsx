import dayjs from 'dayjs';
import { Fragment } from 'react';
import { Data } from '../data';

export function Accordion({ changes }: Props) {
    const id = 'changelog-accordion-checkbox';
    return (
        <div className='container'>
            <div className='accordion'>
                <input type={'checkbox'} id={id} name={id} hidden />
                <label className='accordion-header' htmlFor={id}>
                    <i className='icon icon-arrow-right mr-1'></i>
                    Lista zmian
                </label>
                <div className='accordion-body'>
                    {changes
                        .filter((_, index) => index < 3)
                        .map(change => (
                            <Fragment key={change.date}>
                                <dt>{dayjs(change.date).format('DD.MM.YYYY HH:mm')}</dt>
                                <dd>{change.description}</dd>
                            </Fragment>
                        ))}
                    <div>
                        <a
                            href='https://github.com/burtek/warszawskie-inwestycje'
                            target='_blank'
                            rel='noreferrer noopener'
                            className='text-secondary'>
                            Build {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ?? 'abc1234'}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface Props {
    changes: Data['changes'];
}
