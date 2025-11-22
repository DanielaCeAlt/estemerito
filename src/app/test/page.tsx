'use client';

import React, { useState } from 'react';

// Componente de prueba simplificado para evitar problemas de build
export default function TestPage() {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<Record<string, any>>({});

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎉 GostCAM - Sistema de Pruebas
        </h1>
        <p className="text-gray-600 mb-8">
          Página de pruebas del sistema GostCAM
        </p>

        {/* Búsqueda Simple */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Búsqueda</h2>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Buscar equipos..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        {/* Filtros Simples */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select 
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
            >
              <option value="">Seleccionar tipo</option>
              <option value="camara">Cámara</option>
              <option value="sensor">Sensor</option>
              <option value="dispositivo">Dispositivo</option>
            </select>
            
            <select 
              className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
            >
              <option value="">Seleccionar estado</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
            
            <button 
              className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition-colors"
              onClick={() => setFilters({})}
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            <span className="font-medium text-green-800">
              Sistema de Pruebas Funcionando Correctamente
            </span>
          </div>
          <p className="text-green-700 text-sm mt-2">
            La página de pruebas está operativa y lista para testing.
          </p>
        </div>

        {/* Estado actual para debugging */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">Estado Actual:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Búsqueda:</strong> {searchValue || 'Sin búsqueda'}</p>
            <p><strong>Filtros activos:</strong> {Object.keys(filters).length}</p>
            {Object.entries(filters).map(([key, value]) => (
              <p key={key}><strong>{key}:</strong> {String(value)}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}