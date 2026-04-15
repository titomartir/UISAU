function BotonExportar({ onClick, loading }) {
  return (
    <button type="button" className="btn-primary" onClick={onClick} disabled={loading}>
      {loading ? 'Exportando...' : 'Exportar CSV'}
    </button>
  );
}

export default BotonExportar;
