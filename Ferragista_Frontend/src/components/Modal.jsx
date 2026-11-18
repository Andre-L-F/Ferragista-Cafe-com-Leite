import { X } from 'lucide-react';

export default function Modal({ open, title, children, onClose, wide = false }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar"><X size={19} /></button>
        </header>
        {children}
      </section>
    </div>
  );
}
