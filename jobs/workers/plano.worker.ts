import { Worker } from 'bullmq'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import { emailQueue } from '@/jobs/queues'
import { logger } from '@/lib/logger'
import { execSync } from 'child_process'
import { format, subHours } from 'date-fns'

new Worker(
  'plano',
  async (job) => {
    if (job.name === 'verificar-vencimentos') {
      const hoje = new Date()
      const em7dias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000)

      // Planos vencendo em 7 dias — aviso
      const aVencer = await prisma.planoLog.findMany({
        where: { status: 'PAGO', venceEm: { gte: hoje, lte: em7dias } },
        include: { prestador: { include: { user: true } } },
      })

      for (const log of aVencer) {
        await emailQueue.add('aviso-vencimento', {
          to: log.prestador.user.email,
          subject: 'Seu plano ListasDaqui vence em breve',
          html: `<p>Olá ${log.prestador.nome}, seu plano vence em ${log.venceEm?.toLocaleDateString('pt-BR')}.</p>`,
        })
      }

      // Planos expirados — rebaixar para GRATUITO
      const expirados = await prisma.planoLog.findMany({
        where: { status: 'PAGO', venceEm: { lt: hoje } },
        select: { id: true, prestadorId: true },
      })

      for (const { id, prestadorId } of expirados) {
        await prisma.$transaction([
          prisma.planoLog.update({ where: { id }, data: { status: 'EXPIRADO' } }),
          prisma.prestador.update({ where: { id: prestadorId }, data: { plano: 'GRATUITO' } }),
        ])
      }

      // Cadastros pendentes há +24h — alerta admin
      const pendentesMais24h = await prisma.prestador.count({
        where: {
          aprovado: false,
          ativo: true,
          createdAt: { lt: subHours(hoje, 24) },
        },
      })

      if (pendentesMais24h > 0) {
        await emailQueue.add('alerta-admin', {
          to: process.env.EMAIL_ADMIN,
          subject: `${pendentesMais24h} cadastros aguardando aprovação há +24h`,
          html: `<a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/prestadores/pendentes">Revisar agora</a>`,
        })
      }

      // Verificar backup do dia
      const hoje_str = format(hoje, 'yyyy-MM-dd')
      try {
        const count = execSync(
          `ls /var/backups/listasdaqui/db_${hoje_str}* 2>/dev/null | wc -l`
        ).toString().trim()
        if (count === '0') {
          await emailQueue.add('alerta-admin', {
            to: process.env.EMAIL_ADMIN,
            subject: 'ALERTA: Backup do banco não encontrado hoje',
            html: `<p>Nenhum backup encontrado para ${hoje_str}. Verificar crontab.</p>`,
          })
        }
      } catch {}

      logger.info({
        event: 'plano.verificacao.done',
        aVencer: aVencer.length,
        expirados: expirados.length,
        pendentesMais24h,
      })
    }
  },
  { connection: redis, concurrency: 1 }
)
