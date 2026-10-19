import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('kasir@posfullai.test');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal, coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-linear-to-br from-primary-600 via-primary-500 to-amber-400 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl shadow-primary-900/20">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-600/40">
            <Store size={26} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-gray-900">POS Fullai</h1>
            <p className="text-sm text-gray-400">Masuk untuk mulai berjualan</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="text-xs font-semibold text-gray-500">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-semibold text-gray-500">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="mt-1.5 h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={submitting}>
            {submitting ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <p className="mt-6 rounded-xl bg-gray-50 px-3 py-2.5 text-center text-[11px] leading-relaxed text-gray-400">
          Akun demo: <span className="font-semibold text-gray-600">kasir@posfullai.test</span> /
          <span className="font-semibold text-gray-600"> password</span>
        </p>
      </div>
    </div>
  );
}
