import type { AppProps } from 'next/app';
import { data } from '../data';
import 'spectre.css/dist/spectre.min.css';
import 'spectre.css/dist/spectre-exp.min.css';
import 'spectre.css/dist/spectre-icons.min.css';
import '../styles/global.scss';

// TODO: icon + tile image

const staticProps = {
    appTitle: 'Inwestycje w Warszawie',
    data: data
};
export type StaticProps = typeof staticProps;

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} {...staticProps} />;
}

export default MyApp;
