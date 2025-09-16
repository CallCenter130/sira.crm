// src/utils/contactUtils.ts

export type ContactoTipo = 'local' | 'internacional' | 'digital' | 'otro';

/**
 * Analiza una cadena de contacto y determina su tipo.
 * @param valor La cadena de contacto (teléfono, email, usuario de red social).
 * @returns El tipo de contacto detectado.
 */
export const detectarTipoContacto = (valor: string): ContactoTipo => {
    if (!valor) return 'otro';
    const trimmedValue = valor.trim();

    // Teléfono local de 8 dígitos que empieza con 2, 6 o 7
    if (/^[267]\d{7}$/.test(trimmedValue)) return 'local';
    
    // Teléfono internacional que empieza con +
    if (/^\+\d+/.test(trimmedValue)) return 'internacional';

    // Email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);
    // Usuario de red social que empieza con @
    const isSocialMedia = /^@\w+/.test(trimmedValue);
    
    if (isEmail || isSocialMedia) return 'digital';

    return 'otro';
};