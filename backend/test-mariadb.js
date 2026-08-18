const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'Aniket@123',
  database: 'qsr_db',
  connectionLimit: 10
});

pool.getConnection()
  .then(conn => {
    console.log("Connected successfully");
    conn.release();
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed:", err);
    process.exit(1);
  });
