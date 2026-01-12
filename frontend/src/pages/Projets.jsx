import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Projets() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchProjets();
  }, [search]);

  const fetchProjets = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const response = await api.get('/projets', { params });
      // Gérer la pagination Laravel
      if (response.data.data) {
        setProjets(response.data.data);
      } else if (Array.isArray(response.data)) {
        setProjets(response.data);
      } else {
        setProjets([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const getEtatColor = (etat) => {
    const colors = {
      planifie: 'default',
      en_cours: 'primary',
      suspendu: 'warning',
      cloture: 'success',
      archive: 'default',
    };
    return colors[etat] || 'default';
  };

  const canCreate = ['admin', 'directeur', 'chef_projet'].includes(user?.role);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projets</Typography>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/projets/new')}
          >
            Nouveau projet
          </Button>
        )}
      </Box>

      <TextField
        fullWidth
        label="Rechercher"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {projets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            Aucun projet trouvé
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {projets.map((projet) => (
            <Grid item xs={12} sm={6} md={4} key={projet.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, flex: 1 }}>
                      {projet.titre}
                    </Typography>
                    <Chip
                      label={projet.etat}
                      color={getEtatColor(projet.etat)}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Chef de projet:</strong> {projet.chef_projet?.prenom} {projet.chef_projet?.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Du</strong> {new Date(projet.date_debut).toLocaleDateString()} 
                    <strong> au</strong> {new Date(projet.date_fin).toLocaleDateString()}
                  </Typography>
                  {projet.avancement !== undefined && (
                    <Box mt={2}>
                      <Typography variant="caption" color="text.secondary">
                        Avancement: {projet.avancement}%
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          height: 8,
                          backgroundColor: 'grey.300',
                          borderRadius: 1,
                          mt: 0.5,
                        }}
                      >
                        <Box
                          sx={{
                            width: `${projet.avancement}%`,
                            height: '100%',
                            backgroundColor: projet.avancement >= 100 ? 'success.main' : projet.avancement >= 50 ? 'primary.main' : 'warning.main',
                            borderRadius: 1,
                            transition: 'width 0.3s',
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/projets/${projet.id}`)}
                    fullWidth
                  >
                    Voir les détails
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

