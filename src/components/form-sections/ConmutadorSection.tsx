// =================================================================================================
// ARCHIVO: src/components/form-sections/ConmutadorSection.tsx (VERSIÓN A PRUEBA DE FALLOS)
// =================================================================================================
import React, { useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Paper, Stack, Typography, TextField, MenuItem, Autocomplete, Grid, CircularProgress, Card, CardContent, Box } from '@mui/material';

// --- Tipos, API y Constantes ---
import type { CaseFormValues } from '../../schemas/case.schema';
import { opcionesConmutador } from '../../constants/formOptions';

// Aquí están las importaciones cruciales. Verificamos la ruta y el nombre del export.
import { getColaboradores, type IColaborador } from '../../services/mockColaboradores';
import { getCatalogoServicios, type ICatalogoServicio } from '../../services/mockCatalogo'; // Usamos 'import type'
import { getSedes, type ISede } from '../../services/mockSedes';
import { FeedBackSection } from './FeedBacks';

// --- Sub-componente para mostrar detalles ---
const DetailCard = ({ title, data }: { title: string, data: Record<string, any> | null }) => {
    if (!data) return null;
    return (
        <Card variant="outlined" sx={{ mt: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
            <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>{title}</Typography>
                {Object.entries(data).map(([key, value]) => (
                     <Box key={key} sx={{ display: 'flex', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', minWidth: '120px', flexShrink: 0 }}>{key.replace(/_/g, ' ')}:</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{value}</Typography>
                    </Box>
                ))}
            </CardContent>
        </Card>
    );
};


export const ConmutadorSection = () => {
    const { control, watch, formState: { errors } } = useFormContext<CaseFormValues>();
    const opcionSeleccionada = watch('conmutadorOpcion');

    // Estados para datos de API
    const [colaboradores, setColaboradores] = useState<IColaborador[]>([]);
    const [catalogo, setCatalogo] = useState<ICatalogoServicio[]>([]);
    const [sedes, setSedes] = useState<ISede[]>([]);
    const [loading, setLoading] = useState(false);

    // Estados para mostrar detalles
    const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<IColaborador | null>(null);
    const [servicioSeleccionado, setServicioSeleccionado] = useState<ICatalogoServicio | null>(null);
    const [sedeSeleccionada, setSedeSeleccionada] = useState<ISede | null>(null);
    const mostrarFeedBack = opcionSeleccionada === 'ANI' || opcionSeleccionada === 'TR';

    useEffect(() => {
        if (opcionSeleccionada === 'TR' && colaboradores.length === 0) {
            setLoading(true);
            getColaboradores().then(setColaboradores).finally(() => setLoading(false));
        }
        if (opcionSeleccionada === 'IT' && catalogo.length === 0) {
            setLoading(true);
            getCatalogoServicios().then(setCatalogo).finally(() => setLoading(false));
        }
        if (opcionSeleccionada === 'HA' && sedes.length === 0) {
            setLoading(true);
            getSedes().then(setSedes).finally(() => setLoading(false));
        }
    }, [opcionSeleccionada, colaboradores, catalogo, sedes]);

    return (
        <>
            <Paper elevation={2} sx={{ p: 3, mt: 2, backgroundColor: '#f5f5f5' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Gestión de Conmutador</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Controller
                            name="conmutadorOpcion"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} select fullWidth label="Tipo de Gestión" size="small">
                                    {opcionesConmutador.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                                </TextField>
                            )}
                        />
                    </Grid>

                {/* --- Transferencia (TR) --- */}
                {opcionSeleccionada === 'TR' && (
                    <Grid item xs={12}>
                        <Controller
                            name="conmutadorTransferenciaColaborador"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    options={colaboradores}
                                    loading={loading}
                                    getOptionLabel={(option) => option.NOMBRE_EMPLEADO}
                                    onChange={(_, data) => {
                                        field.onChange(data ? data.ID : '');
                                        setColaboradorSeleccionado(data);
                                    }}
                                    isOptionEqualToValue={(option, value) => option.ID === value.ID}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Buscar Colaborador por Nombre" size="small"
                                            InputProps={{ ...params.InputProps, endAdornment: <>{loading ? <CircularProgress size={20} /> : null}{params.InputProps.endAdornment}</> }}
                                        />
                                    )}
                                />
                            )}
                        />
                         <DetailCard title="Datos del Colaborador" data={colaboradorSeleccionado ? {
                             Extensión: colaboradorSeleccionado.EXTENSION,
                             Oficina: colaboradorSeleccionado.OFICINA,
                             Dirección: colaboradorSeleccionado.DIRECCION,
                         } : null} />
                    </Grid>
                )}

                {/* --- Información de Trámites (IT) --- */}
                {opcionSeleccionada === 'IT' && (
                     <Grid item xs={12}>
                        <Controller
                            name="conmutadorInfoTramite"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    options={catalogo}
                                    loading={loading}
                                    getOptionLabel={(option) => option.NOMBRE_SERVICIO}
                                    onChange={(_, data) => {
                                        field.onChange(data ? data.ID_SERVICIO : '');
                                        setServicioSeleccionado(data);
                                    }}
                                    isOptionEqualToValue={(option, value) => option.ID_SERVICIO === value.ID_SERVICIO}
                                    renderInput={(params) => <TextField {...params} label="Buscar Trámite o Servicio" size="small" />}
                                />
                            )}
                        />
                        <DetailCard title="Detalles del Servicio" data={servicioSeleccionado ? {
                             Objetivo: servicioSeleccionado.OBJETIVO_SERVICIO,
                             Procedimiento: servicioSeleccionado.PROCEDIMIENTO,
                         } : null} />
                     </Grid>
                )}

                {/* --- Información de Ubicación (IU) --- */}
                {opcionSeleccionada === 'IU' && (
                    <Grid item xs={12} sx={{ height: '400px' }}>
                        <iframe 
                            src="https://www.google.com/maps/d/embed?mid=1-0Zq92S1uA8Stdf8OHh4BratGDG80pU&ehbc=2E312F" 
                            width="100%" 
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            title="Mapa de Sedes MTPS"
                        ></iframe>
                    </Grid>
                )}

                {/* --- Horarios y Sedes (HA) --- */}
                {opcionSeleccionada === 'HA' && (
                    <Grid item xs={12}>
                        <Controller
                            name="conmutadorInfoSede"
                            control={control}
                            render={({ field }) => (
                                <Autocomplete
                                    options={sedes}
                                    loading={loading}
                                    getOptionLabel={(option) => option.SEDE}
                                    onChange={(_, data) => {
                                        field.onChange(data ? data.ID : '');
                                        setSedeSeleccionada(data);
                                    }}
                                    isOptionEqualToValue={(option, value) => option.ID === value.ID}
                                    renderInput={(params) => <TextField {...params} label="Seleccionar Sede" size="small" />}
                                />
                            )}
                        />
                        <DetailCard title="Información de la Sede" data={sedeSeleccionada ? {
                             Jefe: sedeSeleccionada.JEFE_DE_SEDE,
                             Dirección: sedeSeleccionada.DIRECCION_SEDE,
                             Teléfonos: sedeSeleccionada.TELEFONOS
                         } : null} />
                    </Grid>
                )}
                </Grid>
            </Paper>
            
            {mostrarFeedBack && (
              <FeedBackSection control={control} errors={errors} />
            )}
        </>
    );
};