/**
 * Digital Signature Simulation (since true RSA in browser requires keys)
 * In a real app, we'd use Web Crypto API to sign with Student's Private Key
 */
export const signData = async (data, privateKeyPEM) => {
    // For demonstration, we'll prefix data with a simulated "signature"
    // In a real implementation, this would use a library like 'forge' or Web Crypto API
    const hash = await sha256(JSON.stringify(data));
    return `SIG_${hash}_${btoa(privateKeyPEM.substring(30, 60))}`;
};

export const sha256 = async (message) => {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Verification of Integrity
 */
export const verifyIntegrity = async (receivedData, receivedSignature) => {
    // Mock verification
    return receivedSignature.startsWith('SIG_');
};
