-- CreateTable
CREATE TABLE "AccountReactivationToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "AccountReactivationToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountReactivationToken_token_key" ON "AccountReactivationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AccountReactivationToken_userId_key" ON "AccountReactivationToken"("userId");

-- AddForeignKey
ALTER TABLE "AccountReactivationToken" ADD CONSTRAINT "AccountReactivationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
