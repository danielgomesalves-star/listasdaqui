// ecosystem.config.js — PM2
module.exports = {
  apps: [
    {
      name:   'listasdaqui-app',
      script: 'node_modules/.bin/next',
      args:   'start',
      cwd:    '/var/www/listasdaqui',
      env: {
        NODE_ENV: 'production',
        PORT:     3000,
      },
      instances:    1,
      autorestart:  true,
      watch:        false,
      max_memory_restart: '1G',
      error_file:   '/var/log/pm2/listasdaqui-app-error.log',
      out_file:     '/var/log/pm2/listasdaqui-app-out.log',
    },
    {
      name:   'listasdaqui-worker',
      script: 'worker.ts',
      interpreter:      'npx',
      interpreter_args: 'tsx',
      cwd:    '/var/www/listasdaqui',
      env: {
        NODE_ENV: 'production',
      },
      instances:   1,
      autorestart: true,
      watch:       false,
      max_memory_restart: '512M',
      error_file:  '/var/log/pm2/listasdaqui-worker-error.log',
      out_file:    '/var/log/pm2/listasdaqui-worker-out.log',
    },
  ],
}
