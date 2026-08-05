'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
DO $$
BEGIN
  IF to_regclass('public.respuestas_encabezado') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE respuestas_encabezado
    ADD COLUMN IF NOT EXISTS forma_aplicacion VARCHAR(30),
    ADD COLUMN IF NOT EXISTS idioma_predominante VARCHAR(50);

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'respuestas_encabezado_forma_aplicacion_chk'
      AND conrelid = 'public.respuestas_encabezado'::regclass
  ) THEN
    ALTER TABLE respuestas_encabezado
      ADD CONSTRAINT respuestas_encabezado_forma_aplicacion_chk
      CHECK (
        forma_aplicacion IS NULL
        OR forma_aplicacion IN ('impreso', 'digital')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'respuestas_encabezado_idioma_predominante_chk'
      AND conrelid = 'public.respuestas_encabezado'::regclass
  ) THEN
    ALTER TABLE respuestas_encabezado
      ADD CONSTRAINT respuestas_encabezado_idioma_predominante_chk
      CHECK (
        idioma_predominante IS NULL
        OR idioma_predominante IN (
          'achi',
          'akateko',
          'awakateco',
          'chalchiteko',
          'chorti',
          'chuj',
          'itza',
          'ixil',
          'jakalteko',
          'kaqchikel',
          'kiche',
          'mam',
          'mopan',
          'pocomam',
          'poqomchi',
          'qanjobal',
          'qeqchi',
          'sakapulteco',
          'sipakapense',
          'tektiteko',
          'tzutujil',
          'uspanteko',
          'xinca',
          'garifuna',
          'espanol',
          'otros'
        )
      );
  END IF;
END $$;
`);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
DO $$
BEGIN
  IF to_regclass('public.respuestas_encabezado') IS NULL THEN
    RETURN;
  END IF;

  ALTER TABLE respuestas_encabezado
    DROP CONSTRAINT IF EXISTS respuestas_encabezado_forma_aplicacion_chk,
    DROP CONSTRAINT IF EXISTS respuestas_encabezado_idioma_predominante_chk;

  ALTER TABLE respuestas_encabezado
    DROP COLUMN IF EXISTS forma_aplicacion,
    DROP COLUMN IF EXISTS idioma_predominante;
END $$;
`);
  }
};