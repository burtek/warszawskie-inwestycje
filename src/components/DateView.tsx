import dayjs from 'dayjs';

export function DateView({ children, format = 'DD.MM.YYYY HH:mm' }: Props) {
    const date = dayjs(children);
    return <time dateTime={date.toISOString()}>{date.format(format)}</time>;
}
DateView.displayName = 'DateView';

interface Props {
    children: Date | string;
    format?: string;
}
