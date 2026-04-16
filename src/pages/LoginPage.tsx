import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin_design');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    const result = await login(username, password);
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
        <p className="muted">This login follows the same username and password hash pattern used in the existing Supabase app.</p>
        {error ? <div className="banner error">{error}</div> : null}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} />
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
          Demo users: admin_design and design. Default password is admin.
        </div>
      </div>
    </div>
  );
}
