import { Clock3, LocateFixed, Route, Scan } from 'lucide-react';
import type { CalculationResult } from '@/types';

const number = new Intl.NumberFormat('en', { maximumFractionDigits: 1 });

export default function MissionMetrics({ result }: { result: CalculationResult | null }) {
  const metrics = [
    { label: 'Search area', icon: Scan, value: result && number.format(result.searchAreaKm2), unit: 'km²' },
    { label: 'Nominal distance', icon: Route, value: result && number.format(result.nominalDistanceKm), unit: 'km' },
    { label: 'Elapsed time', icon: Clock3, value: result && result.elapsedTimeLabel, unit: '' },
    { label: 'Position uncertainty', icon: LocateFixed, value: result && number.format(result.positionUncertaintyKm), unit: 'km' },
  ];

  return (
    <dl className="mission-metrics" aria-label="Mission estimates">
      {metrics.map(({ label, icon: Icon, value, unit }) => (
        <div className="metric" key={label}>
          <dt><Icon size={15} aria-hidden="true" />{label}</dt>
          <dd>{value ?? '—'} {value !== null && unit && <span>{unit}</span>}</dd>
        </div>
      ))}
    </dl>
  );
}
