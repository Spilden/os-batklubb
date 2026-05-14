import { getWeather, getWeatherInfo} from '@/utils/weather'
import { Cloud, CloudLightning, CloudRain, CloudSnow, Sun, LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  sun: Sun,
  cloud: Cloud,
  'cloud-sun': Cloud,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
}

export default async function WeatherWidget() {
  const data = await getWeather()

  if (!data) return null

  const {label, icon} = getWeatherInfo(data.symbolCode)
  const Icon = iconMap[icon] ?? Cloud

  return (
    <div>
      <Icon></Icon>
      <p>{data.temperature}°C</p>
      <p>{label}</p>
      <p>{data.windSpeed} m/s</p>
    </div>
  )
}
