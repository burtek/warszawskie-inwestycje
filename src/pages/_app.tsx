import type { AppProps } from 'next/app';
import 'spectre.css/dist/spectre.min.css';
import 'spectre.css/dist/spectre-exp.min.css';
import 'spectre.css/dist/spectre-icons.min.css';
import '../styles/global.scss';

// TODO: tile image

const staticProps = {
    appTitle: 'Inwestycje w Warszawie'
};
export type StaticProps = typeof staticProps;

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} {...staticProps} />;
}

export default MyApp;
