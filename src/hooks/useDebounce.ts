// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debounce (retrasar) un valor.
 * Útil para evitar llamadas a API en cada pulsación de tecla.
 * @param value El valor a debouncing.
 * @param delay El tiempo de retraso en milisegundos.
 * @returns El valor después del retraso.
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Establecer un temporizador para actualizar el valor debounced después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el temporizador si el valor cambia (o al desmontar el componente)
    // Esto evita que el valor se actualice si el usuario sigue escribiendo.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se vuelve a ejecutar si el valor o el delay cambian

  return debouncedValue;
};