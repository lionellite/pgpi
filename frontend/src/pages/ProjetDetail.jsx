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
  Pagination,
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
  
  // Pagination pour médias et documents
  const [mediaPagination, setMediaPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  });
  const [documentPagination, setDocumentPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  });

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
  const [partenaires, setPartenaires] = useState([]);
  const [personnelForm, setPersonnelForm] = useState({
    user_email: '',
    role: '',
    date_debut: '',
    date_fin: '',
  });
  const [partenaireAttachForm, setPartenaireAttachForm] = useState({
    partenaire_id: null,
    role: '',
  });
  const [partenaireCreateForm, setPartenaireCreateForm] = useState({
    nom: '',
    point_contact: '',
    localisation: '',
    email: '',
    telephone: '',
    adresse: '',
    type: '',
    description: '',
    logo: null,
    role: '',
  });

  const [formLoading, setFormLoading] = useState(false);

  const canEdit = user && (
    user.role === 'admin' || 
    user.role === 'directeur' || 
    projet?.chef_projet_id === user.id
  );

  useEffect(() => {
    if (id && id !== 'new' && id !== 'edit') {
      fetchProjet();
      fetchUsers();
      fetchPartenaires();
    } else {
      setLoading(false);
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
      params.page = mediaPagination.current_page;
      params.per_page = mediaPagination.per_page;
      
      const response = await api.get(`/projets/${id}/medias`, { params });
      const medias = response.data.data || response.data;
      setProjet(prev => ({ ...prev, medias: Array.isArray(medias) ? medias : [] }));
      
      // Mettre à jour la pagination
      if (response.data.meta) {
        setMediaPagination({
          current_page: response.data.meta.current_page,
          last_page: response.data.meta.last_page,
          per_page: response.data.meta.per_page,
          total: response.data.meta.total,
        });
      }
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
      params.page = documentPagination.current_page;
      params.per_page = documentPagination.per_page;
      
      const response = await api.get(`/projets/${id}/documents`, { params });
      const documents = response.data.data || response.data;
      setProjet(prev => ({ ...prev, documents: Array.isArray(documents) ? documents : [] }));
      
      // Mettre à jour la pagination
      if (response.data.meta) {
        setDocumentPagination({
          current_page: response.data.meta.current_page,
          last_page: response.data.meta.last_page,
          per_page: response.data.meta.per_page,
          total: response.data.meta.total,
        });
      }
    } catch (err) {
      console.error('Erreur chargement documents:', err);
    }
  };

  useEffect(() => {
    if (tab === 3 && projet) {
      fetchMedias();
    }
  }, [tab, mediaFilters, mediaPagination.current_page]);

  useEffect(() => {
    if (tab === 2 && projet) {
      fetchDocuments();
    }
  }, [tab, documentFilters, documentPagination.current_page]);

  // Réinitialiser la pagination quand les filtres changent
  useEffect(() => {
    setMediaPagination(prev => ({ ...prev, current_page: 1 }));
  }, [mediaFilters.type, mediaFilters.search, mediaFilters.sort_by, mediaFilters.sort_order]);

  useEffect(() => {
    setDocumentPagination(prev => ({ ...prev, current_page: 1 }));
  }, [documentFilters.type, documentFilters.etat, documentFilters.search, documentFilters.sort_by, documentFilters.sort_order]);

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
        user_email: '',
        role: '',
        date_debut: '',
        date_fin: '',
      });
      setActionMessage('Personnel ajouté avec succès');
    } catch (err) {
      setError(handleFormError(err, "Erreur lors de l'ajout du personnel"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddPartenaire = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setActionMessage(null);
    try {
      await api.post(`/projets/${id}/partenaires`, {
        partenaire_id: partenaireAttachForm.partenaire_id,
        role: partenaireAttachForm.role,
      });
      await fetchProjet();
      setPartenaireAttachForm({
        partenaire_id: null,
        role: '',
      });
      setActionMessage('Partenaire ajouté avec succès');
    } catch (err) {
      setError(handleFormError(err, "Erreur lors de l'ajout du partenaire"));
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreatePartenaire = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setActionMessage(null);
    try {
      const formData = new FormData();
      Object.keys(partenaireCreateForm).forEach(key => {
        if (key !== 'logo' && key !== 'role' && partenaireCreateForm[key]) {
          formData.append(key, partenaireCreateForm[key]);
        }
      });
      if (partenaireCreateForm.logo) {
        formData.append('logo', partenaireCreateForm.logo);
      }

      const response = await api.post('/partenaires', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const newPartenaire = response.data.data;
      
      // Ajouter le partenaire au projet avec le rôle
      await api.post(`/projets/${id}/partenaires`, {
        partenaire_id: newPartenaire.id,
        role: partenaireCreateForm.role,
      });
      
      await fetchProjet();
      await fetchPartenaires();
      
      setPartenaireCreateForm({
        nom: '',
        point_contact: '',
        localisation: '',
        email: '',
        telephone: '',
        adresse: '',
        type: '',
        description: '',
        logo: null,
        role: '',
      });
      setActionMessage('Partenaire créé et ajouté au projet avec succès');
    } catch (err) {
      setError(handleFormError(err, "Erreur lors de la création du partenaire"));
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
        {canEdit && (
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
              <Typography><strong>Durée:</strong> {projet.duree} jours</Typography>
              <Typography><strong>Chef de projet:</strong> {projet.chef_projet?.prenom} {projet.chef_projet?.nom} ({projet.chef_projet?.email})</Typography>
              <Typography><strong>État:</strong> {projet.etat}</Typography>
              {projet.services && projet.services.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Services associés</Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    {projet.services.map((service) => (
                      <Chip key={service.id} label={service.titre || service.code || `Service ${service.id}`} />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Objectifs
              </Typography>
              <Typography variant="body1" gutterBottom><strong>Objectif général:</strong></Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{projet.objectif_general}</Typography>
              {projet.objectifs_specifiques && (
                <>
                  <Typography variant="body1" gutterBottom><strong>Objectifs spécifiques:</strong></Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{projet.objectifs_specifiques}</Typography>
                </>
              )}
              {projet.descriptions && (
                <>
                  <Typography variant="body1" gutterBottom sx={{ mt: 2 }}><strong>Description:</strong></Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{projet.descriptions}</Typography>
                </>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Équipe & partenaires
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Personnel</Typography>
                  {projet.personnel && projet.personnel.length > 0 ? (
                    <List dense>
                      {projet.personnel.map((p) => (
                        <ListItem key={p.id} divider>
                          <ListItemText
                            primary={`${p.prenom} ${p.nom}`}
                            secondary={
                              <>
                                <span>{p.email}</span>
                                {p.pivot?.role ? <span>{` — ${p.pivot.role}`}</span> : null}
                                {p.service?.titre || p.service?.code ? (
                                  <span>{` — Service: ${p.service.titre || p.service.code}`}</span>
                                ) : null}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucun personnel assigné
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Partenaires</Typography>
                  {projet.partenaires && projet.partenaires.length > 0 ? (
                    <List dense>
                      {projet.partenaires.map((p) => (
                        <ListItem key={p.id} divider>
                          <ListItemText
                            primary={p.nom}
                            secondary={
                              <>
                                <span>{p.email || '—'}</span>
                                {p.pivot?.role ? <span>{` — ${p.pivot.role}`}</span> : null}
                                {p.point_contact ? <span>{` — Contact: ${p.point_contact}`}</span> : null}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucun partenaire associé
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Activités, médias et documents récents
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>Dernières activités</Typography>
                  {projet.activites && projet.activites.length > 0 ? (
                    <List dense>
                      {projet.activites.slice(0, 3).map((a) => (
                        <ListItem key={a.id} divider>
                          <ListItemText
                            primary={a.titre}
                            secondary={
                              <>
                                {a.date_debut && (
                                  <span>
                                    Du {new Date(a.date_debut).toLocaleDateString()}
                                    {a.date_fin ? ` au ${new Date(a.date_fin).toLocaleDateString()}` : ''}
                                  </span>
                                )}
                                {a.etat ? <span>{` — ${a.etat}`}</span> : null}
                              </>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucune activité enregistrée
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>Médias récents</Typography>
                  {projet.medias && projet.medias.length > 0 ? (
                    <List dense>
                      {projet.medias.slice(0, 3).map((m) => (
                        <ListItem key={m.id} divider>
                          <ListItemText
                            primary={m.titre}
                            secondary={m.type ? `Type: ${m.type}` : undefined}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucun média pour le moment
                    </Typography>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>Documents récents</Typography>
                  {projet.documents && projet.documents.length > 0 ? (
                    <List dense>
                      {projet.documents.slice(0, 3).map((d) => (
                        <ListItem key={d.id} divider>
                          <ListItemText
                            primary={d.titre}
                            secondary={d.type ? `Type: ${d.type}` : undefined}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Aucun document pour le moment
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Activités
          </Typography>
          {canEdit && (
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
          {canEdit && (
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
                  canValidate={user && (user.role === 'admin' || user.role === 'directeur')}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Aucun document disponible
            </Typography>
          )}
          {documentPagination.last_page > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={documentPagination.last_page}
                page={documentPagination.current_page}
                onChange={(event, value) => setDocumentPagination(prev => ({ ...prev, current_page: value }))}
                color="primary"
              />
            </Box>
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
          {canEdit && (
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
          {mediaPagination.last_page > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={mediaPagination.last_page}
                page={mediaPagination.current_page}
                onChange={(event, value) => setMediaPagination(prev => ({ ...prev, current_page: value }))}
                color="primary"
              />
            </Box>
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
                getOptionLabel={(option) => `${option.prenom} ${option.nom} (${option.email})`}
                value={users.find(u => u.email === personnelForm.user_email) || null}
                onChange={(e, newValue) => {
                  setPersonnelForm({ ...personnelForm, user_email: newValue?.email || '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Utilisateur"
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
              <TextField
                label="Rôle sur le projet"
                value={personnelForm.role}
                onChange={(e) => setPersonnelForm({ ...personnelForm, role: e.target.value })}
                required
              />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Date début"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={personnelForm.date_debut}
                    onChange={(e) => setPersonnelForm({ ...personnelForm, date_debut: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Date fin"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    value={personnelForm.date_fin}
                    onChange={(e) => setPersonnelForm({ ...personnelForm, date_fin: e.target.value })}
                  />
                </Grid>
              </Grid>
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
                        {personne.prenom} {personne.nom}
                      </Typography>
                      <Chip label={personne.pivot?.role} size="small" sx={{ mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {personne.email}
                      </Typography>
                      {personne.service && (
                        <Typography variant="body2" color="text.secondary">
                          Service: {personne.service.titre || personne.service.code}
                        </Typography>
                      )}
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
            <>
              <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Ajouter un partenaire existant
                </Typography>
                <Box component="form" onSubmit={handleAddPartenaire} sx={{ display: 'grid', gap: 2 }}>
                  <Autocomplete
                    options={partenaires}
                    getOptionLabel={(option) => `${option.nom} (${option.email || 'N/A'})`}
                    value={partenaires.find(p => p.id === partenaireAttachForm.partenaire_id) || null}
                    onChange={(e, newValue) => {
                      setPartenaireAttachForm({ ...partenaireAttachForm, partenaire_id: newValue?.id || null });
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Partenaire" required />
                    )}
                  />
                  <TextField
                    label="Rôle"
                    value={partenaireAttachForm.role}
                    onChange={(e) => setPartenaireAttachForm({ ...partenaireAttachForm, role: e.target.value })}
                  />
                  <Button type="submit" variant="contained" disabled={formLoading}>
                    {formLoading ? 'Ajout...' : 'Ajouter au projet'}
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mb: 3, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Créer un nouveau partenaire
                </Typography>
                <Box component="form" onSubmit={handleCreatePartenaire} sx={{ display: 'grid', gap: 2 }}>
                  <TextField
                    label="Nom"
                    value={partenaireCreateForm.nom}
                    onChange={(e) => setPartenaireCreateForm({ ...partenaireCreateForm, nom: e.target.value })}
                    required
                  />
                  <TextField
                    label="Point de contact"
                    value={partenaireCreateForm.point_contact}
                    onChange={(e) => setPartenaireCreateForm({ ...partenaireCreateForm, point_contact: e.target.value })}
                  />
                  <TextField
                    label="Localisation"
                    value={partenaireCreateForm.localisation}
                    onChange={(e) => setPartenaireCreateForm({ ...partenaireCreateForm, localisation: e.target.value })}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    value={partenaireCreateForm.email}
                    onChange={(e) => setPartenaireCreateForm({ ...partenaireCreateForm, email: e.target.value })}
                  />
                  <TextField
                    label="Téléphone"
                    value={partenaireCreateForm.telephone}
                    onChange={(e) => setPartenaireCreateForm({ ...partenaireCreateForm, telephone: e.target.value })}
                  />
                  <TextField
                    label="Adresse"
                    multiline
                    rows={2}
                    value={partenaireCreateForm.adresse}
                    onChange={(e) => setPartenaireCreateForm({ ...partenaireCreateForm, adresse: e.target.value })}
                  />
                  <TextField
                    label="Type"
                    value={partenaireCreateForm.type}
                    onChange={(e) => setPartenaireCreateForm({ ...partenaireCreateForm, type: e.target.value })}
                  />
                  <TextField
                    label="Description"
                    multiline
                    rows={3}
                    value={partenaireCreateForm.description}
                    onChange={(e) => setPartenaireCreateForm({ ...partenaireCreateForm, description: e.target.value })}
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPartenaireCreateForm({ ...partenaireCreateForm, logo: e.target.files?.[0] || null })}
                  />
                  <TextField
                    label="Rôle sur le projet"
                    value={partenaireCreateForm.role}
                    onChange={(e) => setPartenaireCreateForm({ ...partenaireCreateForm, role: e.target.value })}
                  />
                  <Button type="submit" variant="contained" disabled={formLoading}>
                    {formLoading ? 'Création...' : 'Créer et ajouter au projet'}
                  </Button>
                </Box>
              </Box>
              <Divider sx={{ my: 3 }} />
            </>
          )}

          {projet.partenaires && projet.partenaires.length > 0 ? (
            <Grid container spacing={2}>
              {projet.partenaires.map((partenaire) => (
                <Grid item xs={12} sm={6} md={4} key={partenaire.id}>
                  <Card>
                    <CardContent>
                      {partenaire.logo && (
                        <Box sx={{ mb: 2, textAlign: 'center' }}>
                          <img src={partenaire.logo} alt={partenaire.nom} style={{ maxWidth: '100%', maxHeight: 100 }} />
                        </Box>
                      )}
                      <Typography variant="h6" gutterBottom>
                        {partenaire.nom}
                      </Typography>
                      {partenaire.pivot?.role && (
                        <Chip label={partenaire.pivot.role} size="small" sx={{ mb: 1 }} />
                      )}
                      {partenaire.point_contact && (
                        <Typography variant="body2" color="text.secondary">
                          Contact: {partenaire.point_contact}
                        </Typography>
                      )}
                      {partenaire.email && (
                        <Typography variant="body2" color="text.secondary">
                          {partenaire.email}
                        </Typography>
                      )}
                      {partenaire.localisation && (
                        <Typography variant="body2" color="text.secondary">
                          {partenaire.localisation}
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

