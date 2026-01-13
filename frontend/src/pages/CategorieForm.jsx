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
} from '@mui/material';
import api from '../services/api';

export default function CategorieForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
  });

  useEffect(() => {
    if (isEdit) {
      fetchCategorie();
    }
  }, [id]);

  const fetchCategorie = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`/categories/${id}`);
      const categorie = response.data.data || response.data;
      setFormData(categorie);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement de la catégorie');
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
        await api.put(`/categories/${id}`, formData);
      } else {
        await api.post('/categories', formData);
      }

      navigate('/categories');
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                          'Erreur lors de la sauvegarde de la catégorie';
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
        {isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
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
                label="Nom"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
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
            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/categories')}
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
