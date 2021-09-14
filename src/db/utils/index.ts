import dayjs, { Dayjs } from 'dayjs';
import type { Binary } from 'mongodb';
import UUID, { MUUID } from 'uuid-mongodb';

export function uuidToString(arg: string | Binary | MUUID) {
    return UUID.from(arg).toString('D');
}

export function dateToISO(arg: Date | Dayjs | string) {
    return dayjs(arg).toISOString();
}
