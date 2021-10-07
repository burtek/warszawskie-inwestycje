import type { AppProps } from 'next/app';
import Modal from 'react-modal';
import 'spectre.css/dist/spectre.min.css';
import 'spectre.css/dist/spectre-exp.min.css';
import 'spectre.css/dist/spectre-icons.min.css';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/global.scss';

// TODO: preview image

const staticProps = {
    appTitle: 'Inwestycje w Warszawie'
};
export type StaticProps = typeof staticProps;

function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} {...staticProps} />;
}
MyApp.displayName = 'MyApp';

export default MyApp;

Modal.setAppElement('#__next');
