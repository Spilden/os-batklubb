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

export async function getWeather() {
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

    return {
      temperature: current.data.instant.details.air_temperature,
      windSpeed: current.data.instant.details.wind_speed,
      symbolCode:
      current.data.next_1_hours?.summary.symbol_code ??
        current.data.next_6_hours?.summary.symbol_code ??
        'cloudy'
    }

  } catch {
    return null
  }
}