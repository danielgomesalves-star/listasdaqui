---
description: Guia de deploy e configuração do ambiente do servidor CPanel para o projeto ListasDaqui
---

# Skill: Deploy & Configuração de Servidor — ListasDaqui

## Contexto do Servidor

- **Provedor:** CPanel (Hostinger ou similar)
- **Sistema:** Linux (CentOS/CloudLinux)
- **Node.js:** v20.11.1
- **Gerenciador de Processos:** PM2
- **Banco de Dados:** MySQL via CPanel
- **App Path:** `/var/www/listasdaqui`

---

## Credenciais do Banco de Dados

> ⚠️ As credenciais do banco são gerenciadas pelo **CPanel → MySQL® Databases**.  
> O usuário `root` do MySQL **não funciona** neste servidor — sempre use o usuário específico criado no CPanel.

| Campo   | Valor           |
|---------|-----------------|
| Host    | `localhost`     |
| Porta   | `3306`          |
| Banco   | `listadaq_bd`   |
| Usuário | `listadaq_usr`  |
| Senha   | *(definida no CPanel — ver abaixo)* |

### Formato correto do DATABASE_URL no servidor:
```
DATABASE_URL="mysql://listadaq_usr:SENHA@localhost:3306/listadaq_bd"
```

### Como redefinir a senha do banco (CPanel):
1. Acesse: `https://listasdaqui.com.br:2083` (ou IP do servidor na porta 2083)
2. Vá em **MySQL® Databases → MySQL Users**
3. Clique em **Change Password** para `listadaq_usr`
4. Atualize o `.env` no servidor (ver abaixo)

---

## Arquivo .env do Servidor

O `.env` está em `/var/www/listasdaqui/.env` e **nunca vai para o Git** (está no .gitignore).

Para editar:
```bash
nano /var/www/listasdaqui/.env
```

Estrutura mínima necessária:
```
DATABASE_URL="mysql://listadaq_usr:SENHA@localhost:3306/listadaq_bd"
JWT_SECRET="valor_aqui"
JWT_REFRESH_SECRET="valor_aqui"
ANTHROPIC_API_KEY="sk-ant-..."
REDIS_URL="redis://localhost:6379"
```

Para verificar se o banco conecta após editar:
```bash
mysql -u listadaq_usr -pSENHA listadaq_bd -e "SHOW TABLES;"
```

---

## Estratégia de Deploy

> ⚠️ O servidor **não tem memória suficiente para rodar `npm run build`** em produção.  
> O build é feito **localmente** e enviado para o servidor via **pscp**.

> ⚠️ **IMPORTANTE:** O `.env` nunca vai para o Git. Nunca commitar o `.env`.  
> Se alguém por acidente fizer `git add -f .env`, desfaça com: `git rm --cached .env && git commit -m "fix: remove .env from git"`

### Fluxo de deploy completo (toda vez que houver mudança de código):

**1. Na máquina local (Windows):**
```powershell
# Na pasta do projeto:
cd "c:\Users\Dell\Desktop\Lista Daqui\listasdaqui"

# Buildar localmente
npm run build

# Enviar a pasta .next para o servidor via pscp (não commitar no Git)
pscp -P 4360 -r .next root@167.114.209.181:/var/www/listasdaqui/

# Commitar apenas o código-fonte (sem .next)
git add .
git commit -m "deploy: descricao das mudancas"
git push
```

**2. No servidor (via SSH/PuTTY) — ORDEM CRÍTICA:**
```bash
cd /var/www/listasdaqui

# PASSO 1: Atualizar o código-fonte (schema.prisma, etc.)
# DEVE ser feito ANTES do prisma generate
git fetch --all
git reset --hard origin/main

# PASSO 2: Se houve mudança no schema.prisma, regenerar o Prisma Client
# SEMPRE após o git reset e ANTES do pm2 restart
npx prisma generate

# PASSO 3: Verificar o .env (git reset não toca o .env pois está no .gitignore)
cat /var/www/listasdaqui/.env

# Se o .env foi perdido, recriar:
cat > /var/www/listasdaqui/.env << 'EOF'
DATABASE_URL="mysql://listadaq_usr:SENHA@localhost:3306/listadaq_bd"
JWT_SECRET="string_com_no_minimo_32_caracteres_aqui"
JWT_REFRESH_SECRET="outra_string_com_no_minimo_32_caracteres"
ANTHROPIC_API_KEY="sk-ant-..."
REDIS_URL="redis://localhost:6379"
EOF

# PASSO 4: Reiniciar com --update-env para recarregar variáveis de ambiente
pm2 restart all --update-env
```

Sem `npm install` e sem `npm run build` no servidor.

> ⚠️ **ATENÇÃO com mudanças de schema:** Se você alterou o `prisma/schema.prisma`,
> o `git reset` DEVE acontecer ANTES do `npx prisma generate`. Caso contrário,
> o Prisma Client será gerado com o schema antigo e causará `PrismaClientValidationError`
> com campos como `Unknown field` mesmo que o banco já tenha as colunas corretas.

---

## Diagnóstico de Problemas Comuns

### "Falha ao consultar banco" / `PrismaClientInitializationError`
**Causa:** `.env` com credenciais erradas ou usuário `root` (que não funciona no CPanel).

```bash
# Testar credenciais:
mysql -u listadaq_usr -pSENHA listadaq_bd -e "SHOW TABLES;"

# Se falhar, redefinir senha no CPanel e atualizar .env
```

### `Next.js build worker exited with code: null and signal: SIGSEGV`
**Causa:** Build feito no servidor (sem memória suficiente) ou módulo nativo incompatível (`sharp` darwin vs linux).

**Solução:** Sempre buildar localmente e commitar o `.next/`. Nunca buildar no servidor.

### `error: Your local changes to the following files would be overwritten by merge`
**Causa:** Servidor tem arquivos modificados localmente que conflitam com o `git pull`.

```bash
git fetch --all
git reset --hard origin/main
# Depois re-edite o .env se necessário (git reset não reseta .env pois está no .gitignore)
pm2 restart all
```

### Bad Gateway 502 (Cloudflare)
**Causa:** PM2 travou ou o app crashou.

```bash
pm2 logs listasdaqui-app --lines 50
pm2 restart all
```

---

## Comandos Úteis do Servidor

```bash
# Ver status dos processos
pm2 list

# Ver logs em tempo real
pm2 logs listasdaqui-app

# Reiniciar tudo
pm2 restart all

# Ver uso de memória/cpu
pm2 monit

# Verificar banco de dados
mysql -u listadaq_usr -pSENHA listadaq_bd -e "SHOW TABLES;"

# Ver .env atual
cat /var/www/listasdaqui/.env

# Verificar porta do MySQL
netstat -tlnp | grep mysql

# Puxar última versão do git
cd /var/www/listasdaqui && git pull origin main && pm2 restart all
```
