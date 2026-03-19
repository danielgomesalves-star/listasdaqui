-- CreateTable
CREATE TABLE `Prestador` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NOT NULL,
    `bio` VARCHAR(191) NULL,
    `instagram` VARCHAR(191) NULL,
    `foto` VARCHAR(191) NULL,
    `plano` ENUM('GRATUITO', 'VERIFICADO', 'DESTAQUE') NOT NULL DEFAULT 'GRATUITO',
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `servicoId` VARCHAR(191) NOT NULL,
    `cidadeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Servico` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `icone` VARCHAR(191) NULL,
    `descricao` VARCHAR(191) NULL,

    UNIQUE INDEX `Servico_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cidade` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `uf` VARCHAR(191) NOT NULL,
    `populacao` INTEGER NULL,

    UNIQUE INDEX `Cidade_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Avaliacao` (
    `id` VARCHAR(191) NOT NULL,
    `prestadorId` VARCHAR(191) NOT NULL,
    `nota` INTEGER NOT NULL,
    `texto` VARCHAR(191) NULL,
    `aprovado` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Prestador` ADD CONSTRAINT `Prestador_servicoId_fkey` FOREIGN KEY (`servicoId`) REFERENCES `Servico`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestador` ADD CONSTRAINT `Prestador_cidadeId_fkey` FOREIGN KEY (`cidadeId`) REFERENCES `Cidade`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Avaliacao` ADD CONSTRAINT `Avaliacao_prestadorId_fkey` FOREIGN KEY (`prestadorId`) REFERENCES `Prestador`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
