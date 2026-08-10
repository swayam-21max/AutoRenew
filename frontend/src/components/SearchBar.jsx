import { useState } from 'react';

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{
      position: 'relative',
      maxWidth: '320px',
      width: '100%',
    }}>
      <span style={{
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: focused ? 'var(--color-primary)' : 'var(--color-text-light)',
        fontSize: '16px',
        transition: 'color var(--transition-fast)',
        pointerEvents: 'none',
      }}>
        🔍
      </span>
      <input
        type="text"
        className="form-input"
        style={{ paddingLeft: '38px' }}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}
