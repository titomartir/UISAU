import { create } from 'zustand';
import {
  DEFAULT_DEPARTAMENTO,
  DEFAULT_MUNICIPIO,
  DEFAULT_HOSPITAL
} from '../utils/guatemalaData';

export const useEncuestaStore = create((set) => ({
  pasoActual: 1,
  encuesta: null,
  consentimiento: null,
  fechaInicio: new Date().toISOString(),
  demograficos: {
    origen_etnico: '',
    edad: '',
    sexo: '',
    departamento: DEFAULT_DEPARTAMENTO,
    municipio: DEFAULT_MUNICIPIO,
    hospital: DEFAULT_HOSPITAL,
    servicio: '',
    telefono: '',
    email_contacto: '',
    acepta_contacto: false
  },
  serviciosApoyoSeleccionados: [],
  respuestas: {},

  setEncuesta: (encuesta) => set({ encuesta }),
  setConsentimiento: (valor) => set({ consentimiento: valor }),
  setPasoActual: (paso) => set({ pasoActual: paso }),
  nextPaso: () => set((state) => ({ pasoActual: Math.min(state.pasoActual + 1, 10) })),
  prevPaso: () => set((state) => ({ pasoActual: Math.max(state.pasoActual - 1, 1) })),
  setDemografico: (campo, valor) =>
    set((state) => ({ demograficos: { ...state.demograficos, [campo]: valor } })),
  setServiciosApoyo: (servicios) => set({ serviciosApoyoSeleccionados: servicios }),
  setRespuesta: (preguntaId, valor) =>
    set((state) => ({ respuestas: { ...state.respuestas, [preguntaId]: valor } })),
  resetEncuesta: () =>
    set({
      pasoActual: 1,
      consentimiento: null,
      fechaInicio: new Date().toISOString(),
      demograficos: {
        origen_etnico: '',
        edad: '',
        sexo: '',
        departamento: DEFAULT_DEPARTAMENTO,
        municipio: DEFAULT_MUNICIPIO,
        hospital: DEFAULT_HOSPITAL,
        servicio: '',
        telefono: '',
        email_contacto: '',
        acepta_contacto: false
      },
      serviciosApoyoSeleccionados: [],
      respuestas: {}
    })
}));
