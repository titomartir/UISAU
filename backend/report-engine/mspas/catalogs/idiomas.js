const { createCatalogLookup } = require('../core/catalogMapper');

const idiomaEntries = [
  { code: 1, canonical: 'Achi', aliases: ['Achi'] },
  { code: 2, canonical: 'Akateko', aliases: ['Akateko'] },
  { code: 3, canonical: 'Awakateco', aliases: ['Awakateco'] },
  { code: 4, canonical: 'Chalchiteko', aliases: ['Chalchiteko'] },
  { code: 5, canonical: 'Chaltiteko', aliases: ['Chaltiteko', "Ch'orti", "Ch'orti'", 'Chorti'] },
  { code: 6, canonical: 'Chuj', aliases: ['Chuj'] },
  { code: 7, canonical: 'Itza', aliases: ['Itza'] },
  { code: 8, canonical: 'Ixil', aliases: ['Ixil'] },
  { code: 9, canonical: 'Jakalteko', aliases: ['Jakalteko'] },
  { code: 10, canonical: 'Kaqchikel', aliases: ['Kaqchikel', "Kaqchiquel"] },
  { code: 11, canonical: "K'iche'", aliases: ["K'iche'", 'Kiche', 'Quiche'] },
  { code: 12, canonical: 'Mam', aliases: ['Mam'] },
  { code: 13, canonical: 'Mopan', aliases: ['Mopan', 'Mopan'] },
  { code: 14, canonical: 'Pocomam', aliases: ['Pocomam', 'Poqomam'] },
  { code: 15, canonical: 'Poqomchi', aliases: ['Poqomchi', 'Pocomchi'] },
  { code: 16, canonical: "Q'anjob'al", aliases: ["Q'anjob'al", 'Qanjobal'] },
  { code: 17, canonical: "Q'eqchi'", aliases: ["Q'eqchi'", 'Qeqchi', 'Kekchi'] },
  { code: 18, canonical: 'Sakapulteco', aliases: ['Sakapulteco'] },
  { code: 19, canonical: 'Sipakapense', aliases: ['Sipakapense'] },
  { code: 20, canonical: 'Tektiteko', aliases: ['Tektiteko'] },
  { code: 21, canonical: "Tz'utujil", aliases: ["Tz'utujil", 'Tzutujil'] },
  { code: 22, canonical: 'Uspanteko', aliases: ['Uspanteko'] },
  { code: 23, canonical: 'Xinca', aliases: ['Xinca', 'Xinka'] },
  { code: 24, canonical: 'Garifuna', aliases: ['Garifuna'] },
  { code: 25, canonical: 'Espanol', aliases: ['Espanol', 'Castellano'] },
  { code: 26, canonical: 'Otro (idiomas extranjeros)', aliases: ['Otro', 'Otro idioma', 'Idiomas extranjeros', 'Extranjero', 'No especificado'] }
];

const idiomaLookup = createCatalogLookup(idiomaEntries);

module.exports = {
  idiomaEntries,
  idiomaLookup
};
