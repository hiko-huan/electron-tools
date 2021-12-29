import { join } from 'path'

export const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:${process.env.PORT}`
    : `file://${join(__dirname, '..', 'renderer', 'index.html')}`
