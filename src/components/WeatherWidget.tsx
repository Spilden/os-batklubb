import { getWeather } from '@/utils/weather'


export default async function WeatherWidget() {
  const data = await getWeather()
  console.log(data)
  return(
    <div>
      <p>vær</p>
    </div>
  )
}
