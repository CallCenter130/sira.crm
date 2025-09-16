// =================================================================================================
// ARCHIVO: src/pages/NewCasePage.tsx (VERSIÓN FINAL INTEGRADA)
// RESPONSABILIDAD: Orquestar el estado del formulario y renderizar condicionalmente
//                  las secciones correspondientes al servicio seleccionado.
// =================================================================================================

import React, { useState, useEffect } from 'react';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// --- Importaciones de @mui/material ---
import { Box, Typography, Button, CircularProgress, Snackbar, Stack, Alert, TextField, MenuItem, Paper } from '@mui/material';
import type { AlertProps } from '@mui/material/Alert';

// --- Importaciones de @mui/x-date-pickers ---
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

// --- Importaciones de lógica y utilidades del proyecto ---
import { useDebounce } from '../hooks/useDebounce';
import { detectarTipoContacto } from '../utils/contactUtils';
import type { ContactoTipo } from '../utils/contactUtils';
import { caseSchema } from '../schemas/case.schema';
import type { CaseFormValues } from '../schemas/case.schema';
import { getCountryFromPhone } from '../services/api';
import { getUbicaciones } from '../services/mockUbicacionApi';
import type { IUbicacion } from '../services/mockUbicacionApi';

// --- Importaciones de TODAS las secciones del formulario ---
import { ContactoSection } from '../components/form-sections/ContactoSection';
import { GestionSection } from '../components/form-sections/GestionSection';
import { ConmutadorSection } from '../components/form-sections/ConmutadorSection';
import { CentroRecreacionSection } from '../components/form-sections/CentroRecreacionSection';
import { FeedBackSection } from '../components/form-sections/FeedBacks';
import { BuzonDialog } from '../components/dialogs/BuzonDialog'; // <<< 1. Importar el nuevo diálogo

// --- Importación de constantes centralizadas ---
import { opcionesCanalTelefono, opcionesTipoContacto, opcionesSexo, opcionesTipoServicio } from '../constants/formOptions';

// --- Componente Alert con forwardRef ---
const SnackbarAlert = React.forwardRef<HTMLDivElement, AlertProps>(
  function SnackbarAlert(props, ref) {
    return <Alert elevation={6} ref={ref} variant="filled" {...props} />;
  },
);

// --- Componente Principal de la Página ---
const NewCasePage = () => {
  // =================================================================
  // 1. ESTADOS DE LA UI (Carga, Notificaciones, Estados Temporales)
  // =================================================================
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'warning' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [isAnonimo, setIsAnonimo] = useState(false);
  const [tipoContactoDetectado, setTipoContactoDetectado] = useState<ContactoTipo>('otro');
  const [isFetchingCountry, setIsFetchingCountry] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<IUbicacion[]>([]);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(true);
  const [buzonDialogOpen, setBuzonDialogOpen] = useState(false); // <<< 2. Estado para controlar el diálogo

  // =================================================================
  // 2. INICIALIZACIÓN DE REACT-HOOK-FORM (Fuente única de verdad para los datos del formulario)
  // =================================================================
  const methods = useForm<CaseFormValues>({
    resolver: zodResolver(caseSchema),
    // El objeto defaultValues incluye TODOS los campos de TODAS las secciones posibles.
    defaultValues: {
      // Sección Contacto
      contacto: '',
      nombreCompleto: '',
      sexo: '',
      lugarContacto: '',
      tipoContacto: '',
      canalContacto: '',
      // Campo principal que controla el flujo
      tipoServicio: '', 
      // Sección Gestión (Asesoría y Denuncia)
      detalleServicio: [],
      empresaInvolucrada: '',
      lugarDesempenoLabores: 'CM',
      nombreComercial: '',
      direccionEmpresa: '',
      distritoEmpresa: '',
      telefonoEmpresa: '',
      emailEmpresa: '',
      direccionSucursal: '',
      distritoSucursal: '',
      telefonoSucursal: '',
      emailSucursal: '',
      tipoRazonSocial: '',
      tipoDenuncia: '',
      actividadEconomica: '',
      cantidadEmpleados: undefined,
      nombreAgresor: '',
      cargoAgresor: '',
      // Sección Trabajador (sub-sección de Denuncia)
      trabajadorTipoDocumento: '',
      trabajadorNumeroDocumento: '',
      trabajadorPaisDocumento: '',
      trabajadorNombres: '',
      trabajadorApellidos: '',
      trabajadorSexo: '',
      trabajadorCaracteristica: '',
      trabajadorCargo: '',
      trabajadorTelefono: '',
      trabajadorEmail: '',
      // Sección Conmutador
      conmutadorOpcion: '',
      conmutadorTransferenciaColaborador: '',
      conmutadorInfoTramite: '',
      conmutadorInfoSede: '',
      // Sección Centro de Recreación
      centroRecreacionConsultado: '',
      // Sección Feedback (Comentarios)
      consultaUsuario: '',
      respuestaAgente: '',
    },
    mode: 'onBlur',
  });

  // =================================================================
  // 3. OBSERVADORES DE CAMPOS (WATCH) para Lógica Reactiva
  // =================================================================
  const { watch, setValue, handleSubmit, control, formState: { errors }, reset } = methods;

  // Observador para la sección de Contacto
  const contactoValue = watch('contacto', '');
  const canalContactoValue = watch('canalContacto');
  const debouncedContactoValue = useDebounce(contactoValue, 500);

  // Observador principal para el renderizado condicional de secciones
  const tipoServicio = watch('tipoServicio');

  // =================================================================
  // 4. EFECTOS (USEEFFECT) para Lógica Asíncrona y Reacciones a Cambios
  // =================================================================
  useEffect(() => {
    // Carga inicial de datos que necesita el formulario (ej. lista de municipios)
    getUbicaciones()
      .then(data => setUbicaciones(data))
      .catch(error => {
        console.error("Error al cargar ubicaciones:", error);
        setSnackbar({ open: true, message: 'No se pudieron cargar las ubicaciones', severity: 'error' });
      })
      .finally(() => setLoadingUbicaciones(false));
  }, []); // El array vacío asegura que solo se ejecute una vez al montar el componente.

  useEffect(() => {
    // Lógica para detectar el tipo de contacto (local, internacional, etc.)
    const tipo = detectarTipoContacto(debouncedContactoValue);
    setTipoContactoDetectado(tipo);
    if (contactoValue !== debouncedContactoValue) return;

    if (tipo === 'digital') setValue('canalContacto', 'Medio Digital');
    else if (tipo === 'otro' && debouncedContactoValue) setValue('canalContacto', 'Otras Gestiones');
    else if (tipo === 'local' || tipo === 'internacional') setValue('canalContacto', '');
    
    // Lógica asíncrona para buscar el país si el número es internacional
    if (tipo === 'internacional') {
      setIsFetchingCountry(true);
      setValue('lugarContacto', 'Buscando país...');
      getCountryFromPhone(debouncedContactoValue)
        .then(response => {
          if (response.success && response.data) setValue('lugarContacto', response.data.country);
          else {
            setValue('lugarContacto', 'INTERNACIONAL (INVÁLIDO)');
            if (response.error) setSnackbar({ open: true, message: response.error, severity: 'warning' });
          }
        })
        .catch(() => {
          setValue('lugarContacto', 'Internacional (Error)');
          setSnackbar({ open: true, message: 'Error de red al validar el número.', severity: 'error' });
        })
        .finally(() => setIsFetchingCountry(false));
    }
  }, [debouncedContactoValue, setValue, contactoValue]);

  // Efecto para abrir el diálogo del buzón cuando se selecciona 'FEE'
  useEffect(() => {
    if (tipoServicio === 'FEE') {
      setBuzonDialogOpen(true);
      // Opcional: Reseteamos el valor para que el usuario pueda volver a seleccionarlo si cierra el modal
      setValue('tipoServicio', ''); 
    }
  }, [tipoServicio, setValue]);


  // =================================================================
  // 5. MANEJADORES DE EVENTOS
  // =================================================================
  const onSubmit: SubmitHandler<CaseFormValues> = async (data) => {
    setIsSubmitting(true);
    console.log('Datos del formulario validados y listos para enviar a GAS:', data);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulación de llamada a la API de GAS
      setSnackbar({ open: true, message: 'Caso guardado con éxito', severity: 'success' });
      reset();
      setIsAnonimo(false);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al guardar el caso', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // <<< 3. Manejador para guardar los datos del buzón
  const handleBuzonSave = async (data: any) => {
    console.log('Datos del Buzón de Quejas para enviar a GAS:', data);
    // Aquí iría la lógica para enviar los datos a Google Apps Script
    setSnackbar({ open: true, message: 'Comentario enviado con éxito.', severity: 'success' });
    setBuzonDialogOpen(false);
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // =================================================================
  // 6. LÓGICA DE VISIBILIDAD DE COMPONENTES (Declarativa y Fácil de Leer)
  // =================================================================
  const mostrarGestionSection = tipoServicio === 'ASE' || tipoServicio === 'DEN';
  const mostrarConmutadorSection = tipoServicio === 'CON';
  const mostrarCentroRecreacionSection = tipoServicio === 'CR';
  // La sección de Feedback (comentarios) se muestra condicionalmente.
  // Por requerimiento, ahora solo se mostrará cuando el tipo de servicio sea 'AM' (Alcaldía Municipal).
  const mostrarFeedBack = tipoServicio === 'AM';

  // =================================================================
  // 7. RENDERIZADO DEL COMPONENTE (JSX)
  // =================================================================
  return (
    <FormProvider {...methods}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h4" align="center" sx={{ fontWeight: 'bold' }}>
              Formulario de Captura
            </Typography>
            
            {/* --- SECCIÓN 1: DATOS DE CONTACTO (Siempre visible) --- */}
            <ContactoSection
              control={control}
              register={methods.register}
              errors={errors}
              watch={watch}
              setValue={setValue}
              isAnonimo={isAnonimo}
              setIsAnonimo={setIsAnonimo}
              tipoContactoDetectado={tipoContactoDetectado}
              isFetchingCountry={isFetchingCountry}
              canalContactoValue={canalContactoValue}
              mockUbicaciones={ubicaciones}
              opcionesSexo={opcionesSexo}
              opcionesTipoContacto={opcionesTipoContacto}
              opcionesCanalTelefono={opcionesCanalTelefono}
            />

            {/* --- SECCIÓN 2: SELECTOR PRINCIPAL DE SERVICIO --- */}
            <Paper elevation={1} sx={{ p: 3 }}>
                <Controller
                    name="tipoServicio"
                    control={control}
                    render={({ field }) => (
                        <TextField 
                            {...field} 
                            select 
                            required 
                            label="Tipo de Servicio" 
                            fullWidth 
                            size="small" 
                            error={!!errors.tipoServicio} 
                            helperText={errors.tipoServicio?.message}
                        >
                            {opcionesTipoServicio.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
                        </TextField>
                    )}
                />
            </Paper>

            {/* --- SECCIÓN 3: CONTENIDO DINÁMICO basado en la selección anterior --- */}
            {mostrarGestionSection && (
              <GestionSection
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                mockUbicaciones={ubicaciones}
              />
            )}
            
            {mostrarConmutadorSection && <ConmutadorSection />}
            
            {mostrarCentroRecreacionSection && <CentroRecreacionSection />}
            
            {/* --- SECCIÓN 4: FEEDBACK (si aplica) --- */}
            {mostrarFeedBack && ( <FeedBackSection control={control} errors={errors} /> )}

            {/* --- SECCIÓN 5: BOTÓN DE GUARDAR --- */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Button type="submit" variant="contained" disabled={isSubmitting || loadingUbicaciones} size="large">
                  {isSubmitting ? 'Guardando...' : 'Guardar Caso'}
                </Button>
                {isSubmitting && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* --- DIÁLOGO MODAL PARA EL BUZÓN DE QUEJAS --- */}
        <BuzonDialog
          open={buzonDialogOpen}
          onClose={() => setBuzonDialogOpen(false)}
          onSave={handleBuzonSave}
        />
        
        {/* Componente para notificaciones globales */}
        <Snackbar open={snackbar.open} autoHideDuration={15000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <SnackbarAlert onClose={handleSnackbarClose} severity={snackbar.severity}>
            {snackbar.message}
          </SnackbarAlert>
        </Snackbar>
      </LocalizationProvider>
    </FormProvider>
  );
};

export default NewCasePage;