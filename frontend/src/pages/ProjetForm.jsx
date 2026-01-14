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
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
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
    descriptions: '',
    chef_projet_email: user?.email || '',
    partenaires: [],
    personnel: [],
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
      const response = await api.get('/partenaires', { params: { per_page: 1000 } });
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
        chef_projet_email: projet.chef_projet?.email || user?.email || '',
        partenaires: projet.partenaires?.map(p => ({
          partenaire_id: p.id,
          role: p.pivot?.role || '',
        })) || [],
        personnel: projet.personnel?.map(p => ({
          user_id: p.id,
          role: p.pivot?.role || '',
          date_debut: p.pivot?.date_debut ? p.pivot.date_debut.split('T')[0] : '',
          date_fin: p.pivot?.date_fin ? p.pivot.date_fin.split('T')[0] : '',
        })) || [],
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

  const addPartenaire = () => {
    setFormData(prev => ({
      ...prev,
      partenaires: [...prev.partenaires, { partenaire_id: null, role: '' }],
    }));
  };

  const removePartenaire = (index) => {
    setFormData(prev => ({
      ...prev,
      partenaires: prev.partenaires.filter((_, i) => i !== index),
    }));
  };

  const updatePartenaire = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      partenaires: prev.partenaires.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const addPersonnel = () => {
    setFormData(prev => ({
      ...prev,
      personnel: [...prev.personnel, { user_id: null, role: '', date_debut: '', date_fin: '' }],
    }));
  };

  const removePersonnel = (index) => {
    setFormData(prev => ({
      ...prev,
      personnel: prev.personnel.filter((_, i) => i !== index),
    }));
  };

  const updatePersonnel = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      personnel: prev.personnel.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = {
        ...formData,
        partenaires: formData.partenaires.filter(p => p.partenaire_id),
        personnel: formData.personnel.filter(p => p.user_id),
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
                options={users.filter(u => ['admin', 'directeur', 'chef'].includes(u.role))}
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

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Partenaires positionnés</Typography>
                <Button startIcon={<AddIcon />} onClick={addPartenaire} size="small">
                  Ajouter
                </Button>
              </Box>
              {formData.partenaires.map((partenaire, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={partenaires}
                        getOptionLabel={(option) => `${option.nom} (${option.email || 'N/A'})`}
                        value={partenaires.find(p => p.id === partenaire.partenaire_id) || null}
                        onChange={(e, newValue) => {
                          updatePartenaire(index, 'partenaire_id', newValue?.id || null);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Partenaire" required />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <TextField
                        fullWidth
                        label="Rôle"
                        value={partenaire.role}
                        onChange={(e) => updatePartenaire(index, 'role', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <IconButton onClick={() => removePartenaire(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Personnel</Typography>
                <Button startIcon={<AddIcon />} onClick={addPersonnel} size="small">
                  Ajouter
                </Button>
              </Box>
              {formData.personnel.map((personne, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                      <Autocomplete
                        options={users}
                        getOptionLabel={(option) => `${option.prenom} ${option.nom} (${option.email})`}
                        value={users.find(u => u.id === personne.user_id) || null}
                        onChange={(e, newValue) => {
                          updatePersonnel(index, 'user_id', newValue?.id || null);
                        }}
                        renderInput={(params) => (
                          <TextField {...params} label="Utilisateur" required />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Rôle"
                        value={personne.role}
                        onChange={(e) => updatePersonnel(index, 'role', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Date début"
                        type="date"
                        value={personne.date_debut}
                        onChange={(e) => updatePersonnel(index, 'date_debut', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        label="Date fin"
                        type="date"
                        value={personne.date_fin}
                        onChange={(e) => updatePersonnel(index, 'date_fin', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      <IconButton onClick={() => removePersonnel(index)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              ))}
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
