// run with: npx ts-node scripts/create-admin.ts

import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@listasdaqui.com.br'
    const senhaPlane = 'Admin123!'

    const exists = await prisma.adminUser.findUnique({ where: { email } })

    if (exists) {
        console.log(`Admin ${email} já existe no banco.`)
        return
    }

    const passwordHash = await hash(senhaPlane, 10)

    await prisma.adminUser.create({
        data: {
            email,
            passwordHash,
            nome: 'Administrador Master',
            ativo: true
        }
    })

    console.log(`✅ Super Admin criado com sucesso!`)
    console.log(`E-mail: ${email}`)
    console.log(`Senha:  ${senhaPlane}`)
    console.log(`Acesse painel em /admin`)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
