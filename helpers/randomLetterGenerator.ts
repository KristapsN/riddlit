const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const randomLetterGenerator = () => alphabet[Math.floor(Math.random() * alphabet.length)]
