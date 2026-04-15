function LoadingSpinner({ label = 'Cargando...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6" role="status" aria-live="polite">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-300 border-t-brand-700" />
      <span className="text-brand-900">{label}</span>
    </div>
  );
}

export default LoadingSpinner;
