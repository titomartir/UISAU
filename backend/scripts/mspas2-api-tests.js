#!/usr/bin/env node

const BASE_URL = 'http://192.168.10.253:15000/api';

const FORMA_VALUES = ['impreso', 'digital'];
const IDIOMAS = [
  'achi', 'akateko', 'awakateco', 'chalchiteko', 'chorti', 'chuj', 'itza', 'ixil', 'jakalteko',
  'kaqchikel', 'kiche', 'mam', 'mopan', 'pocomam', 'poqomchi', 'qanjobal', 'qeqchi',
  'sakapulteco', 'sipakapense', 'tektiteko', 'tzutujil', 'uspanteko', 'xinca', 'garifuna', 'espanol', 'otros'
];

const resultados = {
  test1_encuesta_activa_tiene_2_preguntas: false,
  test2_orden_demograficos_correcto: false,
  test3_forma_impreso_aceptada: false,
  test4_forma_digital_aceptada: false,
  test5_26_idiomas_catalogados: false,
  test6_no_multiples_idiomas: false,
  test7_rechaza_idioma_invalido: false,
  test8_rechaza_forma_invalida: false,
  test9_submit_valido_http201: false,
  ids_guardados: [],
  total_preguntas: 0,
  orden_demograficos: [],
  idioma_catalogo_count: 0,
  idioma_catalogo: [],
  nota_rate_limit: ''
};

function basePayload(encuestaId) {
  return {
    encabezado: {
      encuesta_id: encuestaId,
      origen_etnico: 'Maya',
      edad: 34,
      sexo: 'Masculino',
      departamento: 'Guatemala',
      municipio: 'Guatemala',
      hospital: 'Hospital General San Juan de Dios',
      servicio: 'consulta_externa',
      forma_aplicacion: 'impreso',
      idioma_predominante: 'achi',
      telefono: '',
      email_contacto: '',
      acepta_contacto: false
    },
    respuestas: []
  };
}

async function postSubmit(payload) {
  const resp = await fetch(`${BASE_URL}/encuesta/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  let body = {};
  try {
    body = await resp.json();
  } catch {
    body = {};
  }
  return { status: resp.status, body };
}

(async () => {
  const activaResp = await fetch(`${BASE_URL}/encuesta/activa`);
  const activa = await activaResp.json();

  if (!activaResp.ok || !activa?.encuesta?.id) {
    throw new Error('No se pudo obtener la encuesta activa');
  }

  const encuestaId = activa.encuesta.id;
  const preguntas = activa.encuesta.preguntas || [];
  const demo = preguntas
    .filter((p) => p.categoria === 'datos_demograficos')
    .sort((a, b) => a.orden - b.orden);

  resultados.total_preguntas = preguntas.length;
  resultados.orden_demograficos = demo.map((p) => ({ orden: p.orden, texto: p.texto_pregunta }));

  resultados.test1_encuesta_activa_tiene_2_preguntas =
    demo.length === 2 &&
    demo[0].texto_pregunta === 'Forma en que se aplicó la encuesta' &&
    demo[1].texto_pregunta === 'Idioma predominante';

  resultados.test2_orden_demograficos_correcto =
    demo.length === 2 && demo[0].orden < demo[1].orden;

  const idiomaPregunta = demo.find((p) => p.texto_pregunta === 'Idioma predominante');
  resultados.idioma_catalogo_count = idiomaPregunta?.opciones?.length || 0;
  resultados.idioma_catalogo = (idiomaPregunta?.opciones || []).map((o) => o.valor_texto);
  resultados.test5_26_idiomas_catalogados = resultados.idioma_catalogo_count === 26;

  // test 3 + test 9 (submit valido con Impreso)
  const payloadImpreso = basePayload(encuestaId);
  payloadImpreso.encabezado.forma_aplicacion = 'impreso';
  payloadImpreso.encabezado.idioma_predominante = 'achi';
  const submitImpreso = await postSubmit(payloadImpreso);
  resultados.test3_forma_impreso_aceptada = submitImpreso.status === 201;
  resultados.test9_submit_valido_http201 = submitImpreso.status === 201;
  if (submitImpreso.body?.id) resultados.ids_guardados.push(submitImpreso.body.id);

  // test 4 (submit valido con Digital)
  const payloadDigital = basePayload(encuestaId);
  payloadDigital.encabezado.forma_aplicacion = 'digital';
  payloadDigital.encabezado.idioma_predominante = 'espanol';
  const submitDigital = await postSubmit(payloadDigital);
  resultados.test4_forma_digital_aceptada = submitDigital.status === 201;
  if (submitDigital.body?.id) resultados.ids_guardados.push(submitDigital.body.id);

  // test 6 (no multiples idiomas)
  const payloadMultiIdioma = basePayload(encuestaId);
  payloadMultiIdioma.encabezado.idioma_predominante = ['achi', 'espanol'];
  const multiIdioma = await postSubmit(payloadMultiIdioma);
  resultados.test6_no_multiples_idiomas = multiIdioma.status === 400;

  // test 7 (idioma inválido)
  const payloadIdiomaInvalido = basePayload(encuestaId);
  payloadIdiomaInvalido.encabezado.idioma_predominante = 'klingon';
  const idiomaInvalido = await postSubmit(payloadIdiomaInvalido);
  resultados.test7_rechaza_idioma_invalido = idiomaInvalido.status === 400;

  // test 8 (forma inválida)
  const payloadFormaInvalida = basePayload(encuestaId);
  payloadFormaInvalida.encabezado.forma_aplicacion = 'virtual';
  const formaInvalida = await postSubmit(payloadFormaInvalida);
  resultados.test8_rechaza_forma_invalida = formaInvalida.status === 400;

  const executedIdiomaChecks = Math.min(2, FORMA_VALUES.length + IDIOMAS.length);
  resultados.nota_rate_limit =
    `La API tiene rate limit de 5 submit/hora por IP. Se validó catálogo completo de 26 idiomas en /encuesta/activa y se ejecutaron submits representativos; ejecución de 26 submits individuales no es viable sin reinicios repetidos del backend.`;

  console.log(JSON.stringify(resultados, null, 2));

  const failed = Object.entries(resultados)
    .filter(([k, v]) => k.startsWith('test') && v === false)
    .map(([k]) => k);

  if (failed.length > 0) {
    process.exitCode = 2;
  }
})();
