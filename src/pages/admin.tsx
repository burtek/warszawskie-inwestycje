import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect } from 'react';
import Modal from 'react-modal';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { adminStore, getData, SESSION_STATE, useAppDispatch, useAppSelector } from '../admin/state';
import { AdminScreen } from '../admin/components/AdminScreen';
import { LoadingScreen } from '../admin/components/LoadingScreen';
import { LoginScreen } from '../admin/components/LoginScreen';
import type { StaticProps as AppStaticProps } from './_app';

function AdminContent() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(state => state.sessionState);

    useEffect(() => {
        dispatch(getData());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const shouldShowLoader = [SESSION_STATE.LOGGING_IN, SESSION_STATE.UNKNOWN].includes(state);
    const shouldShowLoginModal = shouldShowLoader || [SESSION_STATE.LOGGED_OUT].includes(state);

    return (
        <div className="admin-wrapper">
            <Modal
                isOpen={shouldShowLoginModal}
                shouldCloseOnEsc={false}
                shouldCloseOnOverlayClick={false}
                overlayClassName="login-modal-overlay"
                className="login-modal">
                {shouldShowLoader ? <LoadingScreen /> : <LoginScreen />}
            </Modal>
            <AdminScreen />
        </div>
    );
}
AdminContent.displayName = 'AdminContent';

const Admin: NextPage<AppStaticProps> = ({ appTitle }) => {
    return (
        <>
            <Head>
                <title>Admin | {appTitle}</title>
            </Head>
            <Provider store={adminStore}>
                <AdminContent />
            </Provider>
            <ToastContainer />
        </>
    );
};
Admin.displayName = 'Admin';
export default Admin;
