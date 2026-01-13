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
  const [partenaires, setPartenaires] = useState([]);
  
  const [formData, setFormData] = useState({
    titre: '',
    date_debut: '',
    date_fin: '',
    objectif_general: '',
    objectifs_specifiques: '',
    description: '',
    chef_projet_id: user?.id || '',
    partenaires: [], // { id: number, role: string }
    personnel: [], // { id: number, role: string }
    etat: 'planifie',
  });

  useEffect(() => {
    fetchUsers();
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

  const fetchPartenaires = async () => {
    try {
      const response = await api.get('/categories', { params: { type: 'partenaire' } });
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
        description: projet.description || '',
        chef_projet_id: projet.chef_projet?.id || user?.id || '',
        partenaires: projet.partenaires?.map(p => ({ id: p.id, role: p.pivot.role })) || [],
        personnel: projet.personnel?.map(p => ({ id: p.id, role: p.pivot.role })) || [],
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
      if (isEdit) {
        await api.put(`/projets/${id}`, formData);
      } else {
        await api.post('/projets', formData);
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
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={users.find(u => u.id === formData.chef_projet_id) || null}
                onChange={(e, newValue) => {
                  setFormData({ ...formData, chef_projet_id: newValue?.id || '' });
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
                        {option.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {option.email}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Partenaires</Typography>
              <Autocomplete
                multiple
                options={partenaires}
                getOptionLabel={(option) => option.name}
                value={partenaires.filter(p => formData.partenaires.some(fp => fp.id === p.id))}
                onChange={(e, newValue) => {
                  setFormData({ ...formData, partenaires: newValue.map(p => ({ id: p.id, role: '' })) });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Partenaires"
                    placeholder="Sélectionner les partenaires"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
              {formData.partenaires.map((partenaire, index) => (
                <TextField
                  key={partenaire.id}
                  label={`Rôle de ${partenaires.find(p => p.id === partenaire.id)?.name}`}
                  value={partenaire.role}
                  onChange={(e) => {
                    const newPartenaires = [...formData.partenaires];
                    newPartenaires[index].role = e.target.value;
                    setFormData({ ...formData, partenaires: newPartenaires });
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
              ))}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6">Personnel</Typography>
              <Autocomplete
                multiple
                options={users}
                getOptionLabel={(option) => `${option.name} (${option.email})`}
                value={users.filter(u => formData.personnel.some(fu => fu.id === u.id))}
                onChange={(e, newValue) => {
                  setFormData({ ...formData, personnel: newValue.map(u => ({ id: u.id, role: '' })) });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Personnel"
                    placeholder="Sélectionner le personnel"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
              />
              {formData.personnel.map((membre, index) => (
                <TextField
                  key={membre.id}
                  label={`Rôle de ${users.find(u => u.id === membre.id)?.name}`}
                  value={membre.role}
                  onChange={(e) => {
                    const newPersonnel = [...formData.personnel];
                    newPersonnel[index].role = e.target.value;
                    setFormData({ ...formData, personnel: newPersonnel });
                  }}
                  fullWidth
                  sx={{ mt: 1 }}
                />
              ))}
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
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
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
