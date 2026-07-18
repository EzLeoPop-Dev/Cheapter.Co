require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing');
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const seedSqlPath = path.join(__dirname, '..', 'prisma', 'seed-books.sql');
  const seedSql = fs.readFileSync(seedSqlPath, 'utf8');

  await client.connect();
  await client.query('BEGIN');
  await client.query(seedSql);
  await client.query('COMMIT');

  const countRes = await client.query('SELECT COUNT(*)::int AS count FROM "books"');
  const latestRes = await client.query('SELECT "id", "title", "author" FROM "books" ORDER BY "id" DESC LIMIT 5');

  console.log(`books_count=${countRes.rows[0].count}`);
  for (const row of latestRes.rows) {
    console.log(`${row.id} | ${row.title} | ${row.author}`);
  }

  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
