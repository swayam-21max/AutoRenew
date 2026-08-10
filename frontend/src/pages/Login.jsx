import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{
        fontSize: 'var(--font-size-xl)',
        fontWeight: 600,
        marginBottom: 'var(--space-1)',
      }}>
        Welcome back
      </h2>
      <p style={{
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-size-sm)',
        marginBottom: 'var(--space-6)',
      }}>
        Sign in to your account
      </p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="you@example.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email address',
              },
            })}
          />
          {errors.email && <span className="form-error">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Enter your password"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && <span className="form-error">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={loading}
          style={{ marginTop: 'var(--space-2)', padding: '12px' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p style={{
        textAlign: 'center',
        marginTop: 'var(--space-6)',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-muted)',
      }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ fontWeight: 500 }}>Create one</Link>
      </p>
    </div>
  );
}
