import { getWeather } from '@/utils/weather'


export default async function WeatherWidget() {
  const data = await getWeather()

  if (!data) return null

  return (
    <div>
      <p>{data.temperature}°C</p>
      <p>{data.symbolCode}</p>
      <p>{data.windSpeed} m/s</p>
    </div>
  )
}
