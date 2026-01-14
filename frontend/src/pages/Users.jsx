import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'personnel',
    departement: '',
    service_id: null,
  });
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const response = await api.get('/users', { params });
      setUsers(response.data.data || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        password: '',
        role: user.role,
        departement: user.departement || '',
        service_id: user.service_id || null,
      });
    } else {
      setEditingUser(null);
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        password: '',
        role: 'personnel',
        departement: '',
        service_id: null,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation simple côté client pour éviter les 422 basiques
    if (!editingUser && (!formData.password || formData.password.length < 8)) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    try {
      const data = { ...formData };
      if (!data.password && editingUser) {
        delete data.password;
      }

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, data);
      } else {
        await api.post('/users', data);
      }

      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const message = Object.values(errors).flat().join(', ');
        setError(message);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      }
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services', { params: { per_page: 200 } });
      setServices(response.data.data || response.data);
    } catch (err) {
      console.error('Erreur chargement services:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      directeur: 'warning',
      chef: 'primary',
      personnel: 'default',
      apprenant: 'success',
    };
    return colors[role] || 'default';
  };

  if (currentUser?.role !== 'admin') {
    return <Alert severity="error">Accès refusé. Seuls les administrateurs peuvent accéder à cette page.</Alert>;
  }

  if (loading && users.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestion des Utilisateurs</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouvel utilisateur
        </Button>
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Département</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Aucun utilisateur trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.nom}</TableCell>
                  <TableCell>{user.prenom}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.departement || '-'}</TableCell>
                  <TableCell>{user.service?.titre || user.service?.code || '-'}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    {user.id !== currentUser.id && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(user.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Prénom"
                name="prenom"
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label={editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                name="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  label="Rôle"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="directeur">Directeur</MenuItem>
                  <MenuItem value="chef">Chef</MenuItem>
                  <MenuItem value="personnel">Personnel</MenuItem>
                  <MenuItem value="apprenant">Apprenant</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Département"
                name="departement"
                value={formData.departement}
                onChange={(e) => setFormData({ ...formData, departement: e.target.value })}
                fullWidth
              />
              <Autocomplete
                options={services}
                getOptionLabel={(option) => option.titre || option.code || 'Service'}
                value={services.find((s) => s.id === formData.service_id) || null}
                onChange={(e, newValue) => setFormData({ ...formData, service_id: newValue?.id || null })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Service"
                    placeholder="Assigner un service"
                    fullWidth
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button type="submit" variant="contained">
              {editingUser ? 'Modifier' : 'Créer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
