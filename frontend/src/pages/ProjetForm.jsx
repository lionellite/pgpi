import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
} from '@mui/material';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ProjetForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = id && id !== 'new';
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [partenaires, setPartenaires] = useState([]);
  
  const [formData, setFormData] = useState({
    titre: '',
    date_debut: '',
    date_fin: '',
    objectif_general: '',
    objectifs_specifiques: '',
    descriptions: '',
    duree: '',
    chef_projet_email: user?.email || '',
    institution_initiatrice_email: '',
    institutions_emails: [],
    etat: 'planifie',
  });

  useEffect(() => {
    fetchUsers();
    fetchInstitutions();
    fetchPartenaires();
    if (isEdit) {
      fetchProjet();
    }
  }, [id]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users', { params: { per_page: 1000 } });
      setUsers(response.data.data || response.data);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const response = await api.get('/institutions', { params: { per_page: 1000 } });
      setInstitutions(response.data.data || response.data);
    } catch (err) {
      console.error('Erreur chargement institutions:', err);
    }
  };

  const fetchPartenaires = async () => {
    try {
      const response = await api.get('/users', { params: { per_page: 1000, role: 'partenaire' } });
      setPartenaires(response.data.data || response.data);
    } catch (err) {
      console.error('Erreur chargement partenaires:', err);
    }
  };

  const fetchProjet = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`/projets/${id}`);
      const projet = response.data.data || response.data;
      
      setFormData({
        titre: projet.titre || '',
        date_debut: projet.date_debut ? projet.date_debut.split('T')[0] : '',
        date_fin: projet.date_fin ? projet.date_fin.split('T')[0] : '',
        objectif_general: projet.objectif_general || '',
        objectifs_specifiques: projet.objectifs_specifiques || '',
        descriptions: projet.descriptions || '',
        duree: projet.duree || '',
        chef_projet_email: projet.chef_projet?.email || user?.email || '',
        institution_initiatrice_email: projet.institution_initiatrice?.email || '',
        institutions_emails: projet.institutions?.map(i => i.email) || [],
        etat: projet.etat || 'planifie',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du projet');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = {
        ...formData,
        duree: formData.duree ? parseInt(formData.duree) : null,
      };

      if (isEdit) {
        await api.put(`/projets/${id}`, data);
      } else {
        await api.post('/projets', data);
      }

      navigate('/projets');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          'Erreur lors de la sauvegarde du projet';
      const errors = err.response?.data?.errors;
      
      if (errors) {
        const errorText = Object.values(errors).flat().join(', ');
        setError(errorText);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEdit ? 'Modifier le projet' : 'Nouveau projet'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre du projet"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date de début"
                name="date_debut"
                type="date"
                value={formData.date_debut}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date de fin"
                name="date_fin"
                type="date"
                value={formData.date_fin}
                onChange={handleChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={users}
                getOptionLabel={(option) => `${option.prenom} ${option.nom} (${option.email})`}
                value={users.find(u => u.email === formData.chef_projet_email) || null}
                onChange={(e, newValue) => {
                  setFormData({ ...formData, chef_projet_email: newValue?.email || '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chef de projet"
                    required
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">
                        {option.prenom} {option.nom}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {option.email} - {option.role}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={partenaires}
                getOptionLabel={(option) => `${option.prenom} ${option.nom} (${option.email})`}
                value={partenaires.find(p => p.email === formData.institution_initiatrice_email) || null}
                onChange={(e, newValue) => {
                  setFormData({ ...formData, institution_initiatrice_email: newValue?.email || '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Institution initiatrice (Partenaire)"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">
                        {option.prenom} {option.nom}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {option.email} - {option.departement || 'Partenaire'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                multiple
                options={institutions}
                getOptionLabel={(option) => `${option.nom} (${option.email})`}
                value={institutions.filter(i => formData.institutions_emails.includes(i.email))}
                onChange={(e, newValue) => {
                  setFormData({ ...formData, institutions_emails: newValue.map(i => i.email) });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Institutions liées"
                    placeholder="Sélectionner les institutions"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={`${option.nom} (${option.email})`}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Objectif général"
                name="objectif_general"
                value={formData.objectif_general}
                onChange={handleChange}
                required
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Objectifs spécifiques"
                name="objectifs_specifiques"
                value={formData.objectifs_specifiques}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="descriptions"
                value={formData.descriptions}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Durée (en jours)"
                name="duree"
                type="number"
                value={formData.duree}
                onChange={handleChange}
                inputProps={{ min: 1 }}
              />
            </Grid>

            {isEdit && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>État</InputLabel>
                  <Select
                    name="etat"
                    value={formData.etat}
                    onChange={handleChange}
                    label="État"
                  >
                    <MenuItem value="planifie">Planifié</MenuItem>
                    <MenuItem value="en_cours">En cours</MenuItem>
                    <MenuItem value="suspendu">Suspendu</MenuItem>
                    <MenuItem value="cloture">Clôturé</MenuItem>
                    <MenuItem value="archive">Archivé</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projets')}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Créer'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
