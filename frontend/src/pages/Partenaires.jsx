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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Partenaires() {
  const { user } = useAuth();
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPartenaire, setEditingPartenaire] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    email: '',
    telephone: '',
    adresse: '',
    description: '',
    point_contact: '',
    localisation: '',
  });

  useEffect(() => {
    fetchPartenaires();
  }, [search, pagination.current_page]);

  const fetchPartenaires = async () => {
    try {
      setLoading(true);
      const params = {
        ...(search ? { search } : {}),
        page: pagination.current_page,
        per_page: pagination.per_page,
      };
      const response = await api.get('/partenaires', { params });
      if (response.data.data) {
        setPartenaires(response.data.data);
        if (response.data.meta) {
          setPagination({
            current_page: response.data.meta.current_page,
            last_page: response.data.meta.last_page,
            per_page: response.data.meta.per_page,
            total: response.data.meta.total,
          });
        }
      } else if (Array.isArray(response.data)) {
        setPartenaires(response.data);
      } else {
        setPartenaires([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des partenaires');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (partenaire = null) => {
    if (partenaire) {
      setEditingPartenaire(partenaire);
      setFormData({
        nom: partenaire.nom || '',
        type: partenaire.type || '',
        email: partenaire.email || '',
        telephone: partenaire.telephone || '',
        adresse: partenaire.adresse || '',
        description: partenaire.description || '',
        point_contact: partenaire.point_contact || '',
        localisation: partenaire.localisation || '',
      });
    } else {
      setEditingPartenaire(null);
      setFormData({
        nom: '',
        type: '',
        email: '',
        telephone: '',
        adresse: '',
        description: '',
        point_contact: '',
        localisation: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPartenaire(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingPartenaire) {
        await api.post(`/partenaires/${editingPartenaire.id}?_method=PUT`, formData);
      } else {
        await api.post('/partenaires', formData);
      }
      handleCloseDialog();
      fetchPartenaires();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Erreur lors de la sauvegarde du partenaire';
      setError(message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      return;
    }
    try {
      await api.delete(`/partenaires/${id}`);
      fetchPartenaires();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du partenaire');
    }
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, current_page: value }));
  };

  if (!['admin', 'directeur'].includes(user?.role)) {
    return (
      <Alert severity="error">
        Accès refusé. Seuls les administrateurs et directeurs peuvent gérer les partenaires.
      </Alert>
    );
  }

  if (loading && partenaires.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestion des partenaires</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouveau partenaire
        </Button>
      </Box>

      <TextField
        fullWidth
        label="Rechercher par nom ou email"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

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
                <TableCell>Nom</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Téléphone</TableCell>
                <TableCell>Point de contact</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {partenaires.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Aucun partenaire trouvé
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                partenaires.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.nom}</TableCell>
                    <TableCell>{p.type || '-'}</TableCell>
                    <TableCell>{p.email || '-'}</TableCell>
                    <TableCell>{p.telephone || '-'}</TableCell>
                    <TableCell>{p.point_contact || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(p)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(p.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {pagination.last_page > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={pagination.last_page}
            page={pagination.current_page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingPartenaire ? 'Modifier le partenaire' : 'Nouveau partenaire'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
              />
              <TextField
                label="Téléphone"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                fullWidth
              />
              <TextField
                label="Adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
              <TextField
                label="Point de contact"
                value={formData.point_contact}
                onChange={(e) => setFormData({ ...formData, point_contact: e.target.value })}
                fullWidth
              />
              <TextField
                label="Localisation"
                value={formData.localisation}
                onChange={(e) => setFormData({ ...formData, localisation: e.target.value })}
                fullWidth
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained">
              {editingPartenaire ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

