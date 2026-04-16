import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('admin_design');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const result = await login(identifier, password);
    if (result) {
      setError(result);
      return;
    }
    navigate('/', { replace: true });
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>Sign in</h1>
        <p className="muted">This app now uses Supabase JWT sessions. You can sign in with your username or email.</p>
        {error ? <div className="banner error">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username or Email</label>
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <div className="banner info" style={{ marginTop: '14px' }}>
          Existing username-based users are auto-linked to an internal Supabase email during sign-in.
        </div>
      </div>
    </div>
  );
}
