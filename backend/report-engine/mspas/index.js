const { idiomaPredominanteContract } = require('./contracts/idiomaPredominanteContract');
const { mapIdiomaPredominanteToExcel } = require('./pipeline/mapIdiomaPredominante');
const { MSPASCoreEngine } = require('./engine');

module.exports = {
  core: {
    MSPASCoreEngine
  },
  contracts: {
    idiomaPredominante: idiomaPredominanteContract
  },
  pipeline: {
    mapIdiomaPredominanteToExcel
  }
};
