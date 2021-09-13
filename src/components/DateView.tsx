import dayjs from 'dayjs';

export function DateView({ children, format = 'DD.MM.YYYY HH:mm' }: Props) {
    return <time dateTime={dayjs(children).toISOString()}>{dayjs(children).format(format)}</time>;
}

interface Props {
    children: Date | string;
    format?: string;
}
