export async function getTidevann() {
  try {
    const now = new Date()
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 2)
    const format = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T00:00`

    const response = await fetch(
      `https://vannstand.kartverket.no/tideapi.php?lat=60.1529229&lon=5.4455994&fromtime=${encodeURIComponent(format(now))}&totime=${encodeURIComponent(format(tomorrow))}&datatype=tab&refcode=cd&place=&file=&lang=nn&interval=10&dst=0&tzone=&tide_request=locationdata`,
    )
    if (!response.ok) {
      console.error('status', response.status, response.statusText)
    }
    const text = await response.text()
    console.log(text)
    return [...text.matchAll(/<waterlevel value="([\d.]+)" time="([^"]+)" flag="([^"]+)"/g)].map(
      (m) => ({
        verdi: parseFloat(m[1]),
        tid: new Date(m[2]),
        flag: m[3],
      }),
    )
  } catch (e) {
    console.error(e)
    return null
  }
}

export async function getWind() {
  try {
    const wuResponse = await fetch(
      `https://api.weather.com/v2/pws/observations/current?stationId=IOS291&format=json&units=m&apiKey=${process.env.WEATHER_UNDERGROUND_API_KEY}`,
    )
    if (!wuResponse.ok) {
      console.error('status', wuResponse.status, wuResponse.statusText)
    }

    const wuData = await wuResponse.json()
    return wuData.observations[0]
  } catch (e) {
    console.error(e)
    return null
  }
}

type MetTimeseries = {
  time: string
  data: {
    instant: {
      details: {
        air_temperature: number
        wind_speed: number
      }
    }
    next_1_hours?: {
      summary: { symbol_code: string }
    }
    next_6_hours?: {
      summary: { symbol_code: string }
    }
  }
}

type MetResponse = {
  properties: {
    timeseries: MetTimeseries[]
  }
}

export async function getWeather(days: number) {
  try {
    const res = await fetch(
      'https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=60.1893&lon=5.4674',
      {
        headers: {
          'User-Agent': `OsBatklubb/1.0 ${process.env.WEATHER_CONTACT_EMAIL}`,
        },
        next: { revalidate: 1800 },
      },
    )
    if (!res.ok) return null

    const data: MetResponse = await res.json()

    const current = data.properties.timeseries[0]
    const currentEntry = {
      time: current.time,
      temperature: current.data.instant.details.air_temperature,
      windSpeed: current.data.instant.details.wind_speed,
      symbolCode:
        current.data.next_1_hours?.summary.symbol_code ??
        current.data.next_6_hours?.summary.symbol_code ??
        'cloudy',
    }

    const today = new Date().toISOString().split('T')[0]
    const upcoming = data.properties.timeseries
      .filter((t) => t.time.includes('T12:00') && t.time.split('T')[0] > today)
      .slice(0, days - 1)
      .map((t) => ({
        time: t.time,
        temperature: t.data.instant.details.air_temperature,
        windSpeed: t.data.instant.details.wind_speed,
        symbolCode:
          t.data.next_1_hours?.summary.symbol_code ??
          t.data.next_6_hours?.summary.symbol_code ??
          'cloudy',
      }))

    return [currentEntry, ...upcoming]
  } catch {
    return null
  }
}

type WeatherInfo = {
  label: string
  icon: string
}

export function getWeatherInfo(symbolCode: string): WeatherInfo {
  if (symbolCode.startsWith('clearsky')) return { label: 'Klarvær', icon: 'sun' }
  if (symbolCode.startsWith('fair') || symbolCode.startsWith('partlycloudy'))
    return { label: 'Delvis skyet', icon: 'cloud-sun' }
  if (symbolCode.startsWith('cloudy')) return { label: 'Skyet', icon: 'cloud' }
  if (symbolCode.startsWith('rain') || symbolCode.startsWith('lightrain'))
    return { label: 'Regn', icon: 'cloud-rain' }
  if (symbolCode.startsWith('sleet')) return { label: 'Sludd', icon: 'cloud-rain' }
  if (symbolCode.startsWith('snow')) return { label: 'Snø', icon: 'cloud-snow' }
  if (symbolCode.startsWith('thunder')) return { label: 'Tordenvær', icon: 'cloud-lightning' }
  if (symbolCode.startsWith('fog')) return { label: 'Tåke', icon: 'cloud' }
  return { label: 'Skyet', icon: 'cloud' }
}
