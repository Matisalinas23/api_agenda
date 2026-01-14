-- CreateTable
CREATE TABLE "Nota" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "assignature" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "textColor" TEXT NOT NULL,
    "description" TEXT,
    "limitDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nota_pkey" PRIMARY KEY ("id")
);
