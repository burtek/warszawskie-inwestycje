import { ChangeEventHandler, useCallback, useState } from 'react';
import { logIn, useAppDispatch, useAppSelector } from '../state';

export function LoginScreen() {
    const dispatch = useAppDispatch();
    const logInScreenMessage = useAppSelector(state => state.logInScreenMessage);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const onLoginChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
        event => setUsername(event.target.value),
        [setUsername]
    );
    const onPasswordChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
        event => setPassword(event.target.value),
        [setPassword]
    );

    const onLoginClick = useCallback(() => dispatch(logIn({ username, password })), [dispatch, username, password]);

    return (
        <div>
            {logInScreenMessage && <div className="text-error p-2">{logInScreenMessage}</div>}
            <div className="form-group">
                <label className="form-label" htmlFor="login">
                    Login
                </label>
                <input
                    className="form-input"
                    type="text"
                    id="login"
                    placeholder="Login"
                    value={username}
                    onChange={onLoginChange}
                />
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="password">
                    Password
                </label>
                <input
                    className="form-input"
                    type="password"
                    id="password"
                    placeholder="Hasło"
                    value={password}
                    onChange={onPasswordChange}
                />
            </div>
            <button className="btn btn-primary" onClick={onLoginClick}>
                Login
            </button>
        </div>
    );
}
LoginScreen.displayName = 'LoginScreen';
