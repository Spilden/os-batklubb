import { getWeather, getWeatherInfo } from '@/utils/weather'
import { Cloud, CloudLightning, CloudRain, CloudSnow, Sun, LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  sun: Sun,
  cloud: Cloud,
  'cloud-sun': Cloud,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
}

export default async function WeatherWidget({ days }: { days: number }) {
  const data = await getWeather(days)

  if (!data) return null

  const [current, ...forecast] = data

  const currentInfo = getWeatherInfo(current.symbolCode)
  const CurrentIcon = iconMap[currentInfo.icon] ?? Cloud

  return (
    <div className="flex items-center gap-12 px-6 py-4">
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-text-muted">Nå</p>
        <CurrentIcon className="w-12 h-12" />
        <p className="text-3xl font-bold">{Math.round(current.temperature)}°C</p>
        <p className="text-sm text-text-muted">{currentInfo.label}</p>
        <p className="text-sm text-text-muted">{Math.round(current.windSpeed)} m/s</p>
      </div>

      <div className="border-l pl-12 flex gap-8">
        {forecast.map((day) => {
          const { label, icon } = getWeatherInfo(day.symbolCode)
          const Icon = iconMap[icon] ?? Cloud
          const dayName = new Date(day.time).toLocaleDateString('no-NB', { weekday: 'short' })

          return (
            <div key={day.time} className="flex flex-col items-center gap-1">
              <p className="text-sm text-text-muted capitalize">{dayName}</p>
              <Icon className="w-6 h-6" />
              <p className="text-lg font-bold">{Math.round(day.temperature)}°C</p>
              <p className="text-xs text-text-muted">{label}</p>
              <p className="text-xs text-text-muted">{Math.round(day.windSpeed)} m/s</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
