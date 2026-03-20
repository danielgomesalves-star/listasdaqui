# Skill: Deploy para Produção

## Contexto do servidor

| Item | Valor |
|---|---|
| OS | CentOS 7 |
| glibc | 2.17 (2012) |
| Node.js | v20.11.1 |
| Processo | PM2 cluster |
| SSH porta | 4360 |
| IP | 167.114.209.181 |
| Path | /var/www/listasdaqui |

## Limitação crítica

O SWC (compilador nativo do Next.js 14) requer **glibc 2.28+**.
O servidor tem glibc 2.17 → `npm run build` no servidor causa **SIGSEGV** imediato.

**O build SEMPRE deve ser feito localmente (Windows) e o `.next` enviado via PSCP.**

## Fluxo de deploy

### Passo 1 — Commit e push
```bash
git add .
git commit -m "descrição"
git push
```

### Passo 2 — Build local (PowerShell)
```bash
cd "c:\Users\Dell\Desktop\Lista Daqui\listasdaqui"
npm run build
```
Aguardar `✓ Compiled successfully` com 35 páginas.

### Passo 3 — Upload do .next (PowerShell)
```bash
pscp -P 4360 -r .next root@167.114.209.181:/var/www/listasdaqui/
```
Digitar a senha do servidor quando solicitada. Upload leva ~1–2 min.

### Passo 4 — Restart no servidor (PuTTY)
```bash
pm2 restart listasdaqui-app && pm2 logs listasdaqui-app --lines 10 --nostream
```
Verificar que aparece `✓ Ready in Xms`.

### Passo 5 — Verificação
```bash
curl -I https://listasdaqui.com.br
```
Deve retornar `HTTP/2 200`.

## Processos PM2

| id | nome | modo | função |
|---|---|---|---|
| 0 | listasdaqui-app | cluster | Next.js web server |
| 1 | listasdaqui-worker | fork | Jobs de background (BullMQ) |

## Notas

- `listasdaqui-worker` crasha com `DATABASE_URL undefined` — issue separado, não afeta o site
- Para reiniciar apenas o worker: `pm2 restart listasdaqui-worker`
- Solução definitiva do SIGSEGV: migrar servidor para Rocky Linux 8 / Ubuntu 22.04 (glibc 2.28+)
