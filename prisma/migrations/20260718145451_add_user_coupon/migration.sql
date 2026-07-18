-- CreateTable
CREATE TABLE "user_coupons" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "collectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "user_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_coupons_userId_idx" ON "user_coupons"("userId");

-- CreateIndex
CREATE INDEX "user_coupons_promotionId_idx" ON "user_coupons"("promotionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_coupons_userId_promotionId_key" ON "user_coupons"("userId", "promotionId");

-- AddForeignKey
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_coupons" ADD CONSTRAINT "user_coupons_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
