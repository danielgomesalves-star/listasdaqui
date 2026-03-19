import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categorias = [
    // Residencial
    { nome: 'Eletricista', slug: 'eletricista' },
    { nome: 'Encanador', slug: 'encanador' },
    { nome: 'Pintor', slug: 'pintor' },
    { nome: 'Pedreiro', slug: 'pedreiro' },
    { nome: 'Carpinteiro', slug: 'carpinteiro' },
    { nome: 'Serralheiro', slug: 'serralheiro' },
    { nome: 'Jardineiro', slug: 'jardineiro' },
    { nome: 'Faxineira', slug: 'faxineira' },
    { nome: 'Dedetizadora', slug: 'dedetizadora' },
    { nome: 'Chaveiro', slug: 'chaveiro' },
    { nome: 'Ar-condicionado', slug: 'ar-condicionado' },
    { nome: 'Faz-tudo', slug: 'faz-tudo' },
    // Automotivo
    { nome: 'Mecânico', slug: 'mecanico' },
    { nome: 'Funilaria', slug: 'funilaria' },
    { nome: 'Borracharia', slug: 'borracharia' },
    { nome: 'Guincho', slug: 'guincho' },
    { nome: 'Reboque', slug: 'reboque' },
    // Beleza
    { nome: 'Cabeleireiro', slug: 'cabeleireiro' },
    { nome: 'Barbearia', slug: 'barbearia' },
    { nome: 'Manicure', slug: 'manicure' },
    { nome: 'Depilação', slug: 'depilacao' },
    { nome: 'Salão de Beleza', slug: 'salao-de-beleza' },
    // Saúde
    { nome: 'Massoterapeuta', slug: 'massoterapeuta' },
    { nome: 'Personal Trainer', slug: 'personal-trainer' },
    { nome: 'Fisioterapia', slug: 'fisioterapia' },
    { nome: 'Banho e Tosa', slug: 'banho-e-tosa' },
    { nome: 'Veterinário', slug: 'veterinario' },
    // Tech
    { nome: 'Assistência Técnica de Informática', slug: 'assistencia-técnica-de-informatica' },
    { nome: 'Assistência Técnica de Eletrodomésticos', slug: 'assistencia-técnica-de-eletrodomesticos' },
    // Profissional
    { nome: 'Advogado', slug: 'advogado' },
    { nome: 'Contador', slug: 'contador' },
    { nome: 'Fotógrafo', slug: 'fotografo' },
    { nome: 'Designer Gráfico', slug: 'designer-grafico' },
    { nome: 'Mudanças', slug: 'mudancas' },
    { nome: 'Impermeabilização', slug: 'impermeabilizacao' },
];

const capitais = [
    { nome: 'Brasília', uf: 'DF', slug: 'brasilia-df', populacao: 3015268 },
    { nome: 'São Paulo', uf: 'SP', slug: 'sao-paulo-sp', populacao: 12325232 },
    { nome: 'Rio de Janeiro', uf: 'RJ', slug: 'rio-de-janeiro-rj', populacao: 6747815 },
    { nome: 'Belo Horizonte', uf: 'MG', slug: 'belo-horizonte-mg', populacao: 2521564 },
    { nome: 'Curitiba', uf: 'PR', slug: 'curitiba-pr', populacao: 1948626 },
    { nome: 'Porto Alegre', uf: 'RS', slug: 'porto-alegre-rs', populacao: 1488252 },
    { nome: 'Salvador', uf: 'BA', slug: 'salvador-ba', populacao: 2886698 },
    { nome: 'Fortaleza', uf: 'CE', slug: 'fortaleza-ce', populacao: 2686612 },
    { nome: 'Recife', uf: 'PE', slug: 'recife-pe', populacao: 1653461 },
    { nome: 'Goiânia', uf: 'GO', slug: 'goiania-go', populacao: 1536097 },
    { nome: 'Belém', uf: 'PA', slug: 'belem-pa', populacao: 1499641 },
    { nome: 'Manaus', uf: 'AM', slug: 'manaus-am', populacao: 2219580 },
    { nome: 'Vitória', uf: 'ES', slug: 'vitoria-es', populacao: 365855 },
    { nome: 'Maceió', uf: 'AL', slug: 'maceio-al', populacao: 1025360 },
    { nome: 'Natal', uf: 'RN', slug: 'natal-rn', populacao: 890480 },
    { nome: 'São Luís', uf: 'MA', slug: 'sao-luis-ma', populacao: 1108975 },
    { nome: 'João Pessoa', uf: 'PB', slug: 'joao-pessoa-pb', populacao: 817511 },
    { nome: 'Teresina', uf: 'PI', slug: 'teresina-pi', populacao: 868075 },
    { nome: 'Aracaju', uf: 'SE', slug: 'aracaju-se', populacao: 664908 },
    { nome: 'Campo Grande', uf: 'MS', slug: 'campo-grande-ms', populacao: 906092 },
    { nome: 'Cuiabá', uf: 'MT', slug: 'cuiaba-mt', populacao: 618124 },
    { nome: 'Porto Velho', uf: 'RO', slug: 'porto-velho-ro', populacao: 539354 },
    { nome: 'Macapá', uf: 'AP', slug: 'macapa-ap', populacao: 512902 },
    { nome: 'Boa Vista', uf: 'RR', slug: 'boa-vista-rr', populacao: 419652 },
    { nome: 'Rio Branco', uf: 'AC', slug: 'rio-branco-ac', populacao: 413418 },
    { nome: 'Palmas', uf: 'TO', slug: 'palmas-to', populacao: 306296 },
    { nome: 'Florianópolis', uf: 'SC', slug: 'florianopolis-sc', populacao: 508826 },
    // Adding just a sampling of additional mid-sized cities to reach around 35 (to keep the seed manageable for now)
    { nome: 'Campinas', uf: 'SP', slug: 'campinas-sp', populacao: 1213792 },
    { nome: 'Guarulhos', uf: 'SP', slug: 'guarulhos-sp', populacao: 1392121 },
    { nome: 'São Bernardo do Campo', uf: 'SP', slug: 'sao-bernardo-do-campo-sp', populacao: 844483 },
    { nome: 'Ribeirão Preto', uf: 'SP', slug: 'ribeirao-preto-sp', populacao: 711825 },
    { nome: 'Uberlândia', uf: 'MG', slug: 'uberlandia-mg', populacao: 699097 },
    { nome: 'Sorocaba', uf: 'SP', slug: 'sorocaba-sp', populacao: 687352 },
    { nome: 'Londrina', uf: 'PR', slug: 'londrina-pr', populacao: 575377 },
    { nome: 'Joinville', uf: 'SC', slug: 'joinville-sc', populacao: 597658 }
];

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    for (const cat of categorias) {
        await prisma.servico.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                nome: cat.nome,
                slug: cat.slug,
            },
        });
    }
    console.log('✅ Categorias inseridas');

    for (const cid of capitais) {
        await prisma.cidade.upsert({
            where: { slug: cid.slug },
            update: {},
            create: {
                nome: cid.nome,
                uf: cid.uf,
                slug: cid.slug,
                populacao: cid.populacao,
            },
        });
    }
    console.log('✅ Cidades inseridas');

}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log('🏁 Seed finalizado');
    });
