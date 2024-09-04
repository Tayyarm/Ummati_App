'use client';

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Stack,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Alert,
  AlertTitle,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Tooltip
} from "@mui/material";
import { 
  Home as HomeIcon, 
  Search as SearchIcon, 
  Restaurant as RestaurantIcon, 
  AccessTime as AccessTimeIcon, 
  Phone as PhoneIcon, 
  LocationOn as LocationOnIcon, 
  Star as StarIcon,
  FoodBank as FoodBankIcon,
  Warning as WarningIcon
} from "@mui/icons-material";

// Create a custom theme
const customTheme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32',
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00796b',
      light: '#48a999',
      dark: '#004c40',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f1f8e9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1b5e20',
      secondary: '#33691e',
    },
    warning: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
          },
        },
      },
    },
  },
});

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const searchHalalFood = async () => {
    if (query.trim() === '') return;

    setIsProcessing(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ role: "user", content: query }]),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let resultText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        resultText += decoder.decode(value || new Uint8Array(), { stream: true });
      }

      const resultArray = resultText.split('\n\n').filter(text => text.trim() !== '');

      setMessages(resultArray);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchHalalFood();
    }
  };

  const formatDetails = (details) => {
    const lines = details.split('\n');
    const name = lines[0];
    const address = lines.find(line => line.includes('Address:'))?.replace('Address:', '').trim();
    const phone = lines.find(line => line.includes('Phone:'))?.replace('Phone:', '').trim();
    const hours = lines.find(line => line.includes('Hours:'))?.replace('Hours:', '').trim();
    const region = lines.find(line => line.includes('Region:'))?.replace('Region:', '').trim();
    const rating = lines.find(line => line.includes('Rating:'))?.replace('Rating:', '').trim();
    const typesOfFood = lines.find(line => line.includes('Type of Food:'))?.replace('Type of Food:', '').trim().split(',');

    return (
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          {name}
        </Typography>
        <Grid container spacing={2}>
          {address && (
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <LocationOnIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">{address}</Typography>
              </Box>
            </Grid>
          )}
          {phone && (
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <PhoneIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">{phone}</Typography>
              </Box>
            </Grid>
          )}
          {hours && (
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <AccessTimeIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">{hours}</Typography>
              </Box>
            </Grid>
          )}
          {region && (
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <RestaurantIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">Region: {region}</Typography>
              </Box>
            </Grid>
          )}
          {rating && (
            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center">
                <StarIcon color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="text.secondary">Rating: {rating}</Typography>
              </Box>
            </Grid>
          )}
          {typesOfFood && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" flexWrap="wrap" gap={1}>
                <FoodBankIcon color="action" sx={{ mr: 1 }} />
                {typesOfFood.map((type, index) => (
                  <Chip key={index} label={type.trim()} size="small" color="primary" variant="outlined" />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'background.default' }}>
        <AppBar position="static" color="transparent" sx={{ boxShadow: 'none' }}>
          <Toolbar>
            <IconButton edge="start" color="primary" onClick={() => router.push('/')}>
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
              Ummati Halal Food Finder
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, mb: 4, backgroundColor: 'background.paper', position: 'relative' }}>
            <Tooltip
              title={
                <Typography variant="body2">
                  This is an AI-powered search. Results may be inaccurate at times. We strongly recommend verifying any information provided.
                </Typography>
              }
              placement="top-end"
            >
              <WarningIcon
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  color: 'warning.main',
                  cursor: 'pointer',
                }}
              />
            </Tooltip>
            <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
              Find Delicious Halal Food
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search for halal food..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={searchHalalFood}
                  disabled={isProcessing}
                  startIcon={isProcessing ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
                  sx={{ minWidth: '120px' }}
                >
                  {isProcessing ? 'Searching...' : 'Search'}
                </Button>
              </Box>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>Pro Tip</AlertTitle>
              Try asking about specific cuisines, dietary restrictions, or locations to get more tailored recommendations!
            </Alert>
          </Paper>

          <Stack spacing={3}>
            {messages.map((msg, index) => (
              <Card key={index}>
                <CardContent>
                  {formatDetails(msg)}
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}