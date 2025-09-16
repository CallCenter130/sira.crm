// =================================================================================================
// ARCHIVO: src/components/dialogs/EmpresaDialog.tsx
// INSTRUCCIÓN: REEMPLAZO COMPLETO
// =================================================================================================

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, MenuItem } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useEffect } from 'react';
import type { IEmpresa } from '../../services/mockApi';

interface EmpresaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: IEmpresa;
}

// 1. Definimos las opciones aquí, ya que ahora pertenecen a este componente
const opcionesRazonSocial = [
  { value: 'PN', label: 'Persona Natural' },
  { value: 'PJ', label: 'Persona Jurídica' },
];

export const EmpresaDialog = ({ open, onClose, onSave, initialData }: EmpresaDialogProps) => {
  const { register, handleSubmit, reset, control } = useForm({ defaultValues: initialData });
  const isUpdateMode = !!initialData;

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset(initialData);
      } else {
        // 2. Actualizamos el reset para el modo de creación
        reset({ RAZON_SOCIAL: '', NOMBRE_COMERCIAL: '', TIPO_RAZON_SOCIAL: '', DIRECCION: '', DISTRITO: '', TELEFONO: '', EMAIL: '' });
      }
    }
  }, [open, initialData, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSave)}>
        <DialogTitle>{isUpdateMode ? 'Actualizar Información de Empresa' : 'Registrar Nueva Empresa'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField 
              label="Empresa Involucrada (Razón Social)" 
              {...register('RAZON_SOCIAL')} 
              required 
              disabled={isUpdateMode} 
            />
            <TextField 
              label="Nombre Comercial" 
              {...register('NOMBRE_COMERCIAL')} 
              required 
            />

            {/* 3. AÑADIMOS EL NUEVO CAMPO SELECT AQUÍ */}
            <Controller
                name="TIPO_RAZON_SOCIAL"
                control={control}
                rules={{ required: 'Este campo es requerido' }}
                render={({ field, fieldState: { error } }) => (
                    <TextField
                        {...field}
                        select
                        fullWidth
                        label="Tipo de Razón Social"
                        required
                        error={!!error}
                        helperText={error?.message}
                    >
                        {opcionesRazonSocial.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
            />

            <TextField label="Dirección Exacta" {...register('DIRECCION')} required />
            <TextField label="Distrito" {...register('DISTRITO')} required />
            <TextField label="Número Telefónico" {...register('TELEFONO')} required />
            <TextField label="Correo Electrónico" {...register('EMAIL')} type="email" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained">{isUpdateMode ? 'Actualizar' : 'Guardar'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};