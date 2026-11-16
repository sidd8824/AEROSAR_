import type { CalculationResult } from '@/types';
import { Activity, FileDown, FileText, GitCompareArrows, Save } from 'lucide-react';

interface Props {
  result: CalculationResult;
  onSaveMission: () => void;
  onPrintReport: () => void;
  onExportGeoJSON: () => void;
  onGoToAnalysis: () => void;
}

export default function IntelligencePanel({ result, onSaveMission, onPrintReport, onExportGeoJSON, onGoToAnalysis }: Props) {
  const groups = [
    { title: 'Warnings', items: result.warnings, className: 'result-warning' },
    { title: 'Missing information', items: result.missingInfo, className: 'result-warning' },
    { title: 'Model assumptions', items: result.assumptions, className: '' },
    { title: 'Model limitations', items: result.limitations, className: '' },
  ];

  return (
    <div className="report-card">
      <div className="card-heading">
        <div>
          <h2><Activity size={17} />Mission intelligence</h2>
          <p>Estimated wind drift {result.windDriftKm.toFixed(1)} km · Input completeness {result.inputCompleteness}%</p>
        </div>
      </div>
      <div className="report-details">
        {groups.filter(({ items }) => items.length > 0).map(({ title, items, className }) => (
          <details key={title} className={className} open={className ? true : undefined}>
            <summary>{title} <span>{items.length}</span></summary>
            <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
          </details>
        ))}
      </div>
      <div className="report-actions">
        <button className="light-button demo-button" onClick={onSaveMission}><Save size={15} />Save mission</button>
        <button className="light-button" onClick={onGoToAnalysis}><GitCompareArrows size={15} />Compare scenarios</button>
        <button className="light-button" onClick={onPrintReport}><FileText size={15} />Print report</button>
        <button className="light-button" onClick={onExportGeoJSON}><FileDown size={15} />Export GeoJSON</button>
      </div>
    </div>
  );
}
