#!/bin/bash
# deploy.sh — Instalação completa no CentOS 7 + CWP
# Rodar como root: bash deploy.sh

set -e
echo "🚀 ListasDaqui — Deploy CentOS 7 + CWP"

APP_DIR="/var/www/listasdaqui"
BACKUP_DIR="/var/backups/listasdaqui"
LOG_DIR="/var/log/pm2"

# ── 1. Node.js via NVM ────────────────────────────────────────────────────────
echo "📦 Instalando Node.js via NVM..."
if [ ! -d "$HOME/.nvm" ]; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20
echo "✅ Node $(node -v) instalado"

# ── 2. Redis ───────────────────────────────────────────────────────────────────
echo "📦 Instalando Redis..."
if ! command -v redis-server &> /dev/null; then
  yum install -y epel-release
  yum install -y redis
  systemctl enable redis
  systemctl start redis
fi
echo "✅ Redis $(redis-server --version | cut -d' ' -f3)"

# ── 3. Dependências nativas (sharp) ───────────────────────────────────────────
echo "📦 Instalando dependências nativas..."
yum install -y libjpeg-turbo-devel libpng-devel libwebp-devel gcc-c++ make

# ── 4. PM2 ────────────────────────────────────────────────────────────────────
echo "📦 Instalando PM2..."
npm install -g pm2
pm2 startup systemd -u root --hp /root
mkdir -p "$LOG_DIR"

# ── 5. Diretórios da aplicação ────────────────────────────────────────────────
echo "📁 Criando diretórios..."
mkdir -p "$APP_DIR"
mkdir -p "$APP_DIR/uploads/fotos"
mkdir -p "$BACKUP_DIR"
mkdir -p /var/log/listasdaqui
chmod 755 "$APP_DIR/uploads"

# ── 6. Clonar / copiar código ─────────────────────────────────────────────────
echo "📂 Copiando código..."
# Se usar Git:
# git clone https://github.com/SEU_USUARIO/listasdaqui.git "$APP_DIR"
# cd "$APP_DIR" && git pull
# Se copiar manual:
cp -r . "$APP_DIR" 2>/dev/null || true
cd "$APP_DIR"

# ── 7. Instalar dependências npm ──────────────────────────────────────────────
echo "📦 npm install..."
npm install --production=false

# ── 8. Gerar Prisma client ────────────────────────────────────────────────────
echo "🗄️ Gerando Prisma client..."
npx prisma generate

# ── 9. Configurar .env ────────────────────────────────────────────────────────
if [ ! -f "$APP_DIR/.env" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env"
  echo ""
  echo "⚠️  ATENÇÃO: Configure o arquivo .env antes de continuar!"
  echo "   nano $APP_DIR/.env"
  echo ""
  echo "Variáveis obrigatórias:"
  echo "  DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET"
  echo "  REDIS_URL, ANTHROPIC_API_KEY, RESEND_API_KEY"
  echo "  EMAIL_FROM, EMAIL_ADMIN, NEXT_PUBLIC_APP_URL"
  echo ""
  read -p "Pressione ENTER após configurar o .env..."
fi

# ── 10. Migration e seed ──────────────────────────────────────────────────────
echo "🗄️ Executando migration..."
npx prisma migrate deploy

echo "🌱 Executando seed..."
npx tsx scripts/seed.ts

# ── 11. Build Next.js ─────────────────────────────────────────────────────────
echo "🔨 Build Next.js..."
npm run build

# ── 12. Nginx ─────────────────────────────────────────────────────────────────
echo "⚙️ Configurando Nginx..."
cp "$APP_DIR/nginx.conf" /etc/nginx/conf.d/listasdaqui.conf
nginx -t && systemctl reload nginx

# ── 13. Backup crontab ────────────────────────────────────────────────────────
echo "⏰ Configurando backup automático..."
cat > /usr/local/bin/backup-listasdaqui.sh << 'BACKUP_SCRIPT'
#!/bin/bash
DB_NAME="listasdaqui"
DB_USER="listasdaqui_user"
DB_PASS="$(grep DATABASE_URL /var/www/listasdaqui/.env | cut -d: -f3 | cut -d@ -f1)"
BACKUP_DIR="/var/backups/listasdaqui"
DATA=$(date +%Y-%m-%d_%H-%M)
ARQUIVO="$BACKUP_DIR/db_$DATA.sql.gz"
mkdir -p "$BACKUP_DIR"
mysqldump --user="$DB_USER" --password="$DB_PASS" --single-transaction --routines "$DB_NAME" | gzip > "$ARQUIVO"
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
echo "$(date) Backup: $ARQUIVO ($(du -sh $ARQUIVO | cut -f1))" >> /var/log/listasdaqui/backup.log
BACKUP_SCRIPT
chmod +x /usr/local/bin/backup-listasdaqui.sh

# Adicionar ao crontab se não existir
(crontab -l 2>/dev/null | grep -v backup-listasdaqui; echo "0 3 * * * /usr/local/bin/backup-listasdaqui.sh") | crontab -

# ── 14. PM2 start ─────────────────────────────────────────────────────────────
echo "🟢 Iniciando processos PM2..."
cd "$APP_DIR"
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "✅ Deploy concluído!"
echo ""
echo "Próximos passos:"
echo "  1. Verificar saúde: curl https://listasdaqui.com.br/api/health"
echo "  2. Submeter sitemap: https://search.google.com/search-console"
echo "  3. Configurar UptimeRobot para monitorar /api/health"
echo "  4. Alterar senha do admin em /admin/"
echo "  5. Gerar conteúdo editorial: admin → SEO → Gerar conteúdo"
echo ""
echo "PM2 status:"
pm2 list
