// =================================================================================================
// ARCHIVO: src/components/form-sections/GestionSection.tsx (VERSIÓN CON OBSERVACIONES APLICADAS)
// =================================================================================================

import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import type { Control, FieldErrors, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import {
    Paper, Stack, Typography, TextField, MenuItem, Autocomplete, createFilterOptions, Grid,
    Checkbox, Button, Box, CircularProgress
} from '@mui/material';
import { AddCircleOutline, Edit } from '@mui/icons-material';

// Tipos y Esquema
import type { CaseFormValues } from '../../schemas/case.schema';
import type { IService, IEmpresa } from '../../services/mockApi';
import type { IUbicacion } from '../../services/mockUbicacionApi'; // <<< OBSERVACIÓN 2: Importar tipo IUbicacion

// API y Diálogos
import { FeedBackSection } from './FeedBacks';
import { getServicios, getEmpresas, saveEmpresa, updateEmpresa } from '../../services/mockApi';
import { EmpresaDialog } from '../dialogs/EmpresaDialog';
import { TrabajadorSection } from './TrabajadorSection';
import { FormProvider, useFormContext } from 'react-hook-form';

// Constantes centralizadas
import {
  opcionesTipoServicio,
  opcionesRazonSocial,
  opcionesTipoDenuncia,
  opcionesActividadEconomica
} from '../../constants/formOptions';

// --- Props del Componente ---
interface GestionSectionProps {
  control: Control<CaseFormValues>;
  errors: FieldErrors<CaseFormValues>;
  watch: UseFormWatch<CaseFormValues>;
  setValue: UseFormSetValue<CaseFormValues>;
  mockUbicaciones: IUbicacion[]; // <<< OBSERVACIÓN 2: Usar el tipo IUbicacion[]
}

// --- Componente Reutilizable para campos de solo lectura ---
interface ReadOnlyFieldProps {
  label: string;
  value: string | undefined | null;
}

const ReadOnlyField = ({ label, value }: ReadOnlyFieldProps) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" color="text.secondary" component="div">
      {label}
    </Typography>
    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
      {value || '—'}
    </Typography>
  </Box>
);

const getClasificacionEmpresa = (cantidad: number | undefined): string => {
  if (!cantidad || cantidad <= 0) return '';
  if (cantidad <= 3) return 'Emprendedores';
  if (cantidad <= 10) return 'Microempresa';
  if (cantidad <= 50) return 'Pequeña Empresa';
  if (cantidad <= 100) return 'Mediana Empresa';
  return 'Gran Empresa';
};

export const GestionSection = ({ control, errors, watch, setValue, mockUbicaciones }: GestionSectionProps) => {
  // --- Observadores para la lógica condicional ---
  const tipoServicio = watch('tipoServicio');
  const lugarDesempeno = watch('lugarDesempenoLabores');
  const detalleServicio = watch('detalleServicio');
  const empresaSeleccionadaId = watch('empresaInvolucrada');
  const cantidadEmpleados = watch('cantidadEmpleados');
  const tipoDenuncia = watch('tipoDenuncia'); // <<< OBSERVACIÓN 5: Observar el tipo de denuncia
  const clasificacion = getClasificacionEmpresa(cantidadEmpleados);

  // --- Estado para datos asíncronos ---
  const [servicios, setServicios] = useState<IService[]>([]);
  const [empresas, setEmpresas] = useState<IEmpresa[]>([]);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [loadingEmpresas, setLoadingEmpresas] = useState(false);

  // --- Estado para el diálogo de Empresa ---
  const [dialogOpen, setDialogOpen] = useState(false);
  const [empresaParaEditar, setEmpresaParaEditar] = useState<IEmpresa | undefined>(undefined);
  
  // <<< OBSERVACIÓN 5: Observar el tipo de denuncia
  const mostrarCamposTrabajador = (tipoServicio === 'DEN' && tipoDenuncia === 'ESP'); 

  // --- Efectos para cargar datos de la API ---
  useEffect(() => {
    setLoadingServicios(true);
    getServicios().then(data => {
      setServicios(data);
      setLoadingServicios(false);
    });

    setLoadingEmpresas(true);
    getEmpresas().then(data => {
      setEmpresas(data);
      setLoadingEmpresas(false);
    });
  }, []);

  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    stringify: (option: IEmpresa) => `${option.NOMBRE_COMERCIAL} ${option.RAZON_SOCIAL}`,
  });

  // --- Efecto para auto-rellenar datos de la empresa seleccionada ---
  useEffect(() => {
    const empresaSeleccionada = empresas.find(e => e.ID_REGEMP === empresaSeleccionadaId);
    if (empresaSeleccionada) {
      setValue('nombreComercial', empresaSeleccionada.NOMBRE_COMERCIAL);
      setValue('tipoRazonSocial', empresaSeleccionada.TIPO_RAZON_SOCIAL || '', { shouldValidate: true });
      setValue('direccionEmpresa', empresaSeleccionada.DIRECCION, { shouldValidate: true });
      setValue('distritoEmpresa', empresaSeleccionada.DISTRITO, { shouldValidate: true });
      setValue('telefonoEmpresa', empresaSeleccionada.TELEFONO, { shouldValidate: true });
      setValue('emailEmpresa', empresaSeleccionada.EMAIL || '', { shouldValidate: true });
    } else {
      setValue('nombreComercial', '');
      setValue('tipoRazonSocial', '');
      setValue('direccionEmpresa', '');
      setValue('distritoEmpresa', '');
      setValue('telefonoEmpresa', '');
      setValue('emailEmpresa', '');
    }
  }, [empresaSeleccionadaId, empresas, setValue]);

  // --- Lógica de visibilidad condicional ---
  const mostrarDetalleServicio = tipoServicio === 'ASE' || tipoServicio === 'DEN';
  const mostrarCamposDenuncia = tipoServicio === 'DEN';
  
  // <<< OBSERVACIÓN 1: Lógica mejorada para mostrar campos de agresor.
  // Asumimos que el ID del servicio de Acoso es 'S-101'.
  // Esta lógica es más robusta porque `detalleServicio` puede ser undefined al inicio.
  const mostrarCamposAgresor = Array.isArray(detalleServicio) && detalleServicio.includes('S-101');
  
  const mostrarCamposCasaMatriz = !!empresaSeleccionadaId;
  const mostrarCamposSucursal = lugarDesempeno === 'SU';
  
  // <<< OBSERVACIÓN 5: Lógica para mostrar la sección de comentarios
  const mostrarConsultaYRespuesta = (tipoServicio === 'ASE');
  const mostrarDenProgComentarios = (tipoServicio === 'DEN' && tipoDenuncia === 'PRO');
  const mostrarDenEspComentarios = (tipoServicio === 'DEN' && tipoDenuncia === 'ESP');
  // --- Manejadores para el diálogo de Empresa ---
  const handleOpenNewEmpresaDialog = () => {
    setEmpresaParaEditar(undefined);
    setDialogOpen(true);
  };

  const handleOpenUpdateEmpresaDialog = () => {
    const empresa = empresas.find(e => e.ID_REGEMP === empresaSeleccionadaId);
    if (empresa) {
        setEmpresaParaEditar(empresa);
        setDialogOpen(true);
    }
  };

  const handleSaveEmpresa = async (data: any) => {
    try {
        let savedEmpresa: IEmpresa;
        if (empresaParaEditar) {
            savedEmpresa = await updateEmpresa(empresaParaEditar.ID_REGEMP, data);
            setEmpresas(prev => prev.map(e => e.ID_REGEMP === savedEmpresa.ID_REGEMP ? savedEmpresa : e));
        } else {
            savedEmpresa = await saveEmpresa(data);
            setEmpresas(prev => [...prev, savedEmpresa]);
        }
        setValue('empresaInvolucrada', savedEmpresa.ID_REGEMP, { shouldValidate: true });
        setDialogOpen(false);
    } catch (error) {
        console.error("Error guardando empresa:", error);
    }
  };

  const empresaSeleccionada = empresas.find(e => e.ID_REGEMP === empresaSeleccionadaId);

  return (
    <>
      <Paper elevation={1} sx={{ p: 4, mb: 3 , backgroundColor: '#f9f9f9' }}>
        <Stack spacing={2}>
            <Grid container spacing={2}>
                {/* --- Tipo de Servicio 
                <Grid item xs={12} md={mostrarDetalleServicio ? 6 : 12}>
                    <Controller name="tipoServicio" control={control} render={({ field }) => (
                        <TextField {...field} select required label="Tipo de Servicio" fullWidth size="small" sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }} error={!!errors.tipoServicio} helperText={errors.tipoServicio?.message} >
                        {opcionesTipoServicio.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                        </TextField>
                    )}/>
                </Grid>--- */}

                {/* --- Detalle de Servicio (Condicional) --- */}
                {mostrarDetalleServicio && (
                <Grid item xs={12} md={6}>
                    <Controller name="detalleServicio" control={control} render={({ field }) => (
                        <Autocomplete
                            multiple
                            options={servicios}
                            loading={loadingServicios}
                            groupBy={(option) => `${option.DIRECCION_RESPONSABLE} - ${option.UNIDAD_RESPONSABLE}`}
                            getOptionLabel={(option) => option.NOMBRE_SERVICIO}
                            onChange={(_, data) => field.onChange(data.map(d => d.ID_SERVICIO))}
                            value={servicios.filter(s => Array.isArray(field.value) && field.value.includes(s.ID_SERVICIO))}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label="Detalle(s) de Servicio" 
                                    required
                                    size="small"
                                    sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }}
                                    error={!!errors.detalleServicio}
                                    helperText={errors.detalleServicio?.message as string}
                                    InputProps={{ ...params.InputProps, endAdornment: (<>{loadingServicios ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>)}}
                                />
                            )}
                        />
                    )}/>
                </Grid>
                )}
            </Grid>

            {/* --- Contenedor Principal para Campos de Denuncia --- */}
            {mostrarCamposDenuncia && (
            <Stack spacing={2} sx={{ borderTop: '1px solid #e0e0e0', pt: 2, mt: 2 }}>
                
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Información de la Denuncia</Typography>
                
                {/* --- Campos de Agresor (Condicional) --- */}
                {mostrarCamposAgresor && (
                    <Paper variant="outlined" sx={{ p: 2, borderColor: 'primary.main' }}>
                        <Typography color="primary" variant="subtitle1" sx={{ mb: 2 }}>Información sobre Acoso/Maltrato</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Nombre del Agresor" {...control.register('nombreAgresor')} required size="small" sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }} error={!!errors.nombreAgresor} helperText={errors.nombreAgresor?.message} />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField fullWidth label="Cargo del Agresor" {...control.register('cargoAgresor')} required size="small" sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }} error={!!errors.cargoAgresor} helperText={errors.cargoAgresor?.message} />
                            </Grid>
                        </Grid>
                    </Paper>
                )}

                {/* --- Búsqueda y Gestión de Empresa --- */}
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>Empresa Denunciada</Typography>
                    <Controller name="empresaInvolucrada" control={control} render={({ field }) => {
                        const selectedValue = empresas.find(empresa => empresa.ID_REGEMP === field.value) || null;
                        return (
                            <Autocomplete
                                options={empresas}
                                loading={loadingEmpresas}
                                getOptionLabel={(option) => option.NOMBRE_COMERCIAL || ""}
                                filterOptions={filterOptions}
                                onChange={(_, newValue) => field.onChange(newValue ? newValue.ID_REGEMP : '')}
                                value={selectedValue}
                                isOptionEqualToValue={(option, value) => option.ID_REGEMP === value.ID_REGEMP}
                                renderInput={(params) => <TextField {...params} required label="Buscar Empresa por Nombre Comercial o Razón Social" size="small" error={!!errors.empresaInvolucrada} helperText={errors.empresaInvolucrada?.message} />}
                                renderOption={(props, option) => (<Box component="li" {...props} key={option.ID_REGEMP}><Stack><Typography variant="body1">{option.NOMBRE_COMERCIAL}</Typography><Typography variant="caption" color="text.secondary">{option.RAZON_SOCIAL}</Typography></Stack></Box>)}
                            />
                        );
                    }}/>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                        <Button startIcon={<AddCircleOutline />} onClick={handleOpenNewEmpresaDialog}>Registrar Nueva</Button>
                        {empresaSeleccionadaId && <Button startIcon={<Edit />} onClick={handleOpenUpdateEmpresaDialog} color="secondary">Actualizar Datos</Button>}
                    </Box>
                </Paper>
                
                {/* --- Detalles de Empresa y Sucursal (si aplica) --- */}
                <Grid container spacing={2}>
                    {mostrarCamposCasaMatriz && (
                    <Grid item xs={12} md={mostrarCamposSucursal ? 6 : 12}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Datos de Casa Matriz</Typography>
                            <ReadOnlyField label="Empresa (Razón Social)" value={empresaSeleccionada?.RAZON_SOCIAL} />
                            <ReadOnlyField label="Nombre Comercial" value={watch('nombreComercial')} />
                            <ReadOnlyField 
                                label="Tipo de Razón Social" 
                                value={opcionesRazonSocial.find(opt => opt.value === watch('tipoRazonSocial'))?.label}
                            />
                            <ReadOnlyField label="Dirección" value={watch('direccionEmpresa')} />
                            {/* <<< OBSERVACIÓN 2: Lógica de Distrito para Casa Matriz --- */}
                            <ReadOnlyField 
                                label="Distrito" 
                                value={mockUbicaciones.find(loc => loc.id_distrito === watch('distritoEmpresa'))?.Distrito} 
                            />
                            <ReadOnlyField label="Teléfono" value={watch('telefonoEmpresa')} />
                            <ReadOnlyField label="Email" value={watch('emailEmpresa')} />
                        </Paper>
                    </Grid>
                    )}
                    {mostrarCamposSucursal && (
                    <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Datos de Sucursal</Typography>
                            <Stack spacing={2}>
                                <TextField label="Dirección Exacta Sucursal" {...control.register('direccionSucursal')} required size="small" sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' } }} error={!!errors.direccionSucursal} helperText={errors.direccionSucursal?.message} />
                                {/* <<< OBSERVACIÓN 2: Autocomplete de Distrito para Sucursal --- */}
                                <Controller 
                                    name="distritoSucursal" 
                                    control={control} 
                                    render={({ field }) => (
                                        <Autocomplete
                                            fullWidth
                                            options={mockUbicaciones}
                                            size="small" 
                                            sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }} 
                                            groupBy={(option) => option.Municipio}
                                            getOptionLabel={(option) => option.Distrito}
                                            onChange={(_, data) => field.onChange(data ? data.id_distrito.toString() : '')}
                                            value={mockUbicaciones.find(loc => loc.id_distrito === field.value) || null}
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    label="Distrito Sucursal" 
                                                    required 
                                                    error={!!errors.distritoSucursal} 
                                                    helperText={errors.distritoSucursal?.message} 
                                                />
                                            )}
                                        />
                                    )}
                                />
                                <TextField label="Teléfono Sucursal" {...control.register('telefonoSucursal')} required size="small" sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' } }} error={!!errors.telefonoSucursal} helperText={errors.telefonoSucursal?.message} />
                                <TextField label="Email Sucursal" {...control.register('emailSucursal')} type="email" size="small" sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' } }} error={!!errors.emailSucursal} helperText={errors.emailSucursal?.message} />
                            </Stack>
                        </Paper>
                    </Grid>
                    )}
                </Grid>
                
                {empresaSeleccionadaId && (
                    <Controller name="lugarDesempenoLabores" control={control} render={({ field }) => (
                        <Box textAlign="right">
                            <Checkbox
                                checked={field.value === 'SU'}
                                onChange={(e) => field.onChange(e.target.checked ? 'SU' : 'CM')}
                            />
                            <Typography variant="caption" component="span">
                                ¿Las labores se desempeñan en una sucursal distinta a la casa matriz?
                            </Typography>
                        </Box>
                    )}/>
                )}
                
                {/* --- Campos Generales de Denuncia --- */}
                <Grid container spacing={2} alignItems="flex-start">
                    {/* <<< OBSERVACIÓN 3: Ajuste de tamaño de columnas (Grid) --- */}
                    <Grid item xs={12} sm={6} md={3}>
                        <Controller name="actividadEconomica" control={control} render={({ field }) => (
                            <TextField {...field} select fullWidth label="Actividad Económica" required size="small" sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }} error={!!errors.actividadEconomica} helperText={errors.actividadEconomica?.message}>
                                {opcionesActividadEconomica.map((option) => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>))}
                            </TextField>
                        )}/>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Controller name="cantidadEmpleados" control={control} render={({ field }) => (
                            <TextField 
                                {...field} 
                                type="number" 
                                fullWidth 
                                label="N° Empleados"
                                required 
                                size="small" 
                                // <<< OBSERVACIÓN 4: Estilos para centrar el texto ---
                                sx={{ 
                                    '& .MuiInputBase-input': { 
                                        textAlign: 'center',
                                        textTransform: 'uppercase' 
                                    }, 
                                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' 
                                }} 
                                error={!!errors.cantidadEmpleados} 
                                helperText={errors.cantidadEmpleados?.message} 
                                onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} value={field.value ?? ''} 
                            />
                        )}/>
                    </Grid>
                    <Grid item xs={12} sm={12} md={6}>
                        <Controller name="tipoDenuncia" control={control} render={({ field }) => (
                            <TextField {...field} select fullWidth label="Tipo de Denuncia" required size="small" sx={{ '& .MuiInputBase-input': { textTransform: 'uppercase' }, boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.15)' }} error={!!errors.tipoDenuncia} helperText={errors.tipoDenuncia?.message}>
                                {opcionesTipoDenuncia.map((option) => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>))}
                            </TextField>
                        )}/>
                    </Grid>
                </Grid>
                
                {clasificacion && (
                    <Typography variant="body2" align="center" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        Clasificación de empresa: <strong>{clasificacion}</strong>
                    </Typography>
                )}
            </Stack>
            )}
        </Stack>
      </Paper>
      
      {/* <<< OBSERVACIÓN 5: La visibilidad de esta sección ahora depende de 'mostrarConsultaYRespuesta' --- */}
      {mostrarDenEspComentarios  && <TrabajadorSection />}
      {mostrarConsultaYRespuesta && <FeedBackSection control={control} errors={errors} />}      
      {/* {mostrarDenEspComentarios  && <TrabajadorSection />}*/}
      {mostrarDenEspComentarios && <FeedBackSection control={control} errors={errors} />} 
      {mostrarDenProgComentarios && <FeedBackSection control={control} errors={errors} />} 
      
      <EmpresaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveEmpresa}
        initialData={empresaParaEditar}
        mockUbicaciones={mockUbicaciones} // <<< OBSERVACIÓN 2: Pasar ubicaciones al diálogo
      />
    </>
  );
};