import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Chip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import ImageIcon from '@mui/icons-material/Image';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AudioFileIcon from '@mui/icons-material/AudioFile';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function MediaCard({ media, onDownload }) {
  const getMediaIcon = (type) => {
    switch (type) {
      case 'image':
        return <ImageIcon />;
      case 'video':
        return <VideoLibraryIcon />;
      case 'audio':
        return <AudioFileIcon />;
      default:
        return <ImageIcon />;
    }
  };

  const isImage = media.type === 'image';
  const mediaUrl = media.chemin_fichier?.startsWith('http') 
    ? media.chemin_fichier 
    : `${API_URL.replace('/api', '')}${media.chemin_fichier}`;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {isImage && (
        <CardMedia
          component="img"
          height="200"
          image={mediaUrl}
          alt={media.titre}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
          <Box flex={1}>
            <Typography variant="h6" component="h3" gutterBottom>
              {media.titre || media.nom_fichier}
            </Typography>
            <Chip
              label={media.type}
              size="small"
              icon={getMediaIcon(media.type)}
              sx={{ mb: 1 }}
            />
          </Box>
          <IconButton
            color="primary"
            onClick={() => onDownload(media)}
            size="small"
          >
            <DownloadIcon />
          </IconButton>
        </Box>
        {media.description && (
          <Typography variant="body2" color="text.secondary">
            {media.description}
          </Typography>
        )}
        {media.taille && (
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            {(media.taille / 1024 / 1024).toFixed(2)} MB
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
