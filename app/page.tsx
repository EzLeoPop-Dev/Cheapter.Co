import { connection } from 'next/server';

import { HomeContent } from './components/HomeContent';



export default async function Home() {
  // Keep inventory current after an admin changes stock.
  await connection();

  if (process.env.DATABASE_URL?.trim()) {
    const { prisma } = await import('@/src/lib/prisma');
    const [books, bestSellers] = await Promise.all([
      prisma.book.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.book.findMany({ orderBy: [{ reviewCount: 'desc' }, { rating: 'desc' }], take: 10 }),
    ]);

    const formatBook = (book: typeof books[number]) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      price: `฿${Number(book.price).toLocaleString('th-TH')}`,
      rating: book.rating ? Number(book.rating) : undefined,
      reviews: book.reviewCount.toLocaleString('en-US'),
      imageUrl: book.image ?? undefined,
      stock: book.stock,
    });

    return <HomeContent books={books.map(formatBook)} bestSellers={bestSellers.map(formatBook)} />;
  }
  const { createClient } = await import('@/src/lib/supabase/server');
  const supabaseClient = await createClient();
  const { data: booksData } = await supabaseClient.from('books').select('*').order('createdAt', { ascending: false }).limit(10);
  const safeBooksData = Array.isArray(booksData) ? booksData : [];
  const bestSellers = safeBooksData.slice().sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 10);

  return <HomeContent books={safeBooksData.slice(0, 10)} bestSellers={bestSellers} />;
}
