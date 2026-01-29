const crypto = require('crypto');

// AES configuration
const AES_ALGORITHM = 'aes-256-cbc';
// Ensure the key is exactly 32 bytes for aes-256-cbc
const AES_SECRET_RAW = process.env.AES_SECRET || 'fallback_secret_for_demo_purposes_only_123';
const AES_KEY = crypto.createHash('sha256').update(AES_SECRET_RAW).digest();
const AES_IV_LENGTH = 16;

/**
 * AES Encryption (Symmetric)
 * Used for sensitive data like marks and answers
 */
const encryptAES = (text) => {
    const iv = crypto.randomBytes(AES_IV_LENGTH);
    const cipher = crypto.createCipheriv(AES_ALGORITHM, Buffer.from(AES_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    // Return IV + Encrypted data as Base64
    return iv.toString('base64') + ':' + encrypted.toString('base64');
};

/**
 * AES Decryption
 */
const decryptAES = (text) => {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'base64');
    const encryptedText = Buffer.from(textParts.join(':'), 'base64');
    const decipher = crypto.createDecipheriv(AES_ALGORITHM, Buffer.from(AES_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

/**
 * RSA Key Pair Generation (Asymmetric)
 * Used for Key Exchange simulation and Digital Signatures
 */
const generateRSAKeys = () => {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
};

/**
 * Digital Signature (SHA-256 with RSA)
 * Used to ensure integrity and authenticity of exam submissions
 */
const signData = (data, privateKey) => {
    const signer = crypto.createSign('sha256');
    signer.update(JSON.stringify(data));
    signer.end();
    return signer.sign(privateKey, 'base64');
};

/**
 * Verify Digital Signature
 */
const verifySignature = (data, signature, publicKey) => {
    // Demo Mode: If the signature starts with our mock prefix 'SIG_', we verify the hash part
    if (signature && signature.startsWith('SIG_')) {
        const hashPart = signature.split('_')[1];
        const currentHash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
        return hashPart === currentHash;
    }

    // Standard Mode: Real RSA verification
    try {
        const verifier = crypto.createVerify('sha256');
        verifier.update(JSON.stringify(data));
        verifier.end();
        return verifier.verify(publicKey, signature, 'base64');
    } catch (e) {
        return false;
    }
};

/**
 * SHA-256 Hashing
 * Used for integrity checks
 */
const hashData = (data) => {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
};

module.exports = {
    encryptAES,
    decryptAES,
    generateRSAKeys,
    signData,
    verifySignature,
    hashData,
    AES_KEY // Exported for demonstration purposes
};
