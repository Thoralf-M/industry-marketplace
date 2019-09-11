const path = require("path");
const sql = require("mssql");
const config = require(path.resolve("./src/config.json"));

let db;

export const connect = async () => {
    try {
        db = await new sql.ConnectionPool(config.sqlServer).connect();
    } catch (e) {
        console.log(e);
    }
};

export const createUser = async (data) => {
    const delQuery = `
        Delete from [dbo].[user];`;
    const delRequest = new sql.Request(db);
    await delRequest.query(delQuery);
    const query = `
		INSERT INTO [dbo].[user] ([id],[name],[role],[location])
		values (@id, @name, @role, @location);`;

    const request = new sql.Request(db);
    const result = await request
        .input("id", data.id)
        .input("name", data.name)
        .input("role", data.role)
        .input("location", data.location)
        .query(query);

    return result.rowsAffected === 1;
};

export const createWallet = async (data) => {
    const delQuery = `
    Delete from [dbo].[wallet];`;
    const delRequest = new sql.Request(db);
    await delRequest.query(delQuery);

    const query = `
		INSERT INTO [dbo].[wallet] ([seed],[address],[keyIndex],[balance])
		values (@seed, @address, @keyIndex, @balance);`;

    const request = new sql.Request(db);
    const result = await request
        .input("seed", data.seed)
        .input("address", data.address)
        .input("keyIndex", data.keyIndex)
        .input("balance", data.balance)
        .query(query);

    return result.rowsAffected === 1;
};

export const createSensorData = async (data) => {

    const delQuery = `
    Delete from [dbo].[data];`;
    const delRequest = new sql.Request(db);
    await delRequest.query(delQuery);

    const query = `
		INSERT INTO [dbo].[data] ([id],[deviceId],[userId],[schema])
		values (@id, @deviceId, @userId, @schema );`;

    const request = new sql.Request(db);
    const result = await request
        .input("id", data.id)
        .input("deviceId", data.deviceId)
        .input("userId", data.userId)
        .input("schema", data.schema)
        .query(query);

    return result.rowsAffected === 1;
};

export const createDID = async (data) => {
    const query = `
		INSERT INTO [dbo].[did] ([root],[privateKey],[seed],[next_root],[start])
		values (@root, @privateKey, @seed, @next_root, @start );`;

    const request = new sql.Request(db);
    const result = await request
        .input("root", data.root)
        .input("privateKey", data.privateKey)
        .input("seed", data.seed)
        .input("next_root", data.next_root)
        .input("start", data.start)
        .query(query);

    return result.rowsAffected === 1;
};


export const createPaymentQueue = async (data) => {
    const delQuery = `
    Delete from [dbo].[paymentQueue];`;
    const delRequest = new sql.Request(db);
    await delRequest.query(delQuery);

    const query = `
		INSERT INTO [dbo].[paymentQueue] ([address],[value])
		values (@address, @value);`;

    const request = new sql.Request(db);
    const result = await request
        .input("address", data.address)
        .input("value", data.value)
        .query(query);

    return result.rowsAffected === 1;
};

export const createMAMChannel = async (data) => {
    const query = `
		INSERT INTO [dbo].[mam] ([id],[root],[seed],[next_root],[side_key],[start])
		values (@id, @root, @seed, @next_root, @side_key, @start );`;

    const request = new sql.Request(db);
    const result = await request
        .input("id", data.id)
        .input("root", data.root)
        .input("seed", data.seed)
        .input("next_root", data.next_root)
        .input("side_key", data.side_key)
        .input("start", data.start)
        .query(query);

    return result.rowsAffected === 1;
};
export const writeData = async (table, data) => {
    try {
        console.log('writeData', table, data);
        switch (table) {
            case 'user':
                await createUser(data);
                return;
            case 'wallet':
                await createWallet(data);
                return;
            case 'data':
                await createSensorData(data);
                return;
            case 'did':
                await createDID(data);
                return;
            case 'paymentQueue':
                await createPaymentQueue(data);
                return;
            case 'mam':
            default:
                await createMAMChannel(data);
                return;
        }
    } catch (error) {
        console.log('writeData', error);
        return null;
    }
};

export const readData = async (table, searchField = null) => {
    await connect();
    try {
        let query = `SELECT TOP 1 * FROM [dbo].[${table}] ORDER BY internal_id desc`;
        let result = null;
        if (searchField) {
            result = await db.request()
                .input('id', sql.VarChar(4000))
                .query(query);
        } else {
            await db.request()
                .query(query);
        }
        return result;
    } catch (error) {
        console.log('readData', error);
    }

};

export const readAllData = async (table) => {
    await connect();
    try {
        let query = `SELECT * FROM [dbo].[${table}] ORDER BY internal_id desc`;
        let result = await db.request().query(query);

        return result;
    } catch (error) {
        console.log('readAllData', error);
    }


};

export const removeData = async (table) => {
    await connect();
    try {
        let query = `Delete FROM [dbo].[${table}]`;
        let result = await db.request()
            .query(query);

        return result;
    } catch (error) {
        console.log('removeData', error);
    }
};