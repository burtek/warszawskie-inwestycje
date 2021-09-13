import UUID, { MUUID } from 'uuid-mongodb';
import type { Binary } from 'mongodb';

export function uuidToString(arg: string | Binary | MUUID) {
    return UUID.from(arg).toString('D');
}
