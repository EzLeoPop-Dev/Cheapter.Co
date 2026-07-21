-- CreateTable
CREATE TABLE "book_episodes" (
    "id" SERIAL NOT NULL,
    "bookId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "book_episodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "book_episodes_bookId_idx" ON "book_episodes"("bookId");

-- AddForeignKey
ALTER TABLE "book_episodes" ADD CONSTRAINT "book_episodes_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;
