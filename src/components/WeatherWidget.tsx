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
      <div className="flex items-center gap-6 px-6 py-4">
        <Icon className="w-10 h-10" />
        <div>
          <p className="text-2xl font-bold">{Math.round(data.temperature)}°C</p>
          <p className="text-sm text-text-muted">{label}</p>
        </div>
        <div className="border-l pl-6">
          <p className="text-sm text-text-muted">{Math.round(data.windSpeed)} m/s</p>
        </div>
      </div>
    </div>
  )
}
