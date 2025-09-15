// =================================================================================================
// ARCHIVO: src/components/form-sections/CentroRecreacionSection.tsx
// INSTRUCCIÓN: CÓDIGO COMPLETO PARA EL NUEVO ARCHIVO
// =================================================================================================
import React, { useState, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Paper, Stack, Typography, TextField, MenuItem, Autocomplete, Grid, CircularProgress, Card, CardContent, Box, Divider } from '@mui/material';

// Tipos y API
import type { CaseFormValues } from '../../schemas/case.schema';
import { getCentrosRecreacion, type ICentroRecreacion } from '../../services/mockCentrosRecreacion';
import { FeedBackSection } from './FeedBacks';

export const CentroRecreacionSection = () => {
    const { control, formState: { errors } } = useFormContext<CaseFormValues>();

    // Estados para datos de API y UI
    const [centros, setCentros] = useState<ICentroRecreacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [centroSeleccionado, setCentroSeleccionado] = useState<ICentroRecreacion | null>(null);

    // Cargar la lista de centros al montar el componente
    useEffect(() => {
        getCentrosRecreacion()
            .then(data => setCentros(data))
            .catch(error => console.error("Error al cargar centros de recreación:", error))
            .finally(() => setLoading(false));
    }, []);

    const renderDetail = (label: string, value: string) => (
        <Box sx={{ mb: 1.5 }}>
            <Typography variant="caption" color="text.secondary" component="div" sx={{ textTransform: 'uppercase' }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {value}
            </Typography>
        </Box>
    );
  const mostrarFeedBack = true;

    return (
        <Paper elevation={2} sx={{ p: 3, mt: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Información de Centros de Recreación</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Controller
                        name="centroRecreacionConsultado"
                        control={control}
                        render={({ field }) => (
                            <Autocomplete
                                options={centros}
                                loading={loading}
                                getOptionLabel={(option) => option.CENTRO_RECREACION}
                                onChange={(_, data) => {
                                    field.onChange(data ? data.ID_CENTRO : '');
                                    setCentroSeleccionado(data);
                                }}
                                isOptionEqualToValue={(option, value) => option.ID_CENTRO === value.ID_CENTRO}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label="Seleccione un Centro de Recreación" 
                                        size="small"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                    />
                                )}
                            />
                        )}
                    />
                </Grid>

                {centroSeleccionado && (
                    <Grid item xs={12}>
                        <Card variant="outlined" sx={{ mt: 2 }}>
                            <CardContent>
                                <Typography variant="h6" component="div" gutterBottom>
                                    {centroSeleccionado.CENTRO_RECREACION}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                {renderDetail("Ubicación", centroSeleccionado.UBICACION)}
                                {renderDetail("Instalaciones", centroSeleccionado.INSTALACIONES)}
                                {renderDetail("Información General", centroSeleccionado.INFORMACION)}
                                {renderDetail("Costos", centroSeleccionado.COSTOS)}
                                {renderDetail("Reservaciones", centroSeleccionado.RESERVACIONES)}
                                {renderDetail("Contacto para Visitas", centroSeleccionado.CONTACTO_VISITA)}
                                {centroSeleccionado.AVISO_IMPORTANTE && (
                                     <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'warning.light', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Aviso Importante</Typography>
                                        <Typography variant="body2">{centroSeleccionado.AVISO_IMPORTANTE}</Typography>
                                     </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
            {mostrarFeedBack && ( <FeedBackSection control={control} errors={errors} /> )}
        </Paper>
    );
};