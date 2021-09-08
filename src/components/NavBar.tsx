import Link from 'next/link';

export function NavBar({ appTitle, current }: Props) {
    return (
        <div className='container'>
            <header className='navbar'>
                <section className='navbar-section'>
                    <Link href='/'>
                        <a className='navbar-brand mr-2 text-bold'>{appTitle.toUpperCase()}</a>
                    </Link>
                </section>

                <section className='navbar-section'>
                    <ul className='breadcrumb'>
                        <li className='breadcrumb-item'>
                            <Link href='/'>
                                <a>Główna</a>
                            </Link>
                        </li>
                        {current && (
                            <li className='breadcrumb-item'>
                                <Link href={`/entry/${current.id}`}>
                                    <a>{current.title}</a>
                                </Link>
                            </li>
                        )}
                    </ul>
                </section>

                <section className='navbar-section hide-md' />
            </header>
        </div>
    );
}

interface Props {
    appTitle: string;
    current?: {
        id: string;
        title: string;
    };
}
