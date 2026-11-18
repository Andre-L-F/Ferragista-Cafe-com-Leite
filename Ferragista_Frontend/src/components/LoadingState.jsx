export default function LoadingState({ label = 'Carregando informações...' }) {
  return <div className="loading-state"><span className="loader" />{label}</div>;
}
