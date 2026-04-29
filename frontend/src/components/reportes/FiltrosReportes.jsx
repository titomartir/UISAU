import React, { useState } from 'react';

export default function FiltrosReportes({ onAplicarFiltros, cargando }) {
  const [filtros, setFiltros] = useState({
    encuestaId: '',
    fechaInicio: '',
    fechaFin: ''
  });

  const handleChangeFecha = (name, value) => {
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAplicar = () => {
    onAplicarFiltros(filtros);
  };

  const handleLimpiar = () => {
    setFiltros({
      encuestaId: '',
      fechaInicio: '',
      fechaFin: ''
    });
    onAplicarFiltros({});
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fecha Inicio */}
        <div>
          <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de inicio
          </label>
          <input
            id="fechaInicio"
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) => handleChangeFecha('fechaInicio', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Fecha Fin */}
        <div>
          <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de fin
          </label>
          <input
            id="fechaFin"
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => handleChangeFecha('fechaFin', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botones */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleAplicar}
            disabled={cargando}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {cargando ? 'Cargando...' : 'Aplicar'}
          </button>
          <button
            onClick={handleLimpiar}
            disabled={cargando}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Resumen de filtros activos */}
      {(filtros.fechaInicio || filtros.fechaFin) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Periodo:</span>{' '}
            {filtros.fechaInicio && <span>{filtros.fechaInicio}</span>}
            {filtros.fechaInicio && filtros.fechaFin && <span> a </span>}
            {filtros.fechaFin && <span>{filtros.fechaFin}</span>}
          </p>
        </div>
      )}
    </div>
  );
}
