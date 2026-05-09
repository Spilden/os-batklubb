export async function getTidevann() {
  try {
    const response = await fetch(
      'https://vannstand.kartverket.no/tideapi.php?lat=60.1529229&lon=5.4455994&fromtime=2026-05-08T00%3A00&totime=2026-05-10T00%3A00&datatype=tab&refcode=cd&place=&file=&lang=nn&interval=10&dst=0&tzone=&tide_request=locationdata',
    )
    if (!response.ok) {
      console.error('status', response.status, response.statusText)
    }
    const text = await response.text()

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
      'https://api.weather.com/v2/pws/observations/current?stationId=IOS291&format=json&units=m&apiKey=48585e11107848f8985e111078d8f8f9',
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
