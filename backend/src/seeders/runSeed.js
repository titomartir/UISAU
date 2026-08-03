/**
 * SEEDER - Encuesta de Satisfacción UISAU
 * Inserta: encuesta, 31 preguntas, opciones de respuesta y usuario admin.
 *
 * Uso: node src/seeders/runSeed.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const bcrypt = require('bcryptjs');
const { sequelize, Encuesta, Pregunta, OpcionRespuesta, Usuario } = require('../models');

// ── Opciones reutilizables ─────────────────────────────────────────────────
const OPCIONES_LIKERT = [
  { valor_texto: 'Muy Satisfecho',    puntaje: 5, orden: 1 },
  { valor_texto: 'Satisfecho',        puntaje: 4, orden: 2 },
  { valor_texto: 'Neutral',           puntaje: 3, orden: 3 },
  { valor_texto: 'Insatisfecho',      puntaje: 2, orden: 4 },
  { valor_texto: 'Muy Insatisfecho',  puntaje: 1, orden: 5 }
];

const OPCIONES_RECOMENDACION = [
  { valor_texto: 'Sí',      puntaje: 1, orden: 1 },
  { valor_texto: 'Neutral', puntaje: 0, orden: 2 },
  { valor_texto: 'No',      puntaje: -1, orden: 3 }
];

const OPCIONES_SERVICIOS_APOYO = [
  { valor_texto: 'Psicología',              puntaje: null, orden: 1 },
  { valor_texto: 'Nutrición',               puntaje: null, orden: 2 },
  { valor_texto: 'Trabajo Social',          puntaje: null, orden: 3 },
  { valor_texto: 'Laboratorio Clínico',     puntaje: null, orden: 4 },
  { valor_texto: 'Imágenes Diagnósticas',   puntaje: null, orden: 5 },
  { valor_texto: 'UISAU',                   puntaje: null, orden: 6 }
];

// ── Definición de preguntas ─────────────────────────────────────────────────
// dependencia: null = siempre visible
// dependencia: { campo, valor } = visible solo si ese campo coincide
const PREGUNTAS = [
  // ── PASO 3: Trato y Atención ──────────────────────────────────────────────
  {
    orden: 1,
    categoria: 'trato_atencion',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica el trato y la atención recibida por el personal médico durante su visita?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 2,
    categoria: 'trato_atencion',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica el trato recibido por el personal de enfermería?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 3,
    categoria: 'trato_atencion',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la atención brindada en el área de recepción o admisión del hospital?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 4,
    categoria: 'trato_atencion',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Fue tratado con cortesía, respeto y dignidad por el personal del hospital?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 5,
    categoria: 'trato_atencion',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿El personal del hospital lo llamó por su nombre durante la atención?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },

  // ── PASO 4: Servicios de Apoyo ────────────────────────────────────────────
  {
    orden: 6,
    categoria: 'servicios_apoyo',
    tipo_respuesta: 'checkbox',
    texto_pregunta: '¿Cuáles de los siguientes servicios de apoyo recibió durante su visita? (Seleccione todos los que apliquen)',
    requerido: false,
    dependencia: null,
    opciones: OPCIONES_SERVICIOS_APOYO
  },
  {
    orden: 7,
    categoria: 'servicios_apoyo',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la atención recibida por el servicio de Psicología?',
    requerido: false,
    dependencia: { campo: 'servicio_seleccionado', valor: 'psicologia' },
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 8,
    categoria: 'servicios_apoyo',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la atención recibida por el servicio de Nutrición?',
    requerido: false,
    dependencia: { campo: 'servicio_seleccionado', valor: 'nutricion' },
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 9,
    categoria: 'servicios_apoyo',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la atención recibida por el servicio de Trabajo Social?',
    requerido: false,
    dependencia: { campo: 'servicio_seleccionado', valor: 'trabajo_social' },
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 10,
    categoria: 'servicios_apoyo',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la atención recibida por el servicio de Laboratorio Clínico?',
    requerido: false,
    dependencia: { campo: 'servicio_seleccionado', valor: 'laboratorio' },
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 11,
    categoria: 'servicios_apoyo',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la atención recibida por el servicio de Imágenes Diagnósticas?',
    requerido: false,
    dependencia: { campo: 'servicio_seleccionado', valor: 'imagenes' },
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 12,
    categoria: 'servicios_apoyo',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la atención recibida por UISAU (Unidad de Información en Salud)?',
    requerido: false,
    dependencia: { campo: 'servicio_seleccionado', valor: 'uisau' },
    opciones: OPCIONES_LIKERT
  },

  // ── PASO 5: Comunicación e Información ───────────────────────────────────
  {
    orden: 13,
    categoria: 'comunicacion',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿La información sobre su estado de salud fue explicada de manera clara y comprensible?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 14,
    categoria: 'comunicacion',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿La información le fue brindada en un idioma o lenguaje que usted comprende?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 15,
    categoria: 'comunicacion',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Le explicaron claramente su diagnóstico, el tratamiento a seguir y los medicamentos recetados?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },

  // ── PASO 6: Tiempo y Condiciones ─────────────────────────────────────────
  {
    orden: 16,
    categoria: 'tiempo_condiciones',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica el tiempo de espera para ser atendido por el médico o personal de salud?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 17,
    categoria: 'tiempo_condiciones',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la comodidad y el mobiliario en la sala de espera?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 18,
    categoria: 'tiempo_condiciones',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la limpieza y el orden del área donde fue atendido?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 19,
    categoria: 'tiempo_condiciones',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la limpieza de los servicios sanitarios del hospital?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 20,
    categoria: 'tiempo_condiciones',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la ventilación e iluminación en el área de espera?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 21,
    categoria: 'tiempo_condiciones',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la ventilación e iluminación en el área donde fue atendido?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 22,
    categoria: 'tiempo_condiciones',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Se respetó su privacidad y seguridad personal durante su atención en el hospital?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 23,
    categoria: 'tiempo_condiciones',
    tipo_respuesta: 'hora',
    texto_pregunta: '¿A qué hora ingresó al establecimiento de salud?',
    requerido: false,
    dependencia: null,
    opciones: []
  },
  {
    orden: 24,
    categoria: 'tiempo_condiciones',
    tipo_respuesta: 'hora',
    texto_pregunta: '¿A qué hora egresó del establecimiento de salud?',
    requerido: false,
    dependencia: null,
    opciones: []
  },

  // ── PASO 7: Encamamiento (solo si servicio = encamamiento) ────────────────
  {
    orden: 25,
    categoria: 'encamamiento',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica el estado, limpieza e higiene de la ropa de cama que se le asignó?',
    requerido: true,
    dependencia: { campo: 'servicio', valor: 'encamamiento' },
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 26,
    categoria: 'encamamiento',
    tipo_respuesta: 'likert_5',
    texto_pregunta: '¿Cómo califica la calidad, cantidad y puntualidad de los alimentos proporcionados durante su estancia?',
    requerido: true,
    dependencia: { campo: 'servicio', valor: 'encamamiento' },
    opciones: OPCIONES_LIKERT
  },

  // ── PASO 8: Satisfacción Global ───────────────────────────────────────────
  {
    orden: 27,
    categoria: 'satisfaccion_global',
    tipo_respuesta: 'likert_5',
    texto_pregunta: 'En general, ¿cuál es su nivel de satisfacción con la atención y los servicios recibidos en este hospital?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_LIKERT
  },
  {
    orden: 28,
    categoria: 'satisfaccion_global',
    tipo_respuesta: 'seleccion_unica',
    texto_pregunta: '¿Recomendaría este hospital a un familiar, amigo o conocido que necesite atención médica?',
    requerido: true,
    dependencia: null,
    opciones: OPCIONES_RECOMENDACION
  },

  // ── PASO 9: Preguntas Abiertas ────────────────────────────────────────────
  {
    orden: 29,
    categoria: 'preguntas_abiertas',
    tipo_respuesta: 'texto',
    texto_pregunta: 'Si tuvo alguna experiencia negativa o problema durante su visita, por favor descríbala (opcional):',
    requerido: false,
    dependencia: null,
    opciones: []
  },
  {
    orden: 30,
    categoria: 'preguntas_abiertas',
    tipo_respuesta: 'texto',
    texto_pregunta: 'Si tuvo alguna experiencia positiva o algo que le gustó especialmente, por favor descríbala (opcional):',
    requerido: false,
    dependencia: null,
    opciones: []
  },
  {
    orden: 31,
    categoria: 'preguntas_abiertas',
    tipo_respuesta: 'texto',
    texto_pregunta: '¿Qué recomendaciones o sugerencias tiene para mejorar la calidad del servicio en este hospital? (opcional):',
    requerido: false,
    dependencia: null,
    opciones: []
  }
];

// ── Función principal del seeder ──────────────────────────────────────────
async function seed() {
  try {
    console.log('🌱 Iniciando proceso de seed...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // Sincronizar tablas (crear si no existen)
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas.');

    // ── 1. Crear o encontrar la encuesta ─────────────────────────────────
    const [encuesta, encuestaCreada] = await Encuesta.findOrCreate({
      where: { nombre: 'Encuesta de Satisfacción UISAU - Hospitales Nacionales' },
      defaults: {
        nombre: 'Encuesta de Satisfacción UISAU - Hospitales Nacionales',
        descripcion:
          'Encuesta oficial de satisfacción del usuario en la Red de Hospitales Nacionales de Guatemala. ' +
          'Su opinión nos ayuda a mejorar la calidad de los servicios de salud brindados.',
        version: '2024.1',
        activa: true,
        fecha_creacion: new Date()
      }
    });

    if (encuestaCreada) {
      console.log(`✅ Encuesta creada con ID: ${encuesta.id}`);
    } else {
      console.log(`ℹ️  Encuesta ya existe con ID: ${encuesta.id}`);
    }

    // ── 2. Insertar preguntas y opciones ──────────────────────────────────
    let preguntasInsertadas = 0;
    let opcionesInsertadas = 0;

    for (const p of PREGUNTAS) {
      const [pregunta, creada] = await Pregunta.findOrCreate({
        where: {
          encuesta_id: encuesta.id,
          orden: p.orden
        },
        defaults: {
          encuesta_id: encuesta.id,
          texto_pregunta: p.texto_pregunta,
          tipo_respuesta: p.tipo_respuesta,
          categoria: p.categoria,
          orden: p.orden,
          dependencia: p.dependencia,
          requerido: p.requerido
        }
      });

      if (creada) {
        preguntasInsertadas++;
        // Insertar opciones de respuesta solo si la pregunta es nueva
        if (p.opciones && p.opciones.length > 0) {
          for (const o of p.opciones) {
            await OpcionRespuesta.findOrCreate({
              where: {
                pregunta_id: pregunta.id,
                valor_texto: o.valor_texto
              },
              defaults: {
                pregunta_id: pregunta.id,
                valor_texto: o.valor_texto,
                puntaje: o.puntaje,
                orden: o.orden
              }
            });
            opcionesInsertadas++;
          }
        }
      }
    }

    console.log(`✅ Preguntas insertadas: ${preguntasInsertadas}/${PREGUNTAS.length}`);
    console.log(`✅ Opciones insertadas: ${opcionesInsertadas}`);

    // ── 3. Crear usuario administrador ────────────────────────────────────
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD son obligatorios para ejecutar el seeder.');
    }

    const [admin, adminCreado] = await Usuario.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        email: adminEmail,
        password_hash: await bcrypt.hash(adminPassword, 12),
        rol: 'admin'
      }
    });

    if (adminCreado) {
      console.log(`✅ Usuario admin creado: ${adminEmail}`);
      console.log(`   ⚠️  Cambie la contraseña en producción.`);
    } else {
      console.log(`ℹ️  Usuario admin ya existe: ${adminEmail}`);
    }

    console.log('\n🎉 Seed completado exitosamente.');
    console.log('────────────────────────────────────────────────');
    console.log(`📋 Encuesta ID  : ${encuesta.id}`);
    console.log(`📝 Total preguntas en DB: ${await Pregunta.count({ where: { encuesta_id: encuesta.id } })}`);
    console.log(`👤 Admin email  : ${adminEmail}`);
    console.log('────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ Error en el proceso de seed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
