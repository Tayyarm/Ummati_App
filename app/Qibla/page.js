'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Container,
  Typography,
  CircularProgress,
  Paper,
  Grid,
  Box,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { styled } from '@mui/system';
import { useRouter } from 'next/navigation';
import CompassCalibrationIcon from '@mui/icons-material/CompassCalibration';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import HomeIcon from '@mui/icons-material/Home';

const theme = createTheme({
  palette: {
    primary: { main: '#2e7d32' },
    secondary: { main: '#00796b' },
    background: { default: '#f1f8e9', paper: '#ffffff' },
    text: { primary: '#1b5e20', secondary: '#33691e' },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '20px',
  marginBottom: '20px',
  backgroundColor: theme.palette.background.paper,
  position: 'relative',
  textAlign: 'center',
  width: '250px',
  height: '250px',
  margin: '0 auto',
  borderRadius: '50%',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const DirectionLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  fontSize: '1rem',
  fontWeight: 'bold',
  color: theme.palette.text.primary,
}));

const Qibla = () => {
  const [qiblaData, setQiblaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deviceDirection, setDeviceDirection] = useState(0);
  const [location, setLocation] = useState(null);
  const [openLocationDialog, setOpenLocationDialog] = useState(false);
  const router = useRouter();

  const fetchQiblaData = useCallback(async (latitude, longitude) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`);
      if (!response.ok) {
        throw new Error('Failed to fetch Qibla data');
      }
      const data = await response.json();
      setQiblaData(data.data);

      // Fetch location information
      const locationResponse = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
      if (locationResponse.ok) {
        const locationData = await locationResponse.json();
        setLocation({
          city: locationData.city || locationData.locality || 'Unknown City',
          country: (locationData.countryName || 'Unknown Country').replace(/\s*\(the\)\s*$/, '')
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocationRequest = useCallback(() => {
    setLoading(true);
    setError(null);

    const geolocationTimeout = setTimeout(() => {
      setError('Geolocation request timed out. Please try again.');
      setLoading(false);
    }, 10000); // 10 second timeout

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(geolocationTimeout);
        const { latitude, longitude } = position.coords;
        fetchQiblaData(latitude, longitude);
      },
      (err) => {
        clearTimeout(geolocationTimeout);
        setError('Geolocation error. Please try again.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [fetchQiblaData]);

  useEffect(() => {
    const handleOrientation = (event) => {
      setDeviceDirection(event.alpha || 0);
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, []);

  const handleAutoLocate = () => {
    if (navigator.geolocation) {
      setOpenLocationDialog(true);
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', padding: '20px' }}>
        <Container maxWidth="md" sx={{ pt: 4, pb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4, color: 'primary.main' }}>
            Qibla Direction
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleAutoLocate}
              startIcon={<MyLocationIcon />}
              sx={{ backgroundColor: 'secondary.main', '&:hover': { backgroundColor: 'secondary.dark' } }}
            >
              Auto Locate
            </Button>
            <Button
              variant="contained"
              onClick={() => router.push('/')}
              startIcon={<HomeIcon />}
              sx={{ backgroundColor: 'primary.main', '&:hover': { backgroundColor: 'primary.dark' } }}
            >
              Back to Home
            </Button>
          </Box>

          {error && (
            <Typography variant="body1" color="error" sx={{ textAlign: 'center', mb: 3 }}>
              {error}
            </Typography>
          )}

          {location && (
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 4, color: 'text.primary' }}>
              Showing Qibla direction for {location.city}, {location.country}
            </Typography>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : qiblaData ? (
            <>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 2, color: 'text.primary' }}>
                Direction to Makkah: {qiblaData.direction.toFixed(2)}Â°
              </Typography>
              <StyledPaper>
                <DirectionLabel style={{ top: '10px', left: '50%', transform: 'translateX(-50%)' }}>N</DirectionLabel>
                <DirectionLabel style={{ bottom: '10px', left: '50%', transform: 'translateX(-50%)' }}>S</DirectionLabel>
                <DirectionLabel style={{ top: '50%', left: '10px', transform: 'translateY(-50%)' }}>W</DirectionLabel>
                <DirectionLabel style={{ top: '50%', right: '10px', transform: 'translateY(-50%)' }}>E</DirectionLabel>
                <Grid container spacing={2} alignItems="center" justifyContent="center" style={{ height: '100%' }}>
                  <Grid item>
                    <IconButton>
                      <CompassCalibrationIcon
                        style={{
                          transform: `rotate(${qiblaData.direction - deviceDirection}deg)`,
                          fontSize: 120,
                          color: theme.palette.primary.main,
                        }}
                      />
                    </IconButton>
                  </Grid>
                </Grid>
              </StyledPaper>
            </>
          ) : null}
        </Container>

        <Dialog
          open={openLocationDialog}
          onClose={() => setOpenLocationDialog(false)}
          PaperProps={{ style: { borderRadius: '16px', padding: '16px' } }}
        >
          <DialogTitle sx={{ color: 'primary.main' }}>Location Access</DialogTitle>
          <DialogContent>
            <Typography color="text.primary">
              We need your location to provide an accurate Qibla direction. Do you want to allow access to your location?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenLocationDialog(false)} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpenLocationDialog(false);
                handleLocationRequest();
              }}
              color="primary"
              variant="contained"
            >
              Allow
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Qibla;