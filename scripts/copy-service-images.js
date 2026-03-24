const fs = require('fs')
const path = require('path')

function slugify(text) {
    return text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

const FONTE = path.join(__dirname, '../../Bando Imagens Serviços')
const DESTINO = path.join(__dirname, '../public/servicos')

if (!fs.existsSync(DESTINO)) fs.mkdirSync(DESTINO, { recursive: true })

const arquivos = fs.readdirSync(FONTE).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f))

const TODOS_SERVICOS = [
    'Alarme e Câmeras', 'Ar Condicionado', 'Arquiteto', 'Assentador de Pisos',
    'Auto Socorro 24Hr', 'Automação Residencial', 'Caça Vazamentos', 'Caçamba',
    'Calheiro', 'Capinador', 'Carpinteiro', 'Carreto e Mudança', 'Chaveiro',
    'Dedetização', 'Desentupidora', 'Eletricista', 'Empreiteiro', 'Encanador',
    'Engenheiro Civil', 'Engenheiro Elétrico', 'Entregador', 'Esquadria de Alumínio',
    'Faxineiro', 'Gesseiro', 'Higienização de Sofá', 'Impermeabilização',
    'Internet Banda Larga', 'Jardineiro', 'Limpeza de Caixa Dagua', 'Limpeza Pós Obra',
    'Marceneiro', 'Marido de Aluguel', 'Marmoraria', 'Montador de Móveis', 'Motorista',
    'Painel Solar', 'Pedreiro', 'Pintor', 'Piscineiro', 'Podador de Árvores',
    'Portão Eletrônico', 'Serralheiro', 'Tapeceiro', 'Telhadista', 'Terraplanagem',
    'Técnico de Celulares', 'Técnico de Eletrodomésticos', 'Técnico de Informática',
    'Toldos', 'Topografia', 'Vidraceiro'
]

console.log(`\n📦 Copiando imagens de "${FONTE}" → "${DESTINO}"\n`)

let copiados = 0
arquivos.forEach(arquivo => {
    const nome = path.basename(arquivo, path.extname(arquivo))
    const ext = path.extname(arquivo).toLowerCase()
    const slug = slugify(nome) + ext
    const origem = path.join(FONTE, arquivo)
    const dest = path.join(DESTINO, slug)
    fs.copyFileSync(origem, dest)
    console.log(`  ✅ ${arquivo} → servicos/${slug}`)
    copiados++
})

console.log(`\n✅ ${copiados} imagem(ns) copiada(s)\n`)
console.log('📋 Status por serviço:')

TODOS_SERVICOS.forEach(nome => {
    const slug = slugify(nome)
    const existe = fs.existsSync(path.join(DESTINO, slug + '.png'))
        || fs.existsSync(path.join(DESTINO, slug + '.jpg'))
        || fs.existsSync(path.join(DESTINO, slug + '.webp'))
    console.log(`  ${existe ? '✅' : '⬜'} ${nome} → ${slug}`)
})
