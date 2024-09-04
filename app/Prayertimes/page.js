'use client';
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  Container,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { MyLocation, Home } from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // A rich green color
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00796b', // A teal color that complements the green
      light: '#48a999',
      dark: '#004c40',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f1f8e9', // A very light green for the background
      paper: '#ffffff',
    },
    text: {
      primary: '#1b5e20', // Dark green for primary text
      secondary: '#33691e', // Slightly lighter green for secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
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


const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [openLocationDialog, setOpenLocationDialog] = useState(true);
  const [locationAllowed, setLocationAllowed] = useState(false);

  const fetchPrayerTimes = async (city, country, month, year) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.aladhan.com/v1/calendarByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2&month=${month}&year=${year}`);
      const data = await response.json();
      setPrayerTimes(data.data);
      setLocation({ city, country });
    } catch (err) {
      setError('Failed to fetch prayer times. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCountryName = (name) => {
    return name.replace(/ \(the\)$/, '');
  };

  const handleLocationRequest = async () => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              const data = await response.json();
              const city = data.city || data.locality || data.principalSubdivision;
              const country = formatCountryName(data.countryName);
              if (city && country) {
                fetchPrayerTimes(city, country, currentMonth, currentYear);
                setLocationAllowed(true);
                setLocation({ city, country });
              } else {
                setError('Unable to determine location. Please try again.');
                setLoading(false);
                setLocationAllowed(false);
              }
            } catch (err) {
              setError('Failed to get location. Please try again.');
              setLoading(false);
              setLocationAllowed(false);
            }
          },
          (err) => {
            setError('Geolocation error. Please try again.');
            setLoading(false);
            setLocationAllowed(false);
          }
        );
      } else {
        setError('Geolocation is not supported by this browser.');
        setLoading(false);
        setLocationAllowed(false);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setLoading(false);
      setLocationAllowed(false);
    }
  };

  useEffect(() => {
    if (locationAllowed && !location) {
      handleLocationRequest();
    }
  }, [locationAllowed, location]);

  useEffect(() => {
    const checkAndUpdateMonth = () => {
      const now = new Date();
      const newMonth = now.getMonth() + 1;
      const newYear = now.getFullYear();
      
      if (newMonth !== currentMonth || newYear !== currentYear) {
        setCurrentMonth(newMonth);
        setCurrentYear(newYear);
        if (location) {
          fetchPrayerTimes(location.city, location.country, newMonth, newYear);
        }
      }
    };

    checkAndUpdateMonth();
    const intervalId = setInterval(checkAndUpdateMonth, 3600000);
    return () => clearInterval(intervalId);
  }, [currentMonth, currentYear, location]);

  const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(':');
    let period = 'AM';
    let hour = parseInt(hours, 10);
    
    if (hour >= 12) {
      period = 'PM';
      if (hour > 12) hour -= 12;
    }
    if (hour === 0) hour = 12;
    
    return `${hour}:${minutes} ${period}`;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'background.default',
          padding: '20px',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Container
            maxWidth="lg"
            sx={{
              background: 'background.paper',
              borderRadius: '16px',
              padding: '30px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center', mb: 4, color: 'primary.main' }}>
              Prayer Times Calendar
            </Typography>

            {location && (
              <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', mb: 4, color: 'text.primary' }}>
                Showing prayer times for {location.city}, {location.country}
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 2 }}>
              <Button
                variant="contained"
                onClick={() => setOpenLocationDialog(true)}
                startIcon={<MyLocation />}
                sx={{ 
                  backgroundColor: 'secondary.main',
                  '&:hover': {
                    backgroundColor: 'secondary.dark',
                  },
                }}
              >
                Auto Locate
              </Button>
              <Button
                variant="contained"
                onClick={() => window.location.href = '/'}
                startIcon={<Home />}
                sx={{ 
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                Back to Home
              </Button>
            </Box>

            {error && (
              <Typography variant="body1" color="error" sx={{ textAlign: 'center', mb: 3 }}>
                {error}
              </Typography>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <>
                {locationAllowed ? (
                  <>
                    {prayerTimes.length > 0 ? (
                      <TableContainer component={Paper} sx={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', borderRadius: '16px' }}>
                        <Table sx={{ minWidth: 650 }} aria-label="prayer times table">
                          <TableHead>
                            <TableRow sx={{ backgroundColor: 'primary.main' }}>
                              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Date</TableCell>
                              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Fajr</TableCell>
                              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Sunrise</TableCell>
                              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Dhuhr</TableCell>
                              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Asr</TableCell>
                              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Maghrib</TableCell>
                              <TableCell sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}>Isha</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {prayerTimes.map((day) => (
                              <TableRow
                                key={day.date.gregorian.date}
                                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'background.default' } }}
                              >
                                <TableCell component="th" scope="row" sx={{ color: 'text.primary' }}>
                                  {day.date.readable}
                                </TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{convertTo12HourFormat(day.timings.Fajr.split(' ')[0])}</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{convertTo12HourFormat(day.timings.Sunrise.split(' ')[0])}</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{convertTo12HourFormat(day.timings.Dhuhr.split(' ')[0])}</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{convertTo12HourFormat(day.timings.Asr.split(' ')[0])}</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{convertTo12HourFormat(day.timings.Maghrib.split(' ')[0])}</TableCell>
                                <TableCell sx={{ color: 'text.secondary' }}>{convertTo12HourFormat(day.timings.Isha.split(' ')[0])}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body1" sx={{ textAlign: 'center', mt: 4, color: 'text.primary' }}>
                        No prayer times available.
                      </Typography>
                    )}
                  </>
                ) : (
                  <Typography variant="body1" sx={{ textAlign: 'center', mt: 4, color: 'text.primary' }}>
                    Location access denied. Please allow location access to view prayer times.
                  </Typography>
                )}
              </>
            )}
          </Container>
        </Box>

        <Dialog 
          open={openLocationDialog} 
          onClose={() => {
            setOpenLocationDialog(false);
            setLocationAllowed(false);
          }}
          PaperProps={{
            style: {
              borderRadius: '16px',
              padding: '16px',
            },
          }}
        >
          <DialogTitle sx={{ color: 'primary.main' }}>Location Access</DialogTitle>
          <DialogContent>
            <Typography color="text.primary">
              We need your location to provide accurate prayer times. Do you want to allow access to your location?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => {
                setOpenLocationDialog(false);
                setLocationAllowed(false);
              }}
              sx={{ color: 'text.secondary' }}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                setOpenLocationDialog(false);
                await handleLocationRequest();
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

export default PrayerTimes;