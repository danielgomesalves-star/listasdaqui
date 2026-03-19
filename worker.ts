// worker.ts — PM2: pm2 start worker.ts --name listasdaqui-worker --interpreter tsx
import './jobs/workers/email.worker'
import './jobs/workers/conteudo.worker'
import './jobs/workers/plano.worker'

import { planoQueue } from './jobs/queues'

// Verificação diária às 8h
planoQueue.add('verificar-vencimentos', {}, {
  repeat: { cron: '0 8 * * *' },
  removeOnComplete: 10,
  removeOnFail: 5,
})

console.log('[Worker] Todos os workers iniciados.')
