// =================================================================================================
// ARCHIVO: src/components/form-sections/TrabajadorSection.tsx
// INSTRUCCIÓN: CÓDIGO COMPLETO PARA EL NUEVO ARCHIVO
// =================================================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import type { CaseFormValues } from '../../schemas/case.schema';
import { Paper, Stack, Typography, TextField, MenuItem, Grid, InputAdornment, IconButton, CircularProgress, Tooltip, Box } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';

// API y Constantes
import { findUsuarioByKey } from '../../services/mockUsuarioApi';
import { opcionesTipoDocumento, opcionesPaisCA, opcionesSexoUsuario, opcionesCaracteristica } from '../../constants/formOptions';
import { useDebounce } from '../../hooks/useDebounce';

export const TrabajadorSection = () => {
    // Obtenemos todos los métodos de react-hook-form del contexto del formulario padre
    const { control, watch, setValue, formState: { errors } } = useFormContext<CaseFormValues>();

    const [isSearching, setIsSearching] = useState(false);
    const [userFound, setUserFound] = useState(false); // true si el usuario existe en la BD
    
    // Observadores para la lógica
    const tipoDocumento = watch('trabajadorTipoDocumento');
    const numeroDocumento = watch('trabajadorNumeroDocumento');
    
    // Usamos debounce para no llamar a la API en cada tecla
    const debouncedNumeroDoc = useDebounce(numeroDocumento, 800);

    const resetTrabajadorFields = useCallback(() => {
        setValue('trabajadorNombres', '');
        setValue('trabajadorApellidos', '');
        setValue('trabajadorSexo', '');
        setValue('trabajadorCaracteristica', '');
        setValue('trabajadorPaisDocumento', '');
        setValue('trabajadorCargo', '');
        setValue('trabajadorTelefono', '');
        setValue('trabajadorEmail', '');
        setUserFound(false);
    }, [setValue]);

    useEffect(() => {
        // Limpiar campos si el tipo de documento cambia
        resetTrabajadorFields();
    }, [tipoDocumento, resetTrabajadorFields]);

    // Efecto para buscar al usuario cuando el número de documento (debounced) cambia
    useEffect(() => {
        if (!tipoDocumento || !debouncedNumeroDoc || numeroDocumento !== debouncedNumeroDoc) {
            return;
        }

        const searchUser = async () => {
            setIsSearching(true);
            setUserFound(false);
            const key = `${tipoDocumento}${debouncedNumeroDoc}`;
            const foundUser = await findUsuarioByKey(key);

            if (foundUser) {
                setValue('trabajadorNombres', foundUser.NOMBRE_USUARIO);
                setValue('trabajadorApellidos', foundUser.APELLIDO_USUARIO);
                setValue('trabajadorSexo', foundUser.SEXO_USUARIO);
                setValue('trabajadorCaracteristica', foundUser.CARACTERISTICA_USUARIO);
                setValue('trabajadorPaisDocumento', foundUser.PAIS_IDENTIFICACION);
                setValue('trabajadorCargo', foundUser.CARGO);
                setValue('trabajadorTelefono', foundUser.TEL_USUARIO);
                setValue('trabajadorEmail', foundUser.EMAIL_USUARIO || '');
                setUserFound(true);
            } else {
                // Si no se encuentra, nos aseguramos de que los campos estén vacíos para ingreso manual
                resetTrabajadorFields();
            }
            setIsSearching(false);
        };

        searchUser();
    }, [debouncedNumeroDoc, tipoDocumento, setValue, resetTrabajadorFields, numeroDocumento]);

    const showPaisCA = tipoDocumento === 'DCA-';
    const showPaisMundo = tipoDocumento === 'RES-' || tipoDocumento === 'PAS-';

    return (
        <Paper elevation={1} sx={{ p: 2, mt: 1, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Datos del Trabajador Denunciante</Typography>
            <Grid container spacing={2}>
                {/* Fila 1: Documento de Identidad */}
                <Grid item xs={12} md={4}>
                    <Controller name="trabajadorTipoDocumento" control={control} render={({ field }) => (
                        <TextField {...field} select fullWidth label="Tipo de Documento" size="small" required error={!!errors.trabajadorTipoDocumento} helperText={errors.trabajadorTipoDocumento?.message}>
                            {opcionesTipoDocumento.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                        </TextField>
                    )}/>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Controller name="trabajadorNumeroDocumento" control={control} render={({ field }) => (
                        <TextField
                            {...field}
                            fullWidth
                            label="# Documento Identidad"
                            size="small"
                            required
                            disabled={!tipoDocumento}
                            placeholder={tipoDocumento ? "Ingrese número para buscar..." : "Seleccione tipo primero"}
                            error={!!errors.trabajadorNumeroDocumento}
                            helperText={errors.trabajadorNumeroDocumento?.message}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">{tipoDocumento}</InputAdornment>,
                                endAdornment: isSearching && <CircularProgress size={20} />
                            }}
                        />
                    )}/>
                </Grid>
                <Grid item xs={12} md={4}>
                    {showPaisCA && (
                         <Controller name="trabajadorPaisDocumento" control={control} render={({ field }) => (
                            <TextField {...field} select fullWidth label="País (Doc. Centro Americano)" size="small" required disabled={userFound} error={!!errors.trabajadorPaisDocumento} helperText={errors.trabajadorPaisDocumento?.message}>
                                {opcionesPaisCA.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                            </TextField>
                        )}/>
                    )}
                    {showPaisMundo && (
                        <Controller name="trabajadorPaisDocumento" control={control} render={({ field }) => (
                            <TextField {...field} fullWidth label="País de Origen" size="small" required disabled={userFound} error={!!errors.trabajadorPaisDocumento} helperText={errors.trabajadorPaisDocumento?.message} sx={{'& .MuiInputBase-input': { textTransform: 'uppercase' }}} />
                        )}/>
                    )}
                </Grid>

                {/* Fila 2: Nombres y Apellidos */}
                <Grid item xs={12} md={6}>
                    <Controller name="trabajadorNombres" control={control} render={({ field }) => (
                        <TextField {...field} fullWidth label="Nombre(s)" size="small" required disabled={userFound} error={!!errors.trabajadorNombres} helperText={errors.trabajadorNombres?.message} sx={{'& .MuiInputBase-input': { textTransform: 'uppercase' }}} />
                    )}/>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Controller name="trabajadorApellidos" control={control} render={({ field }) => (
                        <TextField {...field} fullWidth label="Apellido(s)" size="small" required disabled={userFound} error={!!errors.trabajadorApellidos} helperText={errors.trabajadorApellidos?.message} sx={{'& .MuiInputBase-input': { textTransform: 'uppercase' }}} />
                    )}/>
                </Grid>

                {/* Fila 3: Sexo y Característica */}
                <Grid item xs={12} md={6}>
                    <Controller name="trabajadorSexo" control={control} render={({ field }) => (
                        <TextField {...field} select fullWidth label="Sexo" size="small" required disabled={userFound} error={!!errors.trabajadorSexo} helperText={errors.trabajadorSexo?.message}>
                           {opcionesSexoUsuario.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                        </TextField>
                    )}/>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Controller name="trabajadorCaracteristica" control={control} render={({ field }) => (
                        <TextField {...field} select fullWidth label="Característica" size="small" required disabled={userFound} error={!!errors.trabajadorCaracteristica} helperText={errors.trabajadorCaracteristica?.message}>
                           {opcionesCaracteristica.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                        </TextField>
                    )}/>
                </Grid>

                {/* Fila 4: Cargo, Teléfono y Email */}
                 <Grid item xs={6} md={4.5}>
                    <Controller name="trabajadorCargo" control={control} render={({ field }) => (
                        <TextField {...field} fullWidth label="Cargo que Desempeña" size="small" required disabled={userFound} error={!!errors.trabajadorCargo} helperText={errors.trabajadorCargo?.message} sx={{'& .MuiInputBase-input': { textTransform: 'uppercase' }}}/>
                    )}/>
                </Grid>
                 <Grid item xs={6} md={2.5}>
                    <Controller name="trabajadorTelefono" control={control} render={({ field }) => (
                        <TextField {...field} fullWidth label="Teléfono" size="small" required disabled={userFound} error={!!errors.trabajadorTelefono} helperText={errors.trabajadorTelefono?.message} />
                    )}/>
                </Grid>
                 <Grid item xs={6} md={5}>
                    <Controller name="trabajadorEmail" control={control} render={({ field }) => (
                        <TextField {...field} fullWidth label="Correo Electrónico" size="small" type="email" disabled={userFound} error={!!errors.trabajadorEmail} helperText={errors.trabajadorEmail?.message} />
                    )}/>
                </Grid>
            </Grid>
        </Paper>
    );
};