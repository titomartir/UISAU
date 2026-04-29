function BotonExportar({ onExportar, loading }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="btn-primary"
        onClick={() => onExportar('xlsx')}
        disabled={loading}
      >
        {loading ? 'Exportando...' : 'Exportar XLSX'}
      </button>
      <button
        type="button"
        className="btn-secondary"
        onClick={() => onExportar('csv')}
        disabled={loading}
      >
        CSV
      </button>
    </div>
  );
}

export default BotonExportar;
