export default function Field({ label, id, required = false, children, full = false, hint }) {
  return (
    <div className={`form-field ${full ? 'field-full' : ''}`}>
      <label htmlFor={id}>{label}{required && <span className="required-mark"> *</span>}</label>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}
