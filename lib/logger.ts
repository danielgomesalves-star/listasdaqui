import pino from 'pino'

// Fallback do NODE_ENV pro caso de não estar definido
const isDev = process.env.NODE_ENV !== 'production'

export const logger = pino({
    level: isDev ? 'debug' : 'info',
    transport: isDev
        ? {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
            },
        }
        : undefined,
    formatters: {
        level: (label) => {
            return { level: label.toUpperCase() }
        },
    },
})
