import { useEffect, useMemo, useState } from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Consentimiento from '../components/encuesta/Consentimiento';
import DatosDemograficos from '../components/encuesta/DatosDemograficos';
import PreguntasLikert from '../components/encuesta/PreguntasLikert';
import ServiciosApoyo from '../components/encuesta/ServiciosApoyo';
import Encamamiento from '../components/encuesta/Encamamiento';
import PreguntasAbiertas from '../components/encuesta/PreguntasAbiertas';
import BotonesNavegacion from '../components/encuesta/BotonesNavegacion';
import { encuestaService } from '../services/encuestaService';
import { useEncuestaStore } from '../store/encuestaStore';
import { validarDemograficos, validarHorario } from '../utils/validaciones';

function normalizar(texto) {
  return (texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '_');
}

function EncuestaPage() {
  const {
    pasoActual,
    encuesta,
    consentimiento,
    fechaInicio,
    demograficos,
    serviciosApoyoSeleccionados,
    respuestas,
    setEncuesta,
    setConsentimiento,
    setPasoActual,
    nextPaso,
    prevPaso,
    setDemografico,
    setServiciosApoyo,
    setRespuesta,
    resetEncuesta
  } = useEncuestaStore();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [erroresDemograficos, setErroresDemograficos] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await encuestaService.getEncuestaActiva();
        setEncuesta(data.encuesta);
      } catch {
        setError('No se pudo cargar la encuesta activa.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [setEncuesta]);

  const preguntas = encuesta?.preguntas || [];

  const byCategoria = (categoria) => preguntas.filter((p) => p.categoria === categoria);
  const paso3 = byCategoria('trato_atencion');
  const paso4All = byCategoria('servicios_apoyo');
  const paso5 = byCategoria('comunicacion');
  const paso6Likert = byCategoria('tiempo_condiciones').filter((p) => p.tipo_respuesta === 'likert_5');
  const paso6Hora = byCategoria('tiempo_condiciones').filter((p) => p.tipo_respuesta === 'hora');
  const paso7 = byCategoria('encamamiento');
  const paso8 = byCategoria('satisfaccion_global');
  const paso9 = byCategoria('preguntas_abiertas');

  const preguntaServicios = paso4All.find((p) => p.tipo_respuesta === 'checkbox');

  const preguntasServiciosCond = useMemo(() => {
    return paso4All.filter((p) => {
      if (!p.dependencia || p.tipo_respuesta === 'checkbox') return false;
      return serviciosApoyoSeleccionados.includes(normalizar(p.dependencia.valor));
    });
  }, [paso4All, serviciosApoyoSeleccionados]);

  const handleNext = () => {
    setError('');

    if (pasoActual === 1) {
      if (consentimiento !== true) {
        setError('Debe aceptar el consentimiento para continuar.');
        return;
      }
    }

    if (pasoActual === 2) {
      const errs = validarDemograficos(demograficos);
      setErroresDemograficos(errs);
      if (Object.keys(errs).length > 0) {
        setError('Complete los campos demográficos requeridos.');
        return;
      }
    }

    if (pasoActual === 6) {
      const [ingresoQ, egresoQ] = paso6Hora;
      const ingreso = ingresoQ ? respuestas[ingresoQ.id]?.respuesta_texto : '';
      const egreso = egresoQ ? respuestas[egresoQ.id]?.respuesta_texto : '';
      if (!validarHorario(ingreso, egreso)) {
        setError('La hora de egreso debe ser mayor a la hora de ingreso.');
        return;
      }
    }

    nextPaso();
  };

  const handlePrev = () => {
    setError('');
    prevPaso();
  };

  const handleToggleServicio = (servicio, opcionId) => {
    const existe = serviciosApoyoSeleccionados.includes(servicio);
    const next = existe
      ? serviciosApoyoSeleccionados.filter((s) => s !== servicio)
      : [...serviciosApoyoSeleccionados, servicio];

    setServiciosApoyo(next);

    if (preguntaServicios) {
      const selectedOptionIds = preguntaServicios.opciones
        .filter((op) => next.includes(normalizar(op.valor_texto)))
        .map((op) => op.id);

      setRespuesta(preguntaServicios.id, {
        opcion_id: opcionId || null,
        respuesta_texto: JSON.stringify(selectedOptionIds)
      });
    }
  };

  const handleSubmit = async () => {
    setError('');
    setOk('');
    setSending(true);

    try {
      const respuestasPayload = Object.entries(respuestas).map(([preguntaId, valor]) => ({
        pregunta_id: Number(preguntaId),
        opcion_id: valor?.opcion_id || null,
        respuesta_texto: valor?.respuesta_texto || null
      }));

      const payload = {
        encabezado: {
          encuesta_id: encuesta.id,
          fecha_inicio: fechaInicio,
          origen_etnico: demograficos.origen_etnico,
          edad: Number(demograficos.edad),
          sexo: demograficos.sexo,
          departamento: demograficos.departamento,
          municipio: demograficos.municipio,
          hospital: demograficos.hospital,
          servicio: demograficos.servicio,
          telefono: demograficos.telefono,
          email_contacto: demograficos.email_contacto,
          acepta_contacto: demograficos.acepta_contacto
        },
        respuestas: respuestasPayload
      };

      const data = await encuestaService.enviarEncuesta(payload);
      setOk(data.message || 'Encuesta enviada correctamente.');
      resetEncuesta();
      setPasoActual(1);
    } catch (err) {
      setError(err?.response?.data?.message || 'No se pudo enviar la encuesta.');
    } finally {
      setSending(false);
    }
  };

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <Consentimiento
            consentimiento={consentimiento}
            onAccept={() => setConsentimiento(true)}
            onReject={() => setConsentimiento(false)}
          />
        );
      case 2:
        return (
          <DatosDemograficos
            data={demograficos}
            onChange={setDemografico}
            errores={erroresDemograficos}
          />
        );
      case 3:
        return <PreguntasLikert titulo="Trato y atención" preguntas={paso3} respuestas={respuestas} onResponder={setRespuesta} />;
      case 4:
        return (
          <ServiciosApoyo
            preguntaServicios={preguntaServicios}
            preguntasCondicionales={preguntasServiciosCond}
            seleccionados={serviciosApoyoSeleccionados}
            respuestas={respuestas}
            onToggleServicio={handleToggleServicio}
            onResponderLikert={setRespuesta}
          />
        );
      case 5:
        return <PreguntasLikert titulo="Comunicación e información" preguntas={paso5} respuestas={respuestas} onResponder={setRespuesta} />;
      case 6:
        return (
          <div className="space-y-4">
            <PreguntasLikert titulo="Tiempo y condiciones" preguntas={paso6Likert} respuestas={respuestas} onResponder={setRespuesta} />
            <section className="card-surface p-6">
              <h3 className="mb-3 text-xl font-bold text-brand-800">Horarios</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {paso6Hora.map((p) => (
                  <label key={p.id} className="flex flex-col gap-1">
                    <span>{p.texto_pregunta}</span>
                    <input
                      type="time"
                      className="rounded-lg border p-2"
                      value={respuestas[p.id]?.respuesta_texto || ''}
                      onChange={(e) => setRespuesta(p.id, { opcion_id: null, respuesta_texto: e.target.value })}
                    />
                  </label>
                ))}
              </div>
            </section>
          </div>
        );
      case 7:
        return <Encamamiento servicio={demograficos.servicio} preguntas={paso7} respuestas={respuestas} onResponder={setRespuesta} />;
      case 8:
        return <PreguntasLikert titulo="Satisfacción global" preguntas={paso8} respuestas={respuestas} onResponder={setRespuesta} />;
      case 9:
        return <PreguntasAbiertas preguntas={paso9} respuestas={respuestas} onResponder={setRespuesta} />;
      case 10:
        return (
          <section className="card-surface p-6">
            <h2 className="mb-4 text-2xl font-bold text-brand-800">Confirmación</h2>
            <p className="mb-3">Revise su información antes de enviar.</p>
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              <p><strong>Hospital:</strong> {demograficos.hospital}</p>
              <p><strong>Servicio:</strong> {demograficos.servicio}</p>
              <p><strong>Departamento:</strong> {demograficos.departamento}</p>
              <p><strong>Municipio:</strong> {demograficos.municipio}</p>
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-brand-100 bg-brand-50/40 p-3">
              <input
                type="checkbox"
                checked={!!demograficos.acepta_contacto}
                onChange={(e) => setDemografico('acepta_contacto', e.target.checked)}
              />
              Acepto que puedan contactarme para ampliar información sobre mi experiencia.
            </label>
          </section>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <section className="mb-4 card-surface p-4">
          <div className="mb-2 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-brand-900">Encuesta de satisfacción</h1>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-700">Paso {pasoActual} de 10</span>
          </div>
          <div className="h-2 rounded-full bg-brand-100">
            <div className="h-2 rounded-full bg-brand-600 transition-all" style={{ width: `${(pasoActual / 10) * 100}%` }} />
          </div>
        </section>

        {loading ? <LoadingSpinner label="Cargando formulario..." /> : renderPaso()}

        {error && <p className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">{error}</p>}
        {ok && <p className="mt-3 rounded-lg border border-green-300 bg-green-50 p-3 text-green-700">{ok}</p>}

        {!loading && consentimiento !== false && (
          <BotonesNavegacion
            paso={pasoActual}
            onPrev={handlePrev}
            onNext={handleNext}
            onSubmit={handleSubmit}
            loading={sending}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default EncuestaPage;
