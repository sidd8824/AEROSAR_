import type { MissionInputs } from '@/types';
import { cloneElement, useId, type ReactElement } from 'react';
import { Crosshair, MapPin, Wind, Plane, AlertTriangle } from 'lucide-react';

interface MissionInputFormProps {
  inputs: MissionInputs;
  errors: Record<string, string>;
  onChange: (field: keyof MissionInputs, value: string | number) => void;
  onCalculate: () => void;
}

function Field({
  label,
  required,
  optional,
  tooltip,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  tooltip?: string;
  error?: string;
  children: ReactElement<{
    id?: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
  }>;
}) {
  const id = useId();
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        <label htmlFor={id} className="text-xs font-medium text-muted">{label}</label>
        {required && <span className="text-[10px] text-critical">*</span>}
        {optional && <span className="text-[10px] text-faint">(optional)</span>}
      </div>
      {tooltip && <span id={id + '-hint'} className="sr-only">{tooltip}</span>}
      {cloneElement(children, {
        id,
        'aria-invalid': !!error,
        'aria-describedby': [tooltip && id + '-hint', error && id + '-error'].filter(Boolean).join(' ') || undefined,
      })}
      {error && (
        <p id={id + '-error'} className="mt-1 text-xs text-critical flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" /> {error}
        </p>
      )}
    </div>
  );
}

const inputClass = 'mission-field';

export default function MissionInputForm({ inputs, errors, onChange, onCalculate }: MissionInputFormProps) {
  function handleNumChange(field: keyof MissionInputs, value: string) {
    onChange(field, value === '' ? Number.NaN : Number(value));
  }

  const formatLocalDT = (iso: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  return (
    <form className="mission-form" noValidate onSubmit={(event) => { event.preventDefault(); onCalculate(); }}>
      {/* Section: Last Known Position */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-cyan" />
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Last Known Position</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" required tooltip="Decimal degrees, -90 to 90" error={errors.lat}>
            <input
              type="number"
              step="any"
              value={Number.isNaN(inputs.lat) ? '' : inputs.lat}
              onChange={(e) => handleNumChange('lat', e.target.value)}
              className={inputClass}
              placeholder="36.852"
            />
          </Field>
          <Field label="Longitude" required tooltip="Decimal degrees, -180 to 180" error={errors.lon}>
            <input
              type="number"
              step="any"
              value={Number.isNaN(inputs.lon) ? '' : inputs.lon}
              onChange={(e) => handleNumChange('lon', e.target.value)}
              className={inputClass}
              placeholder="-76.293"
            />
          </Field>
        </div>
        <p className="mt-1.5 text-[10px] text-cyan/70 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Click the map to set latitude and longitude.
        </p>
        <div className="mt-3">
          <Field label="Timestamp (UTC)" required tooltip="Date and time of last contact in UTC" error={errors.timestamp}>
            <input
              type="datetime-local"
              value={formatLocalDT(inputs.timestamp)}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  onChange('timestamp', new Date(val + 'Z').toISOString());
                } else {
                  onChange('timestamp', '');
                }
              }}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Position Uncertainty (km)" required tooltip="Radius of positional uncertainty around last known position" error={errors.positionUncertaintyKm}>
            <input
              type="number"
              step="any"
              min="0"
              value={Number.isNaN(inputs.positionUncertaintyKm) ? '' : inputs.positionUncertaintyKm}
              onChange={(e) => handleNumChange('positionUncertaintyKm', e.target.value)}
              className={inputClass}
              placeholder="8"
            />
          </Field>
        </div>
      </div>

      <div className="border-t border-subtle" />

      {/* Section: Aircraft Details */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Plane className="w-4 h-4 text-cyan" />
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Aircraft Details</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Heading (°)" required tooltip="Compass heading 0–359 degrees" error={errors.heading}>
            <input
              type="number"
              min="0"
              max="359"
              value={Number.isNaN(inputs.heading) ? '' : inputs.heading}
              onChange={(e) => handleNumChange('heading', e.target.value)}
              className={inputClass}
              placeholder="75"
            />
          </Field>
          <Field label="Endurance (h)" required tooltip="Remaining fuel endurance in hours" error={errors.endurance}>
            <input
              type="number"
              step="any"
              min="0"
              value={Number.isNaN(inputs.endurance) ? '' : inputs.endurance}
              onChange={(e) => handleNumChange('endurance', e.target.value)}
              className={inputClass}
              placeholder="4.5"
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <Field label="Speed" required error={errors.speed}>
            <input
              type="number"
              step="any"
              min="0"
              value={Number.isNaN(inputs.speed) ? '' : inputs.speed}
              onChange={(e) => handleNumChange('speed', e.target.value)}
              className={inputClass}
              placeholder="145"
            />
          </Field>
          <Field label="Unit" required>
            <select
              value={inputs.speedUnit}
              onChange={(e) => onChange('speedUnit', e.target.value)}
              className={inputClass}
            >
              <option value="knots">knots</option>
              <option value="kmh">km/h</option>
              <option value="mph">mph</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="border-t border-subtle" />

      {/* Section: Environment */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Wind className="w-4 h-4 text-cyan" />
          <h3 className="text-xs font-semibold text-primary uppercase tracking-wider">Environment</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Wind Dir (°)" required tooltip="Direction wind is coming FROM, 0–359" error={errors.windDirection}>
            <input
              type="number"
              min="0"
              max="359"
              value={Number.isNaN(inputs.windDirection) ? '' : inputs.windDirection}
              onChange={(e) => handleNumChange('windDirection', e.target.value)}
              className={inputClass}
              placeholder="210"
            />
          </Field>
          <Field label="Wind Speed" required error={errors.windSpeed}>
            <input
              type="number"
              step="any"
              min="0"
              value={Number.isNaN(inputs.windSpeed) ? '' : inputs.windSpeed}
              onChange={(e) => handleNumChange('windSpeed', e.target.value)}
              className={inputClass}
              placeholder="22"
            />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Wind Unit" required>
            <select
              value={inputs.windSpeedUnit}
              onChange={(e) => onChange('windSpeedUnit', e.target.value)}
              className={inputClass}
            >
              <option value="knots">knots</option>
              <option value="kmh">km/h</option>
              <option value="mph">mph</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="border-t border-subtle" />

      <button type="submit" className="primary-button"><Crosshair size={16} />Calculate search area</button>
    </form>
  );
}
