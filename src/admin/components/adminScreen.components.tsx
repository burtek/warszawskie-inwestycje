import dynamic from 'next/dynamic';
import { FC, MouseEventHandler } from 'react';
import { LoadingScreen } from './LoadingScreen';

export const MDEditor = dynamic(() => import('./MDEditor'), {
    ssr: false,
    loading() {
        return <LoadingScreen height={300} />;
    }
});

export const FormSection: FC<{ className?: string; id: string; label: string }> = ({
    children,
    className,
    id,
    label
}) => (
    <div className={`form-group ${className}`}>
        <label className="form-label" htmlFor={id}>
            {label}
        </label>
        {children}
    </div>
);
FormSection.displayName = 'AdminScreenFormSection';

export const Button: FC<{ icon: string; onClick: MouseEventHandler; primary?: boolean; text: string }> = ({
    icon,
    onClick,
    primary = false,
    text
}) => (
    <button className={`btn ${primary ? 'btn-primary' : ''}`} onClick={onClick}>
        <i className={`icon icon-${icon} mr-1`} />
        {text}
    </button>
);
Button.displayName = 'AdminScreenButton';
