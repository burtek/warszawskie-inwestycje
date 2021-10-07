export function LoadingScreen({ height = '100%' }: { height?: string | number }) {
    return (
        <div className="container admin-loader" style={{ height }}>
            <div className="columns">
                <div className="column col-3" />
                <div className="column col-6">
                    <div className="loading loading-lg" />
                </div>
                <div className="column col-3" />
            </div>
        </div>
    );
}
LoadingScreen.displayName = 'LoadingScreen';
