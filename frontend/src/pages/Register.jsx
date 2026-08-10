import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      await registerUser(data.fullName, data.email, data.password, data.confirmPassword);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0] || 'Registration failed.';
      setError(msg);
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
        Create your account
      </h2>
      <p style={{
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-size-sm)',
        marginBottom: 'var(--space-6)',
      }}>
        Start managing your insurance policies
      </p>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="reg-name">Full Name</label>
          <input
            id="reg-name"
            type="text"
            className={`form-input ${errors.fullName ? 'error' : ''}`}
            placeholder="John Doe"
            {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />
          {errors.fullName && <span className="form-error">{errors.fullName.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
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
          <label className="form-label" htmlFor="reg-password">Password</label>
          <input
            id="reg-password"
            type="password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Minimum 8 characters"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
            })}
          />
          {errors.password && <span className="form-error">{errors.password.message}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
          <input
            id="reg-confirm"
            type="password"
            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Re-enter your password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && <span className="form-error">{errors.confirmPassword.message}</span>}
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
              Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p style={{
        textAlign: 'center',
        marginTop: 'var(--space-6)',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-muted)',
      }}>
        Already have an account?{' '}
        <Link to="/login" style={{ fontWeight: 500 }}>Sign in</Link>
      </p>
    </div>
  );
}
