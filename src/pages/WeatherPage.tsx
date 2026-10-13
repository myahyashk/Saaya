import { Thermometer, Droplets, Wind, Sun, Sunrise, Sunset, Cloud } from 'lucide-react';
import { useI18n } from '@/i18n/context';
import { useWeather } from '@/hooks/useData';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { formatHour, formatDate } from '@/utils/risk';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export default function WeatherPage() {
  const { t } = useI18n();
  const { data: weather, loading, error, refetch } = useWeather();

  if (loading) return <div className="space-y-6"><h1 className="text-2xl font-bold">{t('weather.title')}</h1><LoadingState /></div>;
  if (error) return <div className="space-y-6"><h1 className="text-2xl font-bold">{t('weather.title')}</h1><ErrorState message={error} onRetry={refetch} /></div>;
  if (!weather) return <div className="space-y-6"><h1 className="text-2xl font-bold">{t('weather.title')}</h1><EmptyState /></div>;

  const chartData = weather.hourly.map(h => ({
    time: formatHour(h.time),
    temp: h.temp_c,
    feels: h.feels_like_c,
    humidity: h.humidity,
    uv: h.uv_index,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('weather.title')}</h1>

      {/* Current conditions */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t('weather.current')}</h2>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-900">{weather.current.temp_c}°</span>
            <span className="text-xl text-gray-400">C</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Cloud size={20} />
            <span>{weather.current.condition}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Stat icon={Thermometer} label={t('weather.feelsLike')} value={`${weather.current.feels_like_c}°C`} color="text-orange-500" />
          <Stat icon={Droplets} label={t('weather.humidity')} value={`${weather.current.humidity}%`} color="text-blue-500" />
          <Stat icon={Wind} label={t('weather.wind')} value={`${weather.current.wind_kph} km/h`} color="text-gray-400" />
          <Stat icon={Sun} label={t('weather.uv')} value={String(weather.current.uv_index)} color="text-amber-500" />
        </div>
      </section>

      {/* Hourly chart */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t('weather.hourly')}</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6b7280' }} interval={3} />
              <YAxis yAxisId="temp" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <YAxis yAxisId="humid" orientation="right" tick={{ fontSize: 11, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                labelStyle={{ color: '#374151' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line yAxisId="temp" type="monotone" dataKey="temp" name={t('weather.temperature')} stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line yAxisId="temp" type="monotone" dataKey="feels" name={t('weather.feelsLike')} stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="4 4" />
              <Line yAxisId="humid" type="monotone" dataKey="humidity" name={t('weather.humidity')} stroke="#3b82f6" strokeWidth={1.5} dot={false} />
              <Line yAxisId="humid" type="monotone" dataKey="uv" name={t('weather.uv')} stroke="#f59e0b" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 7-day daily list */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">{t('weather.daily')}</h2>
        <div className="space-y-2">
          {weather.daily.map((day, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
              <div className="w-24 flex-shrink-0">
                <p className="text-sm font-medium text-gray-900">{i === 0 ? 'Today' : formatDate(day.date)}</p>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Sun size={16} className="text-amber-400" />
                <span className="text-sm text-gray-600">UV {day.uv_index_max}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-red-500 font-medium">{day.temp_max_c}°</span>
                <span className="text-gray-300">/</span>
                <span className="text-blue-500 font-medium">{day.temp_min_c}°</span>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Sunrise size={14} /> {formatHour(day.sunrise)}</span>
                <span className="flex items-center gap-1"><Sunset size={14} /> {formatHour(day.sunset)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: typeof Thermometer; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={20} className={color} />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
