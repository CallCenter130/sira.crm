// =================================================================================================
// ARCHIVO: src/components/form-sections/Feedback.tsx
// =================================================================================================

import React from 'react';

// Importaciones de react-hook-form
import type { Control, FieldErrors } from 'react-hook-form';

// Importaciones de Material-UI
import { 
    Paper, Stack, Typography, TextField, MenuItem, Autocomplete, Grid, 
    RadioGroup, FormControlLabel, Radio, Button, Box, CircularProgress, 
    Card, CardContent, CardActions 
} from '@mui/material';

// Importación del tipo del formulario
import type { CaseFormValues } from '../../schemas/case.schema';

// 1. Definimos las props que este componente necesita
interface FeedBackSectionProps {
  control: Control<CaseFormValues>;
  errors: FieldErrors<CaseFormValues>;
}

export const FeedBackSection = ({ control, errors }: FeedBackSectionProps) => {
  return (
    // 2. Usamos un React Fragment (<>) para agrupar los Grid items.
    //    Esto es importante porque el componente se usará dentro de un <Grid container>.
    <>
      <Paper elevation={1} sx={{ p: 4, mb: 3 , backgroundColor: '#ffffffff' }}>
          <Stack spacing={1}>
            <Grid>
              <Typography 
                variant="h5" 
                align="left" 
                sx={{ pt: 1, 
                  fontWeight: 'bold', 
                  textShadow: '-2px -2px 2px rgba(0,0,0,0.2), 1px 1px 1px rgba(255,255,255,0.8)' }}>
                  Comentarios:
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Consulta de Usuario"
                multiline
                rows={4}
                fullWidth
                required
                {...control.register('consultaUsuario')}
                error={!!errors.consultaUsuario}
                helperText={errors.consultaUsuario?.message}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Respuesta de Agente"
                multiline
                rows={4}
                fullWidth
                required
                {...control.register('respuestaAgente')}
                error={!!errors.respuestaAgente}
                helperText={errors.respuestaAgente?.message}
              />
            </Grid>
          </Stack>
      </Paper>
    </>
  );
};