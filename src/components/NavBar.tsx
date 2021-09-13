import Link from 'next/link';

export function NavBar({ appTitle }: Props) {
    return (
        <div className="container">
            <header className="navbar">
                <section className="navbar-section">
                    <Link href="/">
                        <a className="navbar-brand mr-2 text-bold">{appTitle.toUpperCase()}</a>
                    </Link>
                </section>
            </header>
        </div>
    );
}
NavBar.displayName = 'NavBar';

interface Props {
    appTitle: string;
}
