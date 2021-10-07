export const getDbUrl = (username: string, password: string, db: string, host = process.env.DB_HOST as string) =>
    `mongodb+srv://${username}:${password}@${host}/${db}?retryWrites=true&w=majority`;
