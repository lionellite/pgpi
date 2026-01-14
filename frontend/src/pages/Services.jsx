import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Types alignés avec la contrainte de la table `services`
const TYPE_OPTIONS = [
  { value: 'service', label: 'Service' },
  { value: 'labo_pedagogique', label: 'Labo pédagogique' },
  { value: 'labo_recherche', label: 'Labo de recherche' },
  { value: 'atelier', label: 'Atelier' },
  { value: 'division', label: 'Division' },
];

export default function Services() {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'directeur';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ type: '', statut: '' });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    code: '',
    type: 'service',
    statut: 'actif',
    id_parent: null,
  });

  useEffect(() => {
    // Reset page when filters change
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  }, [search, filters.type, filters.statut]);

  useEffect(() => {
    fetchServices();
  }, [search, filters, pagination.current_page]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = {
        ...(search ? { search } : {}),
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.statut ? { statut: filters.statut } : {}),
        page: pagination.current_page,
        per_page: pagination.per_page,
      };
      const response = await api.get('/services', { params });
      if (response.data.data) {
        setServices(response.data.data);
        if (response.data.meta) {
          setPagination({
            current_page: response.data.meta.current_page,
            last_page: response.data.meta.last_page,
            per_page: response.data.meta.per_page,
            total: response.data.meta.total,
          });
        }
      } else if (Array.isArray(response.data)) {
        setServices(response.data);
      } else {
        setServices([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, current_page: value }));
  };

  const handleOpenDialog = (service = null) => {
    setError(null);
    if (service) {
      setEditingService(service);
      setFormData({
        titre: service.titre || '',
        code: service.code || '',
        type: service.type || 'service',
        statut: service.statut || 'actif',
        id_parent: service.id_parent || null,
      });
    } else {
      setEditingService(null);
      setFormData({
        titre: '',
        code: '',
        type: 'service',
        statut: 'actif',
        id_parent: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingService) {
        await api.put(`/services/${editingService.id}`, formData);
      } else {
        await api.post('/services', formData);
      }
      handleCloseDialog();
      fetchServices();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Erreur lors de la sauvegarde du service';
      setError(message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;
    setError(null);
    try {
      await api.delete(`/services/${id}`);
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du service');
    }
  };

  if (!canManage) {
    return <Alert severity="error">Accès refusé. Seuls les administrateurs et directeurs peuvent gérer les services.</Alert>;
  }

  if (loading && services.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestion des services</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Nouveau service
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Rechercher (titre/code)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 260, flex: 1 }}
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
              label="Type"
            >
              <MenuItem value="">Tous</MenuItem>
              {TYPE_OPTIONS.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filters.statut}
              onChange={(e) => setFilters((prev) => ({ ...prev, statut: e.target.value }))}
              label="Statut"
            >
              <MenuItem value="">Tous</MenuItem>
              <MenuItem value="actif">Actif</MenuItem>
              <MenuItem value="inactif">Inactif</MenuItem>
            </Select>
          </FormControl>
          <Box display="flex" alignItems="center" sx={{ ml: 'auto' }}>
            <Typography variant="body2" color="text.secondary">
              {pagination.total} service{pagination.total > 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Parent</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Aucun service trouvé
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.titre}</TableCell>
                    <TableCell>{s.code || '-'}</TableCell>
                    <TableCell>{TYPE_OPTIONS.find((t) => t.value === s.type)?.label || s.type}</TableCell>
                    <TableCell>{s.statut || '-'}</TableCell>
                    <TableCell>{s.parent?.titre || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(s)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(s.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {pagination.last_page > 1 && (
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2} flexWrap="wrap" gap={2}>
            <Typography variant="body2" color="text.secondary">
              Page {pagination.current_page} / {pagination.last_page}
            </Typography>
            <Pagination
              count={pagination.last_page}
              page={pagination.current_page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingService ? 'Modifier le service' : 'Nouveau service'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Titre"
                value={formData.titre}
                onChange={(e) => setFormData((prev) => ({ ...prev, titre: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Code"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  label="Type"
                  required
                >
                  {TYPE_OPTIONS.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Statut</InputLabel>
                <Select
                  value={formData.statut}
                  onChange={(e) => setFormData((prev) => ({ ...prev, statut: e.target.value }))}
                  label="Statut"
                >
                  <MenuItem value="actif">Actif</MenuItem>
                  <MenuItem value="inactif">Inactif</MenuItem>
                </Select>
              </FormControl>
              <Autocomplete
                options={services.filter((s) => !editingService || s.id !== editingService.id)}
                getOptionLabel={(option) => option.titre || option.code || `Service ${option.id}`}
                value={services.find((s) => s.id === formData.id_parent) || null}
                onChange={(e, newValue) => setFormData((prev) => ({ ...prev, id_parent: newValue?.id || null }))}
                renderInput={(params) => <TextField {...params} label="Service parent (optionnel)" />}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained">
              {editingService ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

