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
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FilterListIcon from '@mui/icons-material/FilterList';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Projets() {
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    etat: '',
    date_debut: '',
    date_fin: '',
    service_id: null,
  });
  const [services, setServices] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Réinitialiser à la page 1 quand les filtres changent
    setPagination(prev => ({ ...prev, current_page: 1 }));
  }, [search, filters.etat, filters.date_debut, filters.date_fin, filters.service_id]);

  useEffect(() => {
    fetchProjets();
  }, [search, filters, pagination.current_page]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchProjets = async () => {
    try {
      setLoading(true);
      const params = {
        ...(search ? { search } : {}),
        ...(filters.etat ? { etat: filters.etat } : {}),
        ...(filters.date_debut ? { date_debut: filters.date_debut } : {}),
        ...(filters.date_fin ? { date_fin: filters.date_fin } : {}),
        ...(filters.service_id ? { service_id: filters.service_id } : {}),
        page: pagination.current_page,
        per_page: pagination.per_page,
      };
      const response = await api.get('/projets', { params });
      // Gérer la pagination Laravel
      if (response.data.data) {
        setProjets(response.data.data);
        if (response.data.meta) {
          setPagination({
            current_page: response.data.meta.current_page,
            last_page: response.data.meta.last_page,
            per_page: response.data.meta.per_page,
            total: response.data.meta.total,
          });
        }
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

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, current_page: value }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      etat: '',
      date_debut: '',
      date_fin: '',
      service_id: null,
    });
    setSearch('');
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services', { params: { per_page: 200 } });
      setServices(response.data.data || response.data);
    } catch (err) {
      console.error('Erreur chargement services:', err);
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

  const canCreate = ['admin', 'directeur', 'chef'].includes(user?.role);

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

      <Box sx={{ mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <TextField
            fullWidth
            label="Rechercher par titre"
            variant="outlined"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ minWidth: 120 }}
          >
            {showFilters ? 'Masquer' : 'Filtres'}
          </Button>
          {(filters.etat || filters.date_debut || filters.date_fin || filters.service_id) && (
            <Button
              variant="text"
              onClick={clearFilters}
              size="small"
            >
              Réinitialiser
            </Button>
          )}
        </Box>

        <Collapse in={showFilters}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth>
                  <InputLabel>État</InputLabel>
                  <Select
                    value={filters.etat}
                    onChange={(e) => handleFilterChange('etat', e.target.value)}
                    label="État"
                  >
                    <MenuItem value="">Tous</MenuItem>
                    <MenuItem value="planifie">Planifié</MenuItem>
                    <MenuItem value="en_cours">En cours</MenuItem>
                    <MenuItem value="suspendu">Suspendu</MenuItem>
                    <MenuItem value="cloture">Clôturé</MenuItem>
                    <MenuItem value="archive">Archivé</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
                  options={services}
                  getOptionLabel={(option) => option.titre || option.code || 'Service'}
                  value={services.find((s) => s.id === filters.service_id) || null}
                  onChange={(e, newValue) => handleFilterChange('service_id', newValue?.id || null)}
                  renderInput={(params) => (
                    <TextField {...params} label="Service" placeholder="Filtrer par service" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Date de début (à partir de)"
                  type="date"
                  value={filters.date_debut}
                  onChange={(e) => handleFilterChange('date_debut', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Date de fin (jusqu'à)"
                  type="date"
                  value={filters.date_fin}
                  onChange={(e) => handleFilterChange('date_fin', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box display="flex" alignItems="center" height="100%">
                  <Typography variant="body2" color="text.secondary">
                    {pagination.total} projet{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </Box>

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
                  {projet.services && projet.services.length > 0 && (
                    <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
                      {projet.services.slice(0, 3).map((service) => (
                        <Chip key={service.id} label={service.titre || service.code} size="small" variant="outlined" />
                      ))}
                      {projet.services.length > 3 && (
                        <Chip label={`+${projet.services.length - 3}`} size="small" />
                      )}
                    </Box>
                  )}
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

      {pagination.total > 0 && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} flexWrap="wrap" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Page {pagination.current_page} / {pagination.last_page} — {pagination.total} résultat{pagination.total > 1 ? 's' : ''}
          </Typography>
          <Pagination
            count={pagination.last_page || 1}
            page={pagination.current_page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
}

