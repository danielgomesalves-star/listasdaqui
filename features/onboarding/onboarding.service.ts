// features/onboarding/onboarding.service.ts
import { emailQueue } from '@/jobs/queues'

export async function enviarCadastroRecebido(email: string, nome: string) {
    await emailQueue.add('onboarding-recebido', {
        to: email,
        subject: 'Cadastro recebido — ListasDaqui',
        html: `
      <h2>Olá, \${nome}!</h2>
      <p>Seu cadastro foi recebido e está em análise. Aprovamos em até 24 horas úteis.</p>
      <p>Assim que aprovado você receberá um email com o link da sua ficha.</p>
    `
    })
}

export async function enviarAprovado(email: string, nome: string, urlFicha: string) {
    await emailQueue.add('onboarding-aprovado', {
        to: email,
        subject: '🎉 Sua ficha está no ar — ListasDaqui',
        html: `
      <h2>Parabéns, \${nome}!</h2>
      <p>Sua ficha foi aprovada e já está aparecendo no ListasDaqui.</p>
      <p><a href="\${urlFicha}">Ver minha ficha</a></p>
      <hr>
      <p><strong>Complete seu perfil para receber mais contatos:</strong></p>
      <ul>
        <li>Adicione uma foto profissional</li>
        <li>Escreva uma bio de 2-3 linhas</li>
        <li>Informe seu Instagram</li>
      </ul>
      <p><a href="https://listasdaqui.com.br/painel/">Acessar painel</a></p>
    `
    })

    // Agendar follow-ups para engajar caso prestador não complete o perfil
    // Observação: delay de dias em milissegundos
    await emailQueue.add('onboarding-dica-perfil',
        { to: email, nome },
        { delay: 3 * 24 * 60 * 60 * 1000 }
    )
    await emailQueue.add('onboarding-upgrade',
        { to: email, nome },
        { delay: 7 * 24 * 60 * 60 * 1000 }
    )
}

export const MOTIVOS_REJEICAO = {
    FOTO_INADEQUADA: 'Foto inadequada ou ausente',
    NOME_INVALIDO: 'Nome não parece ser real',
    WHATSAPP_INVALIDO: 'Número de WhatsApp inválido',
    CATEGORIA_ERRADA: 'Serviço cadastrado na categoria errada',
    BIO_OFENSIVA: 'Bio com linguagem inapropriada',
    DUPLICADO: 'Perfil duplicado já existe no sistema',
    INCOMPLETO: 'Dados insuficientes para aprovação',
    OUTRO: 'Outro motivo (ver detalhes)',
}
