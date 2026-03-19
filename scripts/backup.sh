#!/bin/bash
# scripts/backup.sh
# Backup script for ListasDaqui MySQL Database

DB_NAME="listasdaqui"
DB_USER="root"
# Senha via env ou config
DB_PASS=${DB_PASSWORD:-"root"}
BACKUP_DIR="/var/backups/listasdaqui"
DATA=$(date +%Y-%m-%d_%H-%M)
ARQUIVO="$BACKUP_DIR/db_$DATA.sql.gz"

mkdir -p "$BACKUP_DIR"

# Dump comprimido sem travar a tabela
mysqldump \
  --user="$DB_USER" \
  --password="$DB_PASS" \
  --single-transaction \
  --routines \
  --triggers \
  "$DB_NAME" | gzip > "$ARQUIVO"

echo "Backup criado: $ARQUIVO ($(du -sh $ARQUIVO | cut -f1))"

# Manter apenas os últimos 30 dias
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete

# Opcional: enviar cópia para storage externo S3, B2, etc.
# aws s3 cp "$ARQUIVO" s3://meu-bucket/listasdaqui/
