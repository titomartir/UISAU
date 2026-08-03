/**
 * Utilidades de encriptación AES-256-CBC para datos sensibles (teléfono).
 * La ENCRYPTION_KEY debe tener exactamente 32 caracteres en .env.
 */
const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKey() {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('ENCRYPTION_KEY no definida en entorno.');
  }

  if (raw.length !== 32) {
    throw new Error('ENCRYPTION_KEY debe tener exactamente 32 caracteres.');
  }

  return Buffer.from(raw, 'utf8');
}

/**
 * Encripta un texto y devuelve el resultado en formato "iv_hex:encrypted_hex"
 * @param {string|number} text
 * @returns {string|null}
 */
function encrypt(text) {
  if (text === null || text === undefined || text === '') return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Desencripta un texto en formato "iv_hex:encrypted_hex"
 * @param {string} encryptedText
 * @returns {string|null}
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}

module.exports = { encrypt, decrypt };
