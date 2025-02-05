import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { 
  Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Grid, Card, CardContent, Typography,
  CardActions, Dialog, DialogContent, DialogTitle,
  IconButton, Chip, Box, Tabs, Tab
} from '@mui/material';
import { Edit, Delete, Email, Phone } from '@mui/icons-material';

function SponsorsManager() {
  const [sponsors, setSponsors] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState('local');
  const [currentSponsor, setCurrentSponsor] = useState({
    nombre: '',
    tipo: 'local',
    contacto: '',
    email: '',
    telefono: '',
    direccion: '',
    notas: '',
    estado: 'pendiente',
    presupuestoEstimado: '',
    fechaContacto: '',
    interesadoEn: [] // ['merchandising', 'bebidas', 'equipo', etc.]
  });

  const estadoOptions = [
    'pendiente',
    'contactado',
    'negociando',
    'aceptado',
    'rechazado'
  ];

  const interesOptions = [
    'merchandising',
    'bebidas',
    'equipo',
    'transporte',
    'alojamiento',
    'catering',
    'promoción'
  ];

  const loadSponsors = async () => {
    const sponsorsSnapshot = await getDocs(collection(db, 'patrocinadores'));
    const sponsorsList = sponsorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setSponsors(sponsorsList);
  };

  useEffect(() => {
    loadSponsors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentSponsor.id) {
        await updateDoc(doc(db, 'patrocinadores', currentSponsor.id), currentSponsor);
      } else {
        await addDoc(collection(db, 'patrocinadores'), currentSponsor);
      }
      loadSponsors();
      setOpenDialog(false);
      setCurrentSponsor({
        nombre: '',
        tipo: 'local',
        contacto: '',
        email: '',
        telefono: '',
        direccion: '',
        notas: '',
        estado: 'pendiente',
        presupuestoEstimado: '',
        fechaContacto: '',
        interesadoEn: []
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de querer eliminar este patrocinador?')) {
      await deleteDoc(doc(db, 'patrocinadores', id));
      loadSponsors();
    }
  };

  const getStatusColor = (estado) => {
    const colors = {
      pendiente: 'default',
      contactado: 'primary',
      negociando: 'warning',
      aceptado: 'success',
      rechazado: 'error'
    };
    return colors[estado] || 'default';
  };

  return (
    <div>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)}>
          <Tab label="Locales" value="local" />
          <Tab label="Nacionales" value="nacional" />
          <Tab label="Internacionales" value="internacional" />
        </Tabs>
      </Box>

      <Button 
        variant="contained" 
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 3 }}
      >
        Añadir Nuevo Patrocinador
      </Button>

      <Grid container spacing={2}>
        {sponsors
          .filter(sponsor => sponsor.tipo === selectedTab)
          .map((sponsor) => (
          <Grid item xs={12} md={6} lg={4} key={sponsor.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {sponsor.nombre}
                </Typography>
                <Chip 
                  label={sponsor.estado} 
                  color={getStatusColor(sponsor.estado)}
                  sx={{ mb: 1 }}
                />
                {sponsor.contacto && (
                  <Typography variant="body2" color="textSecondary">
                    <Person sx={{ fontSize: 'small', mr: 1 }} />
                    {sponsor.contacto}
                  </Typography>
                )}
                {sponsor.email && (
                  <Typography variant="body2" color="textSecondary">
                    <Email sx={{ fontSize: 'small', mr: 1 }} />
                    {sponsor.email}
                  </Typography>
                )}
                {sponsor.interesadoEn?.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    {sponsor.interesadoEn.map(interes => (
                      <Chip 
                        key={interes} 
                        label={interes} 
                        size="small" 
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <IconButton onClick={() => {
                  setCurrentSponsor(sponsor);
                  setOpenDialog(true);
                }}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(sponsor.id)}>
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {currentSponsor.id ? 'Editar Patrocinador' : 'Nuevo Patrocinador'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre de la marca"
                  value={currentSponsor.nombre}
                  onChange={(e) => setCurrentSponsor({...currentSponsor, nombre: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    value={currentSponsor.tipo}
                    onChange={(e) => setCurrentSponsor({...currentSponsor, tipo: e.target.value})}
                  >
                    <MenuItem value="local">Local</MenuItem>
                    <MenuItem value="nacional">Nacional</MenuItem>
                    <MenuItem value="internacional">Internacional</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Persona de contacto"
                  value={currentSponsor.contacto}
                  onChange={(e) => setCurrentSponsor({...currentSponsor, contacto: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={currentSponsor.email}
                  onChange={(e) => setCurrentSponsor({...currentSponsor, email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Notas"
                  value={currentSponsor.notas}
                  onChange={(e) => setCurrentSponsor({...currentSponsor, notas: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={currentSponsor.estado}
                    onChange={(e) => setCurrentSponsor({...currentSponsor, estado: e.target.value})}
                  >
                    {estadoOptions.map(estado => (
                      <MenuItem key={estado} value={estado}>
                        {estado.charAt(0).toUpperCase() + estado.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  {currentSponsor.id ? 'Actualizar' : 'Crear'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SponsorsManager; 