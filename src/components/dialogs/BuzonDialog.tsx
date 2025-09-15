// =================================================================================================
// ARCHIVO: src/components/dialogs/BuzonDialog.tsx
// RESPONSABILIDAD: Contener el formulario para el Buzón de Quejas y Sugerencias.
// =================================================================================================

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Grid,
    FormControlLabel, Checkbox, MenuItem, Autocomplete, CircularProgress, Typography
} from '@mui/material';

// --- Importación de datos y tipos ---
import { getSedes, type ISede } from '../../services/mockSedes';
import { getCatalogoServicios, type ICatalogoServicio } from '../../services/mockCatalogo';
import { getDirecciones, type IDireccion } from '../../services/mockDirecciones';

// --- Constantes para opciones ---
const opcionesFuncionario = ['DIRECTOR', 'JEFE', 'SUPERVISOR', 'COORDINADOR', 'INSPECTOR', 'DELEGADO', 'GESTOR', 'COLABORADOR', 'SEGURIDAD'];

// 1. Esquema de validación específico para este diálogo
const buzonSchema = z.object({
    esAnonimo: z.boolean(),
    nombre: z.string().optional(),
    email: z.string().email('Debe ser un email válido.').optional().or(z.literal('')),
    // Nuevos campos
    sedeDenunciada: z.string().min(1, 'Debe seleccionar una sede.'),
    direccionesDenunciadas: z.array(z.string()).min(1, 'Debe seleccionar al menos una dirección.'),
    servicioInconveniente: z.string().min(1, 'Debe seleccionar un servicio.'),
    funcionarioDenunciado: z.array(z.string()).min(1, 'Debe seleccionar al menos un tipo de funcionario.'),
    nombreFuncionario: z.string().optional(),
    // Campos de comentario
    consultaUsuario: z.string().min(10, 'El comentario debe tener al menos 10 caracteres.'),
    respuestaAgente: z.string().optional(),
}).superRefine((data, ctx) => {
    if (!data.esAnonimo && !data.nombre) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El nombre es requerido si no es anónimo.',
            path: ['nombre'],
        });
    }
});

type BuzonFormValues = z.infer<typeof buzonSchema>;

interface BuzonDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: BuzonFormValues) => void;
}

export const BuzonDialog = ({ open, onClose, onSave }: BuzonDialogProps) => {
    // Estados para cargar datos de APIs
    const [sedes, setSedes] = useState<ISede[]>([]);
    const [catalogo, setCatalogo] = useState<ICatalogoServicio[]>([]);
    const [direcciones, setDirecciones] = useState<IDireccion[]>([]);
    const [loading, setLoading] = useState(true);

    // Configuración del formulario
    const methods = useForm<BuzonFormValues>({
        resolver: zodResolver(buzonSchema),
        defaultValues: {
            esAnonimo: false,
            nombre: '',
            email: '',
            sedeDenunciada: '',
            direccionesDenunciadas: [],
            servicioInconveniente: '',
            funcionarioDenunciado: [],
            nombreFuncionario: '',
            consultaUsuario: '',
            respuestaAgente: '',
        },
    });

    // Cargar datos al abrir el diálogo
    useEffect(() => {
        if (open) {
            setLoading(true);
            Promise.all([
                getSedes(),
                getCatalogoServicios(),
                getDirecciones()
            ]).then(([sedesData, catalogoData, direccionesData]) => {
                setSedes(sedesData);
                setCatalogo(catalogoData);
                setDirecciones(direccionesData);
            }).catch(error => {
                console.error("Error al cargar datos para el diálogo:", error);
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [open]);

    const { control, register, handleSubmit, formState: { errors }, watch } = methods;
    const esAnonimo = watch('esAnonimo');

    const onSubmit = (data: BuzonFormValues) => {
        onSave(data);
        methods.reset(); // Limpia el formulario después de guardar
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Buzón de Quejas y Sugerencias</DialogTitle>
                    <DialogContent>
                        {loading ? (
                            <Stack alignItems="center" justifyContent="center" sx={{ height: 200 }}>
                                <CircularProgress />
                                <Typography sx={{ mt: 2 }}>Cargando datos...</Typography>
                            </Stack>
                        ) : (
                            <Grid container spacing={2} sx={{ pt: 1 }}>
                                <Grid item xs={12}>
                                    <FormControlLabel control={<Checkbox {...register('esAnonimo')} />} label="Deseo que mi comentario sea anónimo" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Nombre (Opcional si es anónimo)" {...register('nombre')} disabled={esAnonimo} error={!!errors.nombre} helperText={errors.nombre?.message} size="small" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Email de Contacto (Opcional)" type="email" {...register('email')} disabled={esAnonimo} error={!!errors.email} helperText={errors.email?.message} size="small" />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Controller name="sedeDenunciada" control={control} render={({ field }) => (
                                        <TextField {...field} select fullWidth label="Sede Denunciada" required error={!!errors.sedeDenunciada} helperText={errors.sedeDenunciada?.message} size="small">
                                            {sedes.map(sede => <MenuItem key={sede.ID} value={sede.ID}>{sede.SEDE}</MenuItem>)}
                                        </TextField>
                                    )} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Controller name="servicioInconveniente" control={control} render={({ field }) => (
                                        <TextField {...field} select fullWidth label="Servicio con Inconveniente" required error={!!errors.servicioInconveniente} helperText={errors.servicioInconveniente?.message} size="small">
                                            {catalogo.map(item => <MenuItem key={item.ID_SERVICIO} value={item.ID_SERVICIO}>{item.NOMBRE_SERVICIO}</MenuItem>)}
                                        </TextField>
                                    )} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Controller name="direccionesDenunciadas" control={control} render={({ field }) => (
                                        <Autocomplete multiple options={direcciones} getOptionLabel={(option) => option.DIRECCION}
                                            onChange={(_, data) => field.onChange(data.map(d => d.ID_DIRECCION))}
                                            renderInput={(params) => <TextField {...params} label="Dirección(es) Denunciada(s)" required error={!!errors.direccionesDenunciadas} helperText={errors.direccionesDenunciadas?.message as string} />}
                                            size="small"
                                        />
                                    )} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Controller name="funcionarioDenunciado" control={control} render={({ field }) => (
                                        <Autocomplete multiple options={opcionesFuncionario}
                                            onChange={(_, data) => field.onChange(data)}
                                            renderInput={(params) => <TextField {...params} label="Cargo(s) Funcionario Denunciado" required error={!!errors.funcionarioDenunciado} helperText={errors.funcionarioDenunciado?.message as string} />}
                                            size="small"
                                        />
                                    )} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField fullWidth label="Nombre del Funcionario (Opcional)" {...register('nombreFuncionario')} error={!!errors.nombreFuncionario} helperText={errors.nombreFuncionario?.message} size="small" />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
                                        Detalle del Comentario / Queja / Sugerencia
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="Comentario del Usuario" multiline rows={4} fullWidth required {...register('consultaUsuario')} error={!!errors.consultaUsuario} helperText={errors.consultaUsuario?.message} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="Respuesta/Seguimiento del Agente (Opcional)" multiline rows={2} fullWidth {...register('respuestaAgente')} error={!!errors.respuestaAgente} helperText={errors.respuestaAgente?.message} />
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>Cancelar</Button>
                        <Button type="submit" variant="contained" disabled={loading}>Enviar Comentario</Button>
                    </DialogActions>
                </form>
            </FormProvider>
        </Dialog>
    );
};