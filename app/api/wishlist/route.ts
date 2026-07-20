import { prisma } from "@/src/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/src/lib/supabase/server";

type WishlistBookResponse = {
  id: number;
  title: string;
  author: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

type AuthenticatedWishlistResponse = {
  authenticated: true;
  books: WishlistBookResponse[];
  ids: number[];
};

type UnauthenticatedWishlistResponse = {
  authenticated: false;
  books: WishlistBookResponse[];
  ids: number[];
};

function parseBookId(value: unknown): number | null {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isInteger(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

async function getCurrentAppUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: authUser },
    error,
  } = await supabase.auth.getUser();

  if (error || !authUser || !authUser.email) {
    return null;
  }

  const email = authUser.email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (existing) {
    return existing;
  }

  const fallbackName =
    (typeof authUser.user_metadata?.full_name === "string" && authUser.user_metadata.full_name.trim()) ||
    email.split("@")[0] ||
    "User";

  try {
    return await prisma.user.create({
      data: {
        email,
        name: fallbackName,
        passwordHash: "supabase-auth",
      },
      select: { id: true, email: true },
    });
  } catch {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
  }
}

async function listWishlist(userId: string): Promise<AuthenticatedWishlistResponse> {
  const rows = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          author: true,
          price: true,
          image: true,
          stock: true,
          bookType: true,
        },
      },
    },
  });

  const books: WishlistBookResponse[] = rows.map((row) => ({
    id: row.book.id,
    title: row.book.title,
    author: row.book.author,
    price: Number(row.book.price),
    imageUrl: row.book.image,
    quantity: row.book.stock,
    bookType: row.book.bookType,
  }));

  return {
    authenticated: true,
    books,
    ids: books.map((book) => book.id),
  };
}

export async function GET() {
  const appUser = await getCurrentAppUser();

  if (!appUser) {
    const response: UnauthenticatedWishlistResponse = {
      authenticated: false,
      books: [],
      ids: [],
    };
    return Response.json(response);
  }

  const data = await listWishlist(appUser.id);
  return Response.json(data);
}

export async function POST(request: Request) {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  let bookId: number | null = null;
  try {
    const body = (await request.json()) as { bookId?: unknown };
    bookId = parseBookId(body.bookId);
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  if (!bookId) {
    return Response.json({ message: "bookId is required" }, { status: 400 });
  }

  const existingBook = await prisma.book.findUnique({
    where: { id: bookId },
    select: { id: true },
  });

  if (!existingBook) {
    return Response.json({ message: "Book not found" }, { status: 404 });
  }

  await prisma.wishlistItem.upsert({
    where: {
      userId_bookId: {
        userId: appUser.id,
        bookId,
      },
    },
    create: {
      userId: appUser.id,
      bookId,
    },
    update: {},
  });

  const data = await listWishlist(appUser.id);
  return Response.json(data);
}

export async function DELETE(request: Request) {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const bookId = parseBookId(searchParams.get("bookId"));

  if (!bookId) {
    return Response.json({ message: "bookId is required" }, { status: 400 });
  }

  await prisma.wishlistItem.deleteMany({
    where: {
      userId: appUser.id,
      bookId,
    },
  });

  const data = await listWishlist(appUser.id);
  return Response.json(data);
}