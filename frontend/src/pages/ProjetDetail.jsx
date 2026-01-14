import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  MenuItem,
  Input,
  Divider,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import MediaCard from '../components/MediaCard';
import DocumentCard from '../components/DocumentCard';

export default function ProjetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projet, setProjet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(0);
  const [actionMessage, setActionMessage] = useState(null);
  
  // Filtres et tri pour médias et documents
  const [mediaFilters, setMediaFilters] = useState({ type: '', search: '', sort_by: 'created_at', sort_order: 'desc' });
  const [documentFilters, setDocumentFilters] = useState({ type: '', etat: '', search: '', sort_by: 'created_at', sort_order: 'desc' });
  
  // Filtres et tri pour médias et documents
  //const [mediaFilters, setMediaFilters] = useState({ type: '', search: '', sort_by: 'created_at', sort_order: 'desc' });
  //const [documentFilters, setDocumentFilters] = useState({ type: '', etat: '', search: '', sort_by: 'created_at', sort_order: 'desc' });

  // Forms state
  const [activiteForm, setActiviteForm] = useState({
    titre: '',
    date_debut: '',
    date_fin: '',
    type: 'autre',
    avancement: 0,
    description: '',
    etat: 'planifie',
  });
  const [mediaForm, setMediaForm] = useState({
    titre: '',
    description: '',
    type: 'image',
    fichier: null,
  });
  const [documentForm, setDocumentForm] = useState({
    titre: '',
    description: '',
    type: 'rapport',
    fichier: null,
  });
  const [users, setUsers] = useState([]);
  const [personnelForm, setPersonnelForm] = useState({
    user_id: '',
    role: '',
  });
  const [partenaires, setPartenaires] = useState([]);
  const [partenaireForm, setPartenaireForm] = useState({
    categorie_id: '',
    role: '',
  });

  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (id && id !== 'new' && id !== 'edit') {
      fetchProjet();
      fetchUsers();
      fetchPartenaires();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchPartenaires = async () => {
    try {
      const response = await api.get('/categories', { params: { type: 'partenaire' } });
      setPartenaires(response.data.data || response.data);
    } catch (err) {
      console.error('Erreur chargement partenaires:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users', { params: { per_page: 1000 } });
      setUsers(response.data.data || response.data);
    } catch (err) {
      console.error('Erreur chargement utilisateurs:', err);
    }
  };


  const fetchProjet = async () => {
    try {
      const response = await api.get(`/projets/${id}`);
      setProjet(response.data.data || response.data);
      setActionMessage(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du projet');
    } finally {
      setLoading(false);
    }
  };

  const fetchMedias = async () => {
    try {
      const params = {};
      if (mediaFilters.type) params.type = mediaFilters.type;
      if (mediaFilters.search) params.search = mediaFilters.search;
      params.sort_by = mediaFilters.sort_by;
      params.sort_order = mediaFilters.sort_order;
      
      const response = await api.get(`/projets/${id}/medias`, { params });
      const medias = response.data.data || response.data;
      setProjet(prev => ({ ...prev, medias }));
    } catch (err) {
      console.error('Erreur chargement médias:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const params = {};
      if (documentFilters.type) params.type = documentFilters.type;
      if (documentFilters.etat) params.etat = documentFilters.etat;
      if (documentFilters.search) params.search = documentFilters.search;
      params.sort_by = documentFilters.sort_by;
      params.sort_order = documentFilters.sort_order;
      
      const response = await api.get(`/projets/${id}/documents`, { params });
      const documents = response.data.data || response.data;
      setProjet(prev => ({ ...prev, documents }));
    } catch (err) {
      console.error('Erreur chargement documents:', err);
    }
  };

  useEffect(() => {
    if (tab === 3 && projet) {
      fetchMedias();
    }
  }, [tab, mediaFilters]);

  useEffect(() => {
    if (tab === 2 && projet) {
      fetchDocuments();
    }
  }, [tab, documentFilters]);

  const handleFormError = (err, fallback) => {
    const errors = err.response?.data?.errors;
    if (errors) {
      return Object.values(errors).flat().join(', ');
    }
    return err.response?.data?.message || fallback;
  };

  const handleActiviteSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setActionMessage(null);
    try {
      const payload = {
        ...activiteForm,
        avancement: Number(activiteForm.avancement) || 0,
      };
      await api.post(`/projets/${id}/activites`, payload);
      await fetchProjet();
      setActiviteForm({
        titre: '',
        date_debut: '',
        date_fin: '',
        type: 'autre',
        avancement: 0,
        description: '',
        etat: 'planifie',
      });
      setActionMessage('Activité ajoutée avec succès');
    } catch (err) {
      setError(handleFormError(err, 'Erreur lors de la création de l’activité'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleMediaSubmit = async (e) => {
    e.preventDefault();
    if (!mediaForm.fichier) {
      setError('Veuillez sélectionner un fichier média.');
      return;
    }
    setFormLoading(true);
    setActionMessage(null);
    try {
      const form = new FormData();
      form.append('fichier', mediaForm.fichier);
      form.append('type', mediaForm.type);
      if (mediaForm.titre) form.append('titre', mediaForm.titre);
      if (mediaForm.description) form.append('description', mediaForm.description);

      await api.post(`/projets/${id}/medias`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchProjet();
      await fetchMedias();
      setMediaForm({
        titre: '',
        description: '',
        type: 'image',
        fichier: null,
      });
      setActionMessage('Média ajouté avec succès');
    } catch (err) {
      setError(handleFormError(err, 'Erreur lors de l’upload du média'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDocumentSubmit = async (e) => {
    e.preventDefault();
    if (!documentForm.fichier) {
      setError('Veuillez sélectionner un fichier document.');
      return;
    }
    setFormLoading(true);
    setActionMessage(null);
    try {
      const form = new FormData();
      form.append('fichier', documentForm.fichier);
      form.append('type', documentForm.type);
      form.append('titre', documentForm.titre);
      if (documentForm.description) form.append('description', documentForm.description);

      await api.post(`/projets/${id}/documents`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchProjet();
      await fetchDocuments();
      setDocumentForm({
        titre: '',
        description: '',
        type: 'rapport',
        fichier: null,
      });
      setActionMessage('Document ajouté avec succès');
    } catch (err) {
      setError(handleFormError(err, 'Erreur lors de l’upload du document'));
    } finally {
      setFormLoading(false);
    }
  };

  const handlePersonnelSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setActionMessage(null);
    try {
      await api.post(`/projets/${id}/personnel`, {
        ...personnelForm,
      });
      await fetchProjet();
      setPersonnelForm({
        user_id: '',
        role: '',
      });
      setActionMessage('Personnel ajouté avec succès');
    } catch (err) {
      setError(handleFormError(err, "Erreur lors de l'ajout du personnel"));
    } finally {
      setFormLoading(false);
    }
  };

  const handlePartenaireSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setActionMessage(null);
    try {
      await api.post(`/projets/${id}/partenaires`, {
        ...partenaireForm,
      });
      await fetchProjet();
      setPartenaireForm({
        categorie_id: '',
        role: '',
      });
      setActionMessage('Partenaire ajouté avec succès');
    } catch (err) {
      setError(handleFormError(err, "Erreur lors de l'ajout du partenaire"));
    } finally {
      setFormLoading(false);
    }
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!projet) {
    return <Alert severity="info">Projet non trouvé</Alert>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">
          {projet.titre}
        </Typography>
        {(user?.role?.nom === 'admin' || user?.role?.nom === 'directeur' || projet?.chef_projet_id === user?.id) && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/projets/${id}/edit`)}
          >
            Modifier
          </Button>
        )}
      </Box>

      <Chip
        label={projet.etat}
        color="primary"
        sx={{ mb: 2 }}
      />

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Informations" />
        <Tab label="Activités" />
        <Tab label="Documents" />
        <Tab label="Médias" />
        <Tab label="Personnel" />
        <Tab label="Partenaires" />
      </Tabs>

      {actionMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionMessage(null)}>
          {actionMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informations générales
              </Typography>
              <Typography><strong>Date début:</strong> {new Date(projet.date_debut).toLocaleDateString()}</Typography>
              <Typography><strong>Date fin:</strong> {new Date(projet.date_fin).toLocaleDateString()}</Typography>
              <Typography><strong>Durée:</strong> {projet.duree}</Typography>
              <Typography><strong>Chef de projet:</strong> {projet.chef_projet?.name} ({projet.chef_projet?.email})</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Objectif Général
              </Typography>
              <Typography>{projet.objectif_general}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Objectifs Spécifiques
              </Typography>
              <Typography>{projet.objectifs_specifiques}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Description
              </Typography>
              <Typography>{projet.description}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Activités
          </Typography>
          {(user?.role?.nom === 'admin' || user?.role?.nom === 'directeur' || projet?.chef_projet_id === user?.id) && (
            <Box component="form" onSubmit={handleActiviteSubmit} sx={{ mb: 2, display: 'grid', gap: 2 }}>
              <TextField
                label="Titre"
                name="titre"
                value={activiteForm.titre}
                onChange={(e) => setActiviteForm({ ...activiteForm, titre: e.target.value })}
                required
              />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Date début"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={activiteForm.date_debut}
                    onChange={(e) => setActiviteForm({ ...activiteForm, date_debut: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Date fin"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={activiteForm.date_fin}
                    onChange={(e) => setActiviteForm({ ...activiteForm, date_fin: e.target.value })}
                    required
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    label="Type"
                    fullWidth
                    value={activiteForm.type}
                    onChange={(e) => setActiviteForm({ ...activiteForm, type: e.target.value })}
                  >
                    <MenuItem value="atelier">Atelier</MenuItem>
                    <MenuItem value="construction">Construction</MenuItem>
                    <MenuItem value="acquisition">Acquisition</MenuItem>
                    <MenuItem value="formation">Formation</MenuItem>
                    <MenuItem value="recherche">Recherche</MenuItem>
                    <MenuItem value="autre">Autre</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Avancement (%)"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0, max: 100 }}
                    value={activiteForm.avancement}
                    onChange={(e) => setActiviteForm({ ...activiteForm, avancement: e.target.value })}
                  />
                </Grid>
              </Grid>
              <TextField
                label="Description"
                multiline
                rows={3}
                value={activiteForm.description}
                onChange={(e) => setActiviteForm({ ...activiteForm, description: e.target.value })}
              />
              <Box display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={formLoading}>
                  {formLoading ? 'Enregistrement...' : 'Ajouter une activité'}
                </Button>
              </Box>
              <Divider />
            </Box>
          )}
          {projet.activites && projet.activites.length > 0 ? (
            <Grid container spacing={2}>
              {projet.activites.map((activite) => (
                <Grid item xs={12} md={6} key={activite.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start">
                        <Box flex={1}>
                          <Typography variant="h6" gutterBottom>
                            {activite.titre}
                          </Typography>
                          <Box display="flex" gap={1} mb={1} flexWrap="wrap">
                            <Chip label={activite.type} size="small" />
                            <Chip 
                              label={`${activite.avancement}%`} 
                              size="small" 
                              color={activite.avancement >= 100 ? 'success' : activite.avancement >= 50 ? 'primary' : 'default'}
                            />
                            <Chip label={activite.etat} size="small" variant="outlined" />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Du {new Date(activite.date_debut).toLocaleDateString()} au {new Date(activite.date_fin).toLocaleDateString()}
                          </Typography>
                          {activite.description && (
                            <Typography variant="body2">
                              {activite.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucune activité disponible
            </Typography>
          )}
        </Paper>
      )}

      {tab === 2 && (
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Documents
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                label="Rechercher"
                value={documentFilters.search}
                onChange={(e) => setDocumentFilters({ ...documentFilters, search: e.target.value })}
                sx={{ width: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={documentFilters.type}
                  onChange={(e) => setDocumentFilters({ ...documentFilters, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="rapport">Rapport</MenuItem>
                  <MenuItem value="budget">Budget</MenuItem>
                  <MenuItem value="technique">Technique</MenuItem>
                  <MenuItem value="administratif">Administratif</MenuItem>
                  <MenuItem value="autre">Autre</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>État</InputLabel>
                <Select
                  value={documentFilters.etat}
                  onChange={(e) => setDocumentFilters({ ...documentFilters, etat: e.target.value })}
                  label="État"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="brouillon">Brouillon</MenuItem>
                  <MenuItem value="en_attente">En attente</MenuItem>
                  <MenuItem value="valide">Validé</MenuItem>
                  <MenuItem value="rejete">Rejeté</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Trier par</InputLabel>
                <Select
                  value={documentFilters.sort_by}
                  onChange={(e) => setDocumentFilters({ ...documentFilters, sort_by: e.target.value })}
                  label="Trier par"
                >
                  <MenuItem value="created_at">Date création</MenuItem>
                  <MenuItem value="titre">Titre</MenuItem>
                  <MenuItem value="type">Type</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Ordre</InputLabel>
                <Select
                  value={documentFilters.sort_order}
                  onChange={(e) => setDocumentFilters({ ...documentFilters, sort_order: e.target.value })}
                  label="Ordre"
                >
                  <MenuItem value="desc">Décroissant</MenuItem>
                  <MenuItem value="asc">Croissant</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          {(user?.role?.nom === 'admin' || user?.role?.nom === 'directeur' || projet?.chef_projet_id === user?.id || user?.role?.nom === 'partenaire') && (
            <Box component="form" onSubmit={handleDocumentSubmit} sx={{ mb: 2, display: 'grid', gap: 2 }}>
              <TextField
                label="Titre"
                value={documentForm.titre}
                onChange={(e) => setDocumentForm({ ...documentForm, titre: e.target.value })}
                required
              />
              <TextField
                select
                label="Type"
                value={documentForm.type}
                onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value })}
              >
                <MenuItem value="rapport">Rapport</MenuItem>
                <MenuItem value="budget">Budget</MenuItem>
                <MenuItem value="technique">Technique</MenuItem>
                <MenuItem value="administratif">Administratif</MenuItem>
                <MenuItem value="autre">Autre</MenuItem>
              </TextField>
              <TextField
                label="Description"
                multiline
                rows={3}
                value={documentForm.description}
                onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
              />
              <Input
                type="file"
                onChange={(e) => setDocumentForm({ ...documentForm, fichier: e.target.files?.[0] || null })}
                required
              />
              <Box display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={formLoading}>
                  {formLoading ? 'Enregistrement...' : 'Ajouter un document'}
                </Button>
              </Box>
              <Divider />
            </Box>
          )}
          {projet.documents && projet.documents.length > 0 ? (
            <Box>
              {projet.documents.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDownload={async (doc) => {
                    try {
                      const response = await api.get(`/documents/${doc.id}/download`, {
                        responseType: 'blob',
                      });
                      const url = window.URL.createObjectURL(new Blob([response.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', doc.nom_fichier || doc.titre);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      setError('Erreur lors du téléchargement du document');
                    }
                  }}
                  onValidate={async (doc) => {
                    try {
                      await api.post(`/documents/${doc.id}/valider`);
                      await fetchProjet();
                      setActionMessage('Document validé avec succès');
                    } catch (err) {
                      setError(err.response?.data?.message || 'Erreur lors de la validation');
                    }
                  }}
                  onReject={async (doc) => {
                    try {
                      await api.post(`/documents/${doc.id}/rejeter`);
                      await fetchProjet();
                      setActionMessage('Document rejeté');
                    } catch (err) {
                      setError(err.response?.data?.message || 'Erreur lors du rejet');
                    }
                  }}
                  canValidate={user && (user?.role?.nom === 'admin' || user?.role?.nom === 'directeur')}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucun document disponible
            </Typography>
          )}
        </Paper>
      )}

      {tab === 3 && (
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Médias
            </Typography>
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                label="Rechercher"
                value={mediaFilters.search}
                onChange={(e) => setMediaFilters({ ...mediaFilters, search: e.target.value })}
                sx={{ width: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={mediaFilters.type}
                  onChange={(e) => setMediaFilters({ ...mediaFilters, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="">Tous</MenuItem>
                  <MenuItem value="image">Image</MenuItem>
                  <MenuItem value="video">Vidéo</MenuItem>
                  <MenuItem value="audio">Audio</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Trier par</InputLabel>
                <Select
                  value={mediaFilters.sort_by}
                  onChange={(e) => setMediaFilters({ ...mediaFilters, sort_by: e.target.value })}
                  label="Trier par"
                >
                  <MenuItem value="created_at">Date création</MenuItem>
                  <MenuItem value="titre">Titre</MenuItem>
                  <MenuItem value="type">Type</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Ordre</InputLabel>
                <Select
                  value={mediaFilters.sort_order}
                  onChange={(e) => setMediaFilters({ ...mediaFilters, sort_order: e.target.value })}
                  label="Ordre"
                >
                  <MenuItem value="desc">Décroissant</MenuItem>
                  <MenuItem value="asc">Croissant</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          {(user?.role?.nom === 'admin' || user?.role?.nom === 'directeur' || projet?.chef_projet_id === user?.id || user?.role?.nom === 'partenaire') && (
            <Box component="form" onSubmit={handleMediaSubmit} sx={{ mb: 2, display: 'grid', gap: 2 }}>
              <TextField
                label="Titre"
                value={mediaForm.titre}
                onChange={(e) => setMediaForm({ ...mediaForm, titre: e.target.value })}
              />
              <TextField
                select
                label="Type"
                value={mediaForm.type}
                onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value })}
              >
                <MenuItem value="image">Image</MenuItem>
                <MenuItem value="video">Vidéo</MenuItem>
                <MenuItem value="audio">Audio</MenuItem>
              </TextField>
              <TextField
                label="Description"
                multiline
                rows={2}
                value={mediaForm.description}
                onChange={(e) => setMediaForm({ ...mediaForm, description: e.target.value })}
              />
              <Input
                type="file"
                onChange={(e) => setMediaForm({ ...mediaForm, fichier: e.target.files?.[0] || null })}
                required
              />
              <Box display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={formLoading}>
                  {formLoading ? 'Enregistrement...' : 'Ajouter un média'}
                </Button>
              </Box>
              <Divider />
            </Box>
          )}
          {projet.medias && projet.medias.length > 0 ? (
            <Grid container spacing={2}>
              {projet.medias.map((media) => (
                <Grid item xs={12} sm={6} md={4} key={media.id}>
                  <MediaCard
                    media={media}
                    onDownload={async (media) => {
                      try {
                        const response = await api.get(`/medias/${media.id}/download`, {
                          responseType: 'blob',
                        });
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', media.nom_fichier || media.titre);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        setError('Erreur lors du téléchargement du média');
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucun média disponible
            </Typography>
          )}
        </Paper>
      )}

      {tab === 4 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Personnel
          </Typography>
          {canEdit && (
            <Box component="form" onSubmit={handlePersonnelSubmit} sx={{ mb: 2, display: 'grid', gap: 2 }}>
              <Autocomplete
                options={users}
                getOptionLabel={(option) => option.name}
                value={users.find(u => u.id === personnelForm.user_id) || null}
                onChange={(e, newValue) => {
                  setPersonnelForm({ ...personnelForm, user_id: newValue?.id || '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Utilisateur"
                    required
                  />
                )}
              />
              <TextField
                label="Rôle sur le projet"
                value={personnelForm.role}
                onChange={(e) => setPersonnelForm({ ...personnelForm, role: e.target.value })}
                required
              />
              <Box display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={formLoading}>
                  {formLoading ? 'Enregistrement...' : 'Ajouter au projet'}
                </Button>
              </Box>
              <Divider />
            </Box>
          )}
          {projet.personnel && projet.personnel.length > 0 ? (
            <Grid container spacing={2}>
              {projet.personnel.map((personne) => (
                <Grid item xs={12} sm={6} md={4} key={personne.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {personne.name}
                      </Typography>
                      <Chip label={personne.pivot?.role} size="small" sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {personne.email}
                      </Typography>
                      {personne.pivot?.date_debut && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Du {new Date(personne.pivot.date_debut).toLocaleDateString()}
                          {personne.pivot?.date_fin && ` au ${new Date(personne.pivot.date_fin).toLocaleDateString()}`}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucun personnel assigné
            </Typography>
          )}
        </Paper>
      )}

      {tab === 5 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Partenaires
          </Typography>
          {canEdit && (
            <Box component="form" onSubmit={handlePartenaireSubmit} sx={{ mb: 2, display: 'grid', gap: 2 }}>
              <Autocomplete
                options={partenaires}
                getOptionLabel={(option) => option.name}
                value={partenaires.find(p => p.id === partenaireForm.categorie_id) || null}
                onChange={(e, newValue) => {
                  setPartenaireForm({ ...partenaireForm, categorie_id: newValue?.id || '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Partenaire"
                    required
                  />
                )}
              />
              <TextField
                label="Rôle sur le projet"
                value={partenaireForm.role}
                onChange={(e) => setPartenaireForm({ ...partenaireForm, role: e.target.value })}
                required
              />
              <Box display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" startIcon={<AddIcon />} disabled={formLoading}>
                  {formLoading ? 'Enregistrement...' : 'Ajouter au projet'}
                </Button>
              </Box>
              <Divider />
            </Box>
          )}
          {projet.partenaires && projet.partenaires.length > 0 ? (
            <Grid container spacing={2}>
              {projet.partenaires.map((partenaire) => (
                <Grid item xs={12} sm={6} md={4} key={partenaire.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {partenaire.name}
                      </Typography>
                      {partenaire.pivot?.role && (
                        <Chip label={partenaire.pivot.role} size="small" sx={{ mb: 1 }} />
                      )}
                      {partenaire.email && (
                        <Typography variant="body2" color="text.secondary">
                          {partenaire.email}
                        </Typography>
                      )}
                      {partenaire.type && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Type: {partenaire.type}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucun partenaire associé
            </Typography>
          )}
        </Paper>
      )}
    </Box>
  );
}

