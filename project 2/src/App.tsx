import { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { CalculationResult, MissionInputs, Page, SavedMission, ScenarioResult } from '@/types';
import { supabase } from '@/lib/supabase';
import AuthScreen from '@/components/AuthScreen';
import { calculate, DEMO_MISSION, speedLabel } from '@/lib/calculations';
import { validateInputs } from '@/lib/validation';
import { exportGeoJSON, downloadFile, printReport, loadMissions, saveMission, deleteMission, generateMissionId } from '@/lib/export';
import TopNav from '@/components/TopNav';
import MissionInputForm from '@/components/MissionInputForm';
import SARMap from '@/components/SARMap';
import IntelligencePanel from '@/components/IntelligencePanel';
import MapLegend from '@/components/MapLegend';
import SearchAnalysis from '@/components/SearchAnalysis';
import MissionHistory from '@/components/MissionHistory';
import { Crosshair, FlaskConical, Focus, Layers, Loader2, MapPin, Play, Radio, RotateCcw } from 'lucide-react';
import MissionMetrics from '@/components/MissionMetrics';

const EMPTY_INPUTS: MissionInputs = {
  lat: Number.NaN,
  lon: Number.NaN,
  timestamp: '',
  heading: 0,
  speed: 0,
  speedUnit: 'knots',
  endurance: 0,
  windDirection: 0,
  windSpeed: 0,
  windSpeedUnit: 'knots',
  positionUncertaintyKm: 0,
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(!supabase);
  const [demoMode, setDemoMode] = useState(!supabase);
  const [page, setPage] = useState<Page>('mission-control');
  const [inputs, setInputs] = useState<MissionInputs>(() => supabase ? EMPTY_INPUTS : DEMO_MISSION);
  const [result, setResult] = useState<CalculationResult | null>(() => supabase ? null : calculate(DEMO_MISSION, true));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fitTrigger, setFitTrigger] = useState(1);
  const [centerTrigger, setCenterTrigger] = useState(0);
  const [flyTrigger, setFlyTrigger] = useState(-1);
  const [missions, setMissions] = useState<SavedMission[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [showLegend, setShowLegend] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!supabase) return;
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthReady(true);
    }).catch(() => {
      if (!mounted) return;
      setAuthReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      setSession(s);
      setAuthReady(true);
    });

    const timeout = setTimeout(() => {
      if (!mounted) return;
      setAuthReady(true);
    }, 3000);

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    setMissions(session ? loadMissions() : []);
  }, [session]);

  const handleReset = useCallback(() => {
    setInputs(EMPTY_INPUTS);
    setResult(null);
    setErrors({});
    setScenarios([]);
    setNotice('');
    setFlyTrigger(-1);
  }, []);

  const handleSignOut = useCallback(() => {
    if (session) void supabase?.auth.signOut();
    setSession(null);
    setDemoMode(false);
    setPage('mission-control');
    handleReset();
  }, [session, handleReset]);

  const handleCalculate = useCallback(() => {
    const validation = validateInputs(inputs);
    setErrors(Object.fromEntries(validation.map(({ field, message }) => [field, message])));
    if (validation.length) {
      setNotice('Check the highlighted mission inputs.');
      requestAnimationFrame(() => document.querySelector<HTMLElement>('.mission-field[aria-invalid="true"]')?.focus());
      return;
    }
    setNotice('');
    setScenarios([]);
    setResult(calculate(inputs, inputs === DEMO_MISSION));
    setFitTrigger((trigger) => trigger + 1);
  }, [inputs]);

  const handleDemo = useCallback(() => {
    setInputs(DEMO_MISSION);
    setErrors({});
    setNotice('');
    setScenarios([]);
    setResult(calculate(DEMO_MISSION, true));
    setFitTrigger((trigger) => trigger + 1);
  }, []);

  const handleInputChange = useCallback((field: keyof MissionInputs, value: string | number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const c = { ...prev }; delete c[field]; return c; });
    }
  }, [errors]);

  const handleFitMap = useCallback(() => {
    setFitTrigger((t) => t + 1);
  }, []);

  const handleCenterLKP = useCallback(() => {
    setCenterTrigger((t) => t + 1);
  }, []);

  const handleFlyRoute = useCallback(() => {
    setFlyTrigger((t) => t + 1);
  }, []);

  const handleSaveMission = useCallback(() => {
    if (!result) return;
    const mission: SavedMission = {
      id: generateMissionId(),
      ref: result.missionRef,
      savedAt: new Date().toISOString(),
      inputs: result.inputs,
      result,
      label: result.isSimulated ? 'Demo Mission' : 'Custom Mission',
    };
    if (session) {
      saveMission(mission);
      setMissions(loadMissions());
    } else {
      setMissions((current) => [mission, ...current]);
    }
    setNotice(session ? 'Mission saved to history on this device.' : 'Mission saved for this demo session.');
  }, [result, session]);

  const handleOpenMission = useCallback((mission: SavedMission) => {
    setInputs(mission.inputs);
    setResult(mission.result);
    setErrors({});
    setScenarios([]);
    setNotice('');
    setPage('mission-control');
    setFitTrigger((t) => t + 1);
  }, []);

  const handleDeleteMission = useCallback((id: string) => {
    if (session) deleteMission(id);
    setMissions((current) => current.filter((mission) => mission.id !== id));
  }, [session]);

  const handlePrintReport = useCallback(() => {
    if (result) printReport(result);
  }, [result]);

  const handleExportGeoJSON = useCallback(() => {
    if (result) {
      const json = exportGeoJSON(result);
      downloadFile(`${result.missionRef}_search_area.geojson`, json, 'application/geo+json');
    }
  }, [result]);

  if (!authReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-base">
        <Loader2 className="w-8 h-8 text-cyan animate-spin-sm" />
      </div>
    );
  }

  if (!session && !demoMode) {
    return <AuthScreen onAuthed={setSession} onDemo={() => {
      handleDemo();
      setDemoMode(true);
    }} />;
  }

  const hasPendingEdits = result && Object.keys(inputs).some((key) => {
    const field = key as keyof MissionInputs;
    return inputs[field] !== result.inputs[field];
  });

  return (
    <div className="command-shell">
      <TopNav
        currentPage={page}
        onNavigate={(nextPage) => { setPage(nextPage); setFlyTrigger(-1); }}
        onSignOut={handleSignOut}
        userEmail={session?.user.email}
        canSignIn={!!supabase}
      />

      <main className="command-main" key={page}>
        {page === 'mission-control' && (
          <>
            <div className="workspace-title">
              <div>
                <h1>Mission control</h1>
                <p>Plot an aircraft’s last known position and estimate where to search.</p>
              </div>
              <div className="workspace-actions">
                <button className="light-button" onClick={handleReset}><RotateCcw size={15} />New mission</button>
                <button className="light-button demo-button" onClick={handleDemo}><FlaskConical size={15} />Load example</button>
              </div>
            </div>
            <div className="mission-state" aria-live="polite">
              <span className="state-label"><span />{result?.isSimulated ? 'Example mission' : result ? 'Mission estimate' : 'New mission'}</span>
              {result && <span className="mission-id">{result.missionRef}</span>}
              <span className="mission-notice" role="status">{notice || (hasPendingEdits ? 'Inputs changed. Recalculate to update the map.' : '')}</span>
            </div>
            <MissionMetrics result={result} />
            <div className="workspace-grid">
              <section className="map-card" aria-label="Search map">
                <div className="card-heading">
                  <div><h2>Search map</h2><p>Select the last known position directly on the map.</p></div>
                  <button className="light-button" disabled={!result} aria-pressed={showLegend && !!result} onClick={() => setShowLegend((visible) => !visible)}>
                    <Layers size={15} />Legend
                  </button>
                </div>
                <div className="map-stage">
                  <SARMap result={result} fitTrigger={fitTrigger} centerTrigger={centerTrigger}
                    flyTrigger={flyTrigger} onMapClick={(lat, lon) => {
                      handleInputChange('lat', Number(lat.toFixed(5)));
                      handleInputChange('lon', Number(lon.toFixed(5)));
                    }} />
                  {showLegend && result && <MapLegend />}
                </div>
                <div className="map-footer">
                  <span className="map-coordinate"><MapPin size={14} />{result ? `${result.lastKnownPosition.lat.toFixed(3)}°, ${result.lastKnownPosition.lon.toFixed(3)}°` : 'Awaiting mission inputs'}</span>
                  <div className="map-actions">
                    <button className="light-button" disabled={!result} onClick={handleFitMap}><Focus size={15} />Fit area</button>
                    <button className="light-button" disabled={!result} onClick={handleCenterLKP}><Crosshair size={15} />Last position</button>
                    <button className="light-button" disabled={!result} onClick={handleFlyRoute}><Play size={15} />Fly route</button>
                  </div>
                </div>
              </section>
              <section className="input-card" aria-label="Mission inputs">
                <div className="card-heading">
                  <div><h2>Mission inputs</h2><p>Last contact, aircraft and wind.</p></div>
                </div>
                <MissionInputForm inputs={inputs} errors={errors} onChange={handleInputChange} onCalculate={handleCalculate} />
              </section>
            </div>
            {result && (
              <section className="results-section" aria-label="Mission results">
                <IntelligencePanel result={result} onSaveMission={handleSaveMission}
                  onPrintReport={handlePrintReport} onExportGeoJSON={handleExportGeoJSON}
                  onGoToAnalysis={() => setPage('search-analysis')} />
              </section>
            )}
            <footer className="workspace-footer">AeroSAR is a prototype for simulated search planning.</footer>
          </>
        )}

          {page === 'search-analysis' && (
            <div className="secondary-workspace">
            <SearchAnalysis
              baseResult={result}
              onCompare={setScenarios}
              scenarios={scenarios}
            />
            </div>
          )}

          {page === 'mission-history' && (
            <div className="secondary-workspace">
            <MissionHistory
              missions={missions}
              sessionOnly={!session}
              onOpen={handleOpenMission}
              onDelete={handleDeleteMission}
            />
            </div>
          )}

          {page === 'about' && (
            <div className="h-full overflow-y-auto animate-fly-in">
              <div className="max-w-3xl mx-auto p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-cyan-dim border border-cyan/30 flex items-center justify-center">
                    <Radio className="w-6 h-6 text-cyan" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">About AEROSAR</h1>
                    <p className="text-muted text-sm">Aircraft Search &amp; Rescue Intelligence System</p>
                  </div>
                </div>
                <div className="space-y-4 text-sm text-muted leading-relaxed">
                  <p>
                    AEROSAR is a decision-support prototype that helps users estimate and visualize
                    a potential aircraft search region after contact is lost. It combines last known
                    position, aircraft movement assumptions, environmental conditions, and position
                    uncertainty into an interactive map visualization with downloadable mission reports.
                  </p>
                  <div className="bg-panel border border-subtle rounded-lg p-5">
                    <h2 className="text-primary font-semibold mb-3">How It Works</h2>
                    <ol className="space-y-2.5">
                      {[
                        { t: 'Last Known Position', d: 'Enter the aircraft\'s last known latitude, longitude, and timestamp in UTC.' },
                        { t: 'Validated Inputs', d: 'All inputs are validated for range and type before calculation.' },
                        { t: 'Motion & Uncertainty Model', d: 'The engine estimates nominal movement along the heading and models wind drift with a simplified heuristic.' },
                        { t: 'Estimated Search Region', d: 'A convex hull of position-uncertainty circles at the last known and estimated positions defines the search polygon.' },
                        { t: 'Mission Report', d: 'Export a printable HTML report or GeoJSON of the search geometry for coordination.' },
                      ].map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-dim border border-cyan/30 text-cyan text-xs font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <div>
                            <span className="text-primary font-medium">{step.t}</span>
                            <span className="text-muted"> — {step.d}</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div className="bg-amber-dim border border-amber/30 rounded-lg p-5">
                    <h2 className="text-amber font-semibold mb-2">Important Disclaimer</h2>
                    <p>
                      AEROSAR is a prototype for demonstration purposes only. It is not a validated
                      operational search-and-rescue system. All calculations use simplified models and
                      should not be used for real emergency response. Real SAR operations require
                      qualified coordination and validated procedures.
                    </p>
                  </div>
                  <div className="bg-panel border border-subtle rounded-lg p-5">
                    <h2 className="text-primary font-semibold mb-2">Calculation Model</h2>
                    <p className="mb-2">
                      The engine uses great-circle navigation for destination-point calculation,
                      haversine distance, and a convex hull of position-uncertainty circles to define
                      the search polygon. Wind drift uses a conservative 15% drift factor.
                    </p>
                    <p>
                      Units: Speed in {speedLabel('knots')}, {speedLabel('kmh')}, or {speedLabel('mph')}.
                      Distances in kilometers. Area in km².
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
      </main>
    </div>
  );
}
