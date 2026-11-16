import { useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ArrowRight, Compass, FlaskConical } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  onAuthed: (session: Session) => void;
  onDemo: () => void;
}

export default function AuthScreen({ onAuthed, onDemo }: Props) {
  const [signUp, setSignUp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || busy) return;
    const form = new FormData(event.currentTarget);
    const credentials = { email: String(form.get('email')).trim(), password: String(form.get('password')) };
    setBusy(true);
    setError('');
    setMessage('');

    try {
      const { data, error } = signUp
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      if (data.session) onAuthed(data.session);
      else if (signUp) setMessage('Check your inbox for a confirmation link.');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-layout">
      <section className="auth-intro">
        <div className="wordmark"><span className="brand-icon"><Compass size={21} /></span>AEROSAR</div>
        <div>
          <h1>Aircraft search planning</h1>
          <p>Plot the last known position. Explore the estimated search area. Compare how changes in heading, speed, and wind affect a mission.</p>
        </div>
        <small>Prototype for simulated search planning</small>
      </section>
      <section className="auth-panel">
        <div className="auth-form">
          <h2>{signUp ? 'Create an account' : 'Sign in'}</h2>
          <p>Open the mission workspace and save missions on this device.</p>
          <form onSubmit={submit}>
            <label>Email<input name="email" type="email" autoComplete="email" required /></label>
            <label>Password<input name="password" type="password" autoComplete={signUp ? 'new-password' : 'current-password'} minLength={6} required /></label>
            {error && <p className="text-critical" role="alert">{error}</p>}
            {message && <p role="status">{message}</p>}
            <button className="primary-button" disabled={busy} type="submit">
              {busy ? 'Please wait…' : signUp ? 'Create account' : 'Sign in'} <ArrowRight size={17} />
            </button>
          </form>
          <button className="auth-switch" disabled={busy} onClick={() => {
            setSignUp((current) => !current);
            setError('');
            setMessage('');
          }}>{signUp ? 'Already have an account? Sign in' : 'Create an account'}</button>
          <button className="light-button" onClick={onDemo}><FlaskConical size={15} />Open demo workspace</button>
        </div>
      </section>
    </main>
  );
}
