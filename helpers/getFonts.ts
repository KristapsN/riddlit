export const fontCall = async () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONT_API_KEY

  const fonts = ['Open+Sans', 'Roboto',
    'DynaPuff', 'Pacifico', 'Delius', 'Comic Relief', 'Meow Script', 'Delius Unicase', 'Emilys Candy'
  ]
  const fontUrlBase = [`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`]
  fonts.map((font) => { fontUrlBase.push(`&family=${font}`) })
  const response = await fetch(fontUrlBase.join(''))
  const data = await response.json()

  return data
}