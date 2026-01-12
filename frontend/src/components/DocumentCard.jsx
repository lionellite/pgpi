import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function DocumentCard({ document, onDownload, onValidate, onReject, canValidate }) {
  const getEtatIcon = (etat) => {
    switch (etat) {
      case 'valide':
        return <CheckCircleIcon color="success" />;
      case 'rejete':
        return <CancelIcon color="error" />;
      case 'en_attente':
        return <PendingIcon color="warning" />;
      default:
        return <PendingIcon />;
    }
  };

  const getEtatColor = (etat) => {
    switch (etat) {
      case 'valide':
        return 'success';
      case 'rejete':
        return 'error';
      case 'en_attente':
        return 'warning';
      default:
        return 'default';
    }
  };

  const downloadUrl = `${API_URL}/documents/${document.id}/download`;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <DescriptionIcon color="primary" />
              <Typography variant="h6" component="h3">
                {document.titre}
              </Typography>
            </Box>
            <Box display="flex" gap={1} mb={1} flexWrap="wrap">
              <Chip label={document.type} size="small" />
              <Chip
                label={document.etat}
                size="small"
                color={getEtatColor(document.etat)}
                icon={getEtatIcon(document.etat)}
              />
              {document.version && (
                <Chip label={`v${document.version}`} size="small" variant="outlined" />
              )}
            </Box>
            {document.description && (
              <Typography variant="body2" color="text.secondary" mb={1}>
                {document.description}
              </Typography>
            )}
            {document.derniere_mise_a_jour && (
              <Typography variant="caption" color="text.secondary" display="block">
                Dernière mise à jour: {new Date(document.derniere_mise_a_jour).toLocaleString()}
                {document.derniere_mise_a_jour_par && ` par ${document.derniere_mise_a_jour_par.prenom} ${document.derniere_mise_a_jour_par.nom}`}
              </Typography>
            )}
            {document.taille && (
              <Typography variant="caption" color="text.secondary" display="block">
                Taille: {(document.taille / 1024 / 1024).toFixed(2)} MB
              </Typography>
            )}
          </Box>
          <Box display="flex" flexDirection="column" gap={1}>
            <IconButton
              color="primary"
              onClick={() => onDownload(document)}
              title="Télécharger"
            >
              <DownloadIcon />
            </IconButton>
            {canValidate && document.etat === 'en_attente' && (
              <>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  onClick={() => onValidate(document)}
                  startIcon={<CheckCircleIcon />}
                >
                  Valider
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => onReject(document)}
                  startIcon={<CancelIcon />}
                >
                  Rejeter
                </Button>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
