import { Search, X } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder = 'Buscar...', className = '', id }) {
  return (
    <label className={`search-input ${className}`}>
      <Search size={18} aria-hidden="true" />
      <input id={id} value={value} onChange={onChange} placeholder={placeholder} />
      {value && <button type="button" aria-label="Limpar busca" onClick={() => onChange({ target: { value: '' } })}><X size={15} /></button>}
    </label>
  );
}
