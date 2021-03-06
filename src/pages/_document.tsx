import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    static displayName = 'MyDocument';

    render() {
        return (
            <Html>
                <Head>
                    <link rel="icon" type="image/png" href="/favicon-32x32.png" sizes="32x32" />
                    <link rel="icon" type="image/png" href="/favicon-16x16.png" sizes="16x16" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;
