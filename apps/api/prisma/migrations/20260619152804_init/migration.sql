-- CreateTable
CREATE TABLE "Medico" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "especialidad" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "movilFijo" TEXT NOT NULL,
    "turno" TEXT NOT NULL,

    CONSTRAINT "Medico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Base" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "turno" TEXT NOT NULL,

    CONSTRAINT "Base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paramedico" (
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Paramedico_pkey" PRIMARY KEY ("nombre")
);

-- CreateTable
CREATE TABLE "Personal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "guardia" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "horas" INTEGER NOT NULL,
    "faltas" INTEGER NOT NULL,
    "tardes" INTEGER NOT NULL,

    CONSTRAINT "Personal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movil" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "km" INTEGER NOT NULL,
    "ultimaRevision" TEXT NOT NULL,
    "mecanica" JSONB NOT NULL,
    "electro" JSONB NOT NULL,
    "oxigeno" JSONB NOT NULL,
    "bolsos" JSONB NOT NULL,
    "dotDia" JSONB NOT NULL,
    "dotNoche" JSONB NOT NULL,

    CONSTRAINT "Movil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("key")
);
