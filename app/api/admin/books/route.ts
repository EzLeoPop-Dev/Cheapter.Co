import { prisma } from "@/src/lib/prisma";

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      include: {
        category: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      image: book.image,
      price: Number(book.price),
      stock: book.stock,
      stockStatus: book.stockStatus,
      bookType: book.bookType,
      categoryName: book.category?.name ?? null,
      createdAt: book.createdAt,
    }));

    return Response.json({ books: data });
  } catch (error) {
    console.error("GET /api/admin/books failed", error);
    return Response.json({ message: "Unable to load books" }, { status: 500 });
  }
}
