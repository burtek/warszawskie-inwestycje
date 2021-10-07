export const getDbUrl = (username: string, password: string, db: string, host: string) =>
    `mongodb+srv://${username}:${password}@${host}/${db}?retryWrites=true&w=majority`;
