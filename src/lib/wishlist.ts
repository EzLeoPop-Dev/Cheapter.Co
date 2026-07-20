export type WishlistBook = {
  id: number;
  title: string;
  author: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  bookType?: string;
};

export type WishlistApiResponse = {
  authenticated: boolean;
  books: WishlistBook[];
  ids: number[];
};

const WISHLIST_KEY = "wishlist_books_v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function getWishlistBooks(): WishlistBook[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(WISHLIST_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) =>
      item &&
      typeof item.id === "number" &&
      typeof item.title === "string" &&
      typeof item.author === "string" &&
      typeof item.price === "number",
    ) as WishlistBook[];
  } catch {
    return [];
  }
}

function setWishlistBooks(books: WishlistBook[]): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(books));
}

export function isBookInWishlist(bookId: number): boolean {
  return getWishlistBooks().some((book) => book.id === bookId);
}

export function addToWishlist(book: WishlistBook): WishlistBook[] {
  const current = getWishlistBooks();
  if (current.some((item) => item.id === book.id)) {
    return current;
  }

  const next = [book, ...current];
  setWishlistBooks(next);
  return next;
}

export function removeFromWishlist(bookId: number): WishlistBook[] {
  const next = getWishlistBooks().filter((book) => book.id !== bookId);
  setWishlistBooks(next);
  return next;
}

export function toggleWishlistBook(book: WishlistBook): { added: boolean; books: WishlistBook[] } {
  const exists = isBookInWishlist(book.id);
  if (exists) {
    return {
      added: false,
      books: removeFromWishlist(book.id),
    };
  }

  return {
    added: true,
    books: addToWishlist(book),
  };
}

export async function fetchWishlistFromApi(): Promise<WishlistApiResponse> {
  const response = await fetch("/api/wishlist", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load wishlist");
  }

  return (await response.json()) as WishlistApiResponse;
}

export async function addWishlistToApi(bookId: number): Promise<WishlistApiResponse> {
  const response = await fetch("/api/wishlist", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bookId }),
  });

  if (!response.ok) {
    throw new Error("Unable to add wishlist item");
  }

  return (await response.json()) as WishlistApiResponse;
}

export async function removeWishlistFromApi(bookId: number): Promise<WishlistApiResponse> {
  const response = await fetch(`/api/wishlist?bookId=${bookId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Unable to remove wishlist item");
  }

  return (await response.json()) as WishlistApiResponse;
}
