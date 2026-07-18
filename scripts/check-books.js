require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const countResult = await client.query('SELECT COUNT(*)::int AS count FROM "books"');
  const latestResult = await client.query(
    'SELECT "id", "title", "author" FROM "books" ORDER BY "id" DESC LIMIT 5',
  );

  const lines = [`books_count=${countResult.rows[0].count}`, 'latest_books:'];
  for (const row of latestResult.rows) {
    lines.push(`${row.id} | ${row.title} | ${row.author}`);
  }

  const outPath = path.join(__dirname, 'check-books.out.txt');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
