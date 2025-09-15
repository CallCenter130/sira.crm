// src/components/form-sections/ContactoSection.tsx

import React, { useEffect } from 'react';

// --- Importaciones de react-hook-form ---
import { Controller } from 'react-hook-form';
import type { Control, UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue } from 'react-hook-form';

// --- Importaciones de Material-UI ---
import { Typography, TextField, Paper, Stack, MenuItem, Checkbox, FormControlLabel, Grid, Autocomplete, CircularProgress, Tooltip, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { IUbicacion } from '../../services/mockUbicacionApi';
import type { CaseFormValues } from '../../schemas/case.schema';

// --- Props que el componente necesita del formulario padre ---
interface ContactoSectionProps {
  control: Control<CaseFormValues>;
  register: UseFormRegister<CaseFormValues>;
  errors: FieldErrors<CaseFormValues>;
  watch: UseFormWatch<CaseFormValues>;
  setValue: UseFormSetValue<CaseFormValues>;
  isAnonimo: boolean;
  setIsAnonimo: (value: boolean) => void;
  mockUbicaciones: IUbicacion[]; 
  tipoContactoDetectado: 'local' | 'internacional' | 'digital' | 'otro';
  isFetchingCountry: boolean;
  canalContactoValue: string;
  opcionesSexo: { value: string; label: string }[];
  opcionesTipoContacto: { value: string; label: string }[];
  opcionesCanalTelefono: { value: string; label: string }[];
}

const selectMenuProps = {
  PaperProps: {
    elevation: 8,
    sx: { '& .MuiMenuItem-root:nth-of-type(even)': { backgroundColor: (theme) => theme.palette.action.hover } },
  },
};

// --- Componente Principal ContactoSection ---
export const ContactoSection = ({
  control,
  register,
  errors,
  watch,
  setValue,
  isAnonimo,
  setIsAnonimo,
  tipoContactoDetectado,
  isFetchingCountry,
  canalContactoValue,
  mockUbicaciones,
  opcionesSexo,
  opcionesTipoContacto,
  opcionesCanalTelefono,
}: ContactoSectionProps) => {

  useEffect(() => {
    if (isAnonimo) {
      setValue('nombreCompleto', 'ANÓNIMO', { shouldValidate: true });
    } else if (watch('nombreCompleto') === 'ANÓNIMO') {
      setValue('nombreCompleto', '', { shouldValidate: true });
    }
  }, [isAnonimo, setValue, watch]);

  return (
    <Paper elevation={1} sx={{ p: 4, mb: 3 }}>
      <Stack spacing={1}>
        <Typography  variant="h5" align="left" sx={{ pt: 1, fontWeight: 'bold',
          textShadow: '-2px -2px 2px rgba(0,0,0,0.2), 1px 1px 1px rgba(255,255,255,0.8)' }}>Datos de Usuario</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} md={6}>
            <Tooltip
              title={
                  // Usamos un Stack vertical para apilar la línea del título y la lista
                  <Stack spacing={1}> 
                      {/* Un Stack horizontal para el icono y el texto introductorio */}
                      <Stack direction="row" spacing={1} alignItems="center">
                          <InfoOutlinedIcon fontSize="small" />
                          <Typography variant="body2">
                              Ingresa el medio por el cual se contactó el usuario. Algunos ejemplos:
                          </Typography>
                      </Stack>
                      {/* Un Typography para la lista, con padding a la izquierda para alinearla */}
                      <Typography variant="caption" component="div" sx={{ pl: 3.5 }}>
                          • Número de Teléfono <strong>local 8 dígitos</strong>
                          <br />
                          • Número es internacional anteponer (<strong> + </strong>)
                          <br />
                          • Correo Electrónico (<strong>correo@ejemplo.com</strong>)
                      </Typography>
                  </Stack>
              }
          >
              <TextField
                fullWidth
                label="Contacto"
                {...register('contacto')}
              required
              error={!!errors.contacto}
              size="small"
              sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }}
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} md={6}>
            {/* --- C|AMBIO CLAVE: Usamos Stack en lugar de Box --- */}
            {/* Por defecto, Stack apila verticalmente. ¡Justo lo que necesitamos! */}
            <Stack>
              <Tooltip
                title={
                    <Stack direction="row" spacing={1} alignItems="center">
                        <InfoOutlinedIcon fontSize="small" />
                        <Typography variant="body2">
                            Recuerda que al momento de saludar al usuario debes preguntar:<br />
                            <strong>¿Con quien tengo el gusto de hablar?</strong>, <br />Si no desea identificarse, marca la casilla de <em>Anónimo</em>.
                        </Typography>
                    </Stack>
                }>
              <TextField
                fullWidth
                label="Nombre Completo del Contacto"
                {...register('nombreCompleto')}
                required
                disabled={isAnonimo}
                error={!!errors.nombreCompleto}
                helperText={errors.nombreCompleto?.message}
                size="small"
                sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }}
                InputLabelProps={{ shrink: isAnonimo || !!watch('nombreCompleto') }}
              /></Tooltip>
              {/* El FormControlLabel ahora se renderiza debajo del TextField */}
              <FormControlLabel
                control={<Checkbox checked={isAnonimo} onChange={(e) => setIsAnonimo(e.target.checked)} />}
                label="Anónimo"
                // Alineamos el checkbox a la izquierda para una mejor apariencia
                sx={{ alignSelf: 'flex-start' }} 
              />
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Controller
              name="sexo"
              control={control}
              render={({ field }) => (
                <TextField {...field} select required label="Sexo del Contacto" fullWidth error={!!errors.sexo} helperText={errors.sexo?.message} 
                size="small" 
                sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, 
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }} 
                SelectProps={{ MenuProps: selectMenuProps }}>
                  {opcionesSexo.map((opt) => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                </TextField>
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
              {tipoContactoDetectado === 'internacional' ? (
                  // --- Caso Internacional (Campo Deshabilitado) ---
                  <Stack direction="row" spacing={1} alignItems="center">
                      <TextField 
                          fullWidth 
                          label="Lugar de Contacto" 
                          value={watch('lugarContacto') || ''} 
                          disabled  
                          size="small" 
                          sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, 
                          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }} 
                          InputProps={{ 
                              readOnly: true, 
                              startAdornment: isFetchingCountry ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null 
                          }} 
                      />
                      {/* El Tooltip envuelve SÓLO al icono, que NUNCA está deshabilitado */}
                      <Tooltip
                          title={
                              <Stack direction="row" spacing={1} alignItems="center">
                                  <InfoOutlinedIcon fontSize="small" />
                                  <Typography variant="body2">
                                      País detectado automáticamente por el prefijo internacional.
                                  </Typography>
                              </Stack>
                          }
                          arrow
                      >
                          {/* El icono siempre es visible pero con un color tenue para no distraer */}
                          <InfoOutlinedIcon color="action" />
                      </Tooltip>
                  </Stack>
              ) : (
                  // --- Caso Local/Otro (Campo puede estar habilitado o deshabilitado) ---
                  <Stack direction="row" spacing={1} alignItems="center">
                      <Controller 
                          name="lugarContacto" 
                          control={control} 
                          render={({ field }) => (
                              <Autocomplete
                                  fullWidth // Asegura que ocupe el espacio disponible en el Stack
                                  disabled={tipoContactoDetectado !== 'local'}
                                  options={mockUbicaciones}
                                  size="small" 
                                  sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, 
                                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }} 
                                  groupBy={(option) => option.Municipio}
                                  getOptionLabel={(option) => option.Distrito}
                                  onChange={(_, data) => field.onChange(data ? data.id_distrito.toString() : '')}
                                  value={mockUbicaciones.find(loc => loc.id_distrito === field.value) || null}
                                  renderInput={(params) => <TextField {...params} label="Lugar de Contacto"/>}
                              />
                          )}
                      />
                      <Tooltip
                          title={
                              <Stack direction="row" spacing={1} alignItems="center">
                                  <InfoOutlinedIcon fontSize="small" />
                                  <Typography variant="body2">
                                      Este campo se activa al ingresar un número de teléfono local de 8 dígitos.
                                  </Typography>
                              </Stack>
                          }
                          arrow
                      >
                          {/* 
                            Usamos un Box para controlar la visibilidad del icono.
                            Así, el icono solo aparece si el campo está deshabilitado, evitando clutter visual.
                            'visibility: hidden' evita que el layout "salte".
                          */}
                          <Box sx={{ visibility: tipoContactoDetectado === 'local' ? 'hidden' : 'visible' }}>
                              <InfoOutlinedIcon color="action" />
                          </Box>
                      </Tooltip>
                  </Stack>
              )}
          </Grid>
           <Grid item xs={12} md={6}>
              <Controller name="tipoContacto" control={control} render={({ field }) => (
                <TextField {...field} select required label="Tipo de Usuario" 
                size="small" 
                sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, 
                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }} 
                fullWidth error={!!errors.tipoContacto} helperText={errors.tipoContacto?.message} SelectProps={{ MenuProps: selectMenuProps }}>
                  {opcionesTipoContacto.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                </TextField>
              )}/>
            </Grid>
            <Grid item xs={12} md={6}>
              {tipoContactoDetectado === 'local' || tipoContactoDetectado === 'internacional' ? (
                <Controller name="canalContacto" control={control} render={({ field }) => (
                  <TextField {...field} select required label="Canal de Contacto" fullWidth error={!!errors.canalContacto} helperText={errors.canalContacto?.message} size="small" sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }} SelectProps={{ MenuProps: selectMenuProps }}>
                    {opcionesCanalTelefono.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                  </TextField>
                )}/>
              ) : (
                <TextField 
                  fullWidth 
                  label="Canal de Contacto" 
                  {...register('canalContacto')} 
                  required 
                  error={!!errors.canalContacto} 
                  helperText={errors.canalContacto?.message} 
                  disabled 
                  InputProps={{readOnly: true}}
                  size="small" 
                  sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, 
                  boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }} 
                  InputLabelProps={{ shrink: !!canalContactoValue }}
                />
              )}
            </Grid>
        </Grid>
      </Stack>
    </Paper>
  );
};