export const FORMA_APLICACION_OPCIONES = [
  { value: 'impreso', label: 'Impreso' },
  { value: 'digital', label: 'Digital' }
];

export const IDIOMA_PREDOMINANTE_OPCIONES = [
  { value: 'achi', label: 'Achi' },
  { value: 'akateko', label: 'Akateko' },
  { value: 'awakateco', label: 'Awakateco' },
  { value: 'chalchiteko', label: 'Chalchiteko' },
  { value: 'chorti', label: 'Ch´orti' },
  { value: 'chuj', label: 'Chuj' },
  { value: 'itza', label: 'Itza' },
  { value: 'ixil', label: 'Ixil' },
  { value: 'jakalteko', label: 'Jakalteko' },
  { value: 'kaqchikel', label: 'Kaqchikel' },
  { value: 'kiche', label: 'K´iche´' },
  { value: 'mam', label: 'Mam' },
  { value: 'mopan', label: 'Mopán' },
  { value: 'pocomam', label: 'Pocomam' },
  { value: 'poqomchi', label: 'Poqomchi' },
  { value: 'qanjobal', label: 'Q´anjob´al' },
  { value: 'qeqchi', label: 'Q´eqchi´' },
  { value: 'sakapulteco', label: 'Sakapulteco' },
  { value: 'sipakapense', label: 'Sipakapense' },
  { value: 'tektiteko', label: 'Tektiteko' },
  { value: 'tzutujil', label: 'Tz´utujil' },
  { value: 'uspanteko', label: 'Uspanteko' },
  { value: 'xinca', label: 'Xinca' },
  { value: 'garifuna', label: 'Garífuna' },
  { value: 'espanol', label: 'Español' },
  { value: 'otros', label: 'Otros' }
];

export const FORMA_APLICACION_LABEL_A_VALUE = Object.fromEntries(
  FORMA_APLICACION_OPCIONES.map((op) => [op.label, op.value])
);

export const IDIOMA_PREDOMINANTE_LABEL_A_VALUE = Object.fromEntries(
  IDIOMA_PREDOMINANTE_OPCIONES.map((op) => [op.label, op.value])
);

export const FORMA_APLICACION_VALUE_A_LABEL = Object.fromEntries(
  FORMA_APLICACION_OPCIONES.map((op) => [op.value, op.label])
);

export const IDIOMA_PREDOMINANTE_VALUE_A_LABEL = Object.fromEntries(
  IDIOMA_PREDOMINANTE_OPCIONES.map((op) => [op.value, op.label])
);

export const FORMA_APLICACION_PERMITIDAS = FORMA_APLICACION_OPCIONES.map((op) => op.value);
export const IDIOMAS_PREDOMINANTES_PERMITIDOS = IDIOMA_PREDOMINANTE_OPCIONES.map((op) => op.value);
