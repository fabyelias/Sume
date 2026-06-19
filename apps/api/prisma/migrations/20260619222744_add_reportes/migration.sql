-- CreateTable
CREATE TABLE "Reporte" (
    "id" TEXT NOT NULL,
    "movilId" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "foto" BOOLEAN NOT NULL DEFAULT false,
    "autor" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'abierto',
    "respuesta" TEXT,
    "respondidoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);
