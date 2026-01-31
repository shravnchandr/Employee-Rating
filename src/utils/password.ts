// Simple password hashing using SHA-256
// For browser/Electron compatibility without external dependencies

export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    // Handle legacy plaintext passwords (for migration)
    if (!hash.match(/^[a-f0-9]{64}$/)) {
        // It's a plaintext password, compare directly
        return password === hash;
    }
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

// Synchronous version for simple checks (uses the stored hash directly)
export function verifyPasswordSync(password: string, storedPassword: string): boolean {
    // For legacy plaintext passwords
    if (!storedPassword.match(/^[a-f0-9]{64}$/)) {
        return password === storedPassword;
    }
    // For hashed passwords, we need async - this is a fallback
    // In practice, use the async version
    return false;
}
