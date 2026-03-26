import mysql from 'mysql2/promise';

// Define the shape of our global object for hot reload consistency in development
declare global {
  var _mysqlPool: mysql.Pool | undefined;
}

function createPool(): mysql.Pool {
  const connectionUri = process.env.DATABASE_URL;

  if (connectionUri) {
    // Clean Prisma-specific SSL params that mysql2 doesn't recognize
    let cleanedUri = connectionUri;
    try {
      const url = new URL(connectionUri);
      url.searchParams.delete("ssl-mode");
      url.searchParams.delete("sslaccept");
      cleanedUri = url.toString();
    } catch (e) {
      console.warn("[DB] URI parsing error:", e);
    }

    return mysql.createPool({
      uri: cleanedUri,
      ssl: {
        rejectUnauthorized: false
      },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    } as any);
  } else {
    // Fallback for local development
    return mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "hotel_db",
      connectionLimit: 10,
      waitForConnections: true,
    });
  }
}

// Preserve the connection pool across hot reloads in development
if (!global._mysqlPool) {
  global._mysqlPool = createPool();
}

export const pool = global._mysqlPool;

export default pool;
