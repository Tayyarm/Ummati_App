'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  Button,
  Grid,
  IconButton,
  AppBar,
  Toolbar,
  Container,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  TextField,
  Snackbar,
  Alert
} from "@mui/material";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CompassCalibrationIcon from '@mui/icons-material/CompassCalibration';
import StarsIcon from '@mui/icons-material/Stars';
import InstagramIcon from '@mui/icons-material/Instagram';
import CountertopsIcon from '@mui/icons-material/Countertops';
import MissionIcon from '@mui/icons-material/EmojiObjects';
import ValuesIcon from '@mui/icons-material/Favorite';
import  Mosque from '@mui/icons-material/Mosque';

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
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 500,
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
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
  },
});

const features = [
  { title: 'Nearby Halal Restaurants', icon: RestaurantIcon, image: '/images/halal.jpg', description: 'Discover the finest halal dining options in your area.', action: 'Find Restaurants', route: '/chat' },
  { title: 'Prayer Times', icon: AccessTimeIcon, image: '/images/Prayertime.jpg', description: 'Get precise prayer times for your location.', action: 'View Prayer Times', route: '/Prayertimes' },
  { title: 'Quran Reading', icon: MenuBookIcon, image: '/images/quran.jpg', description: 'Access Quran verses and translations anytime.', action: 'Read Quran', route: '/Quran' },
  { title: 'Qibla Direction', icon: CompassCalibrationIcon, image: '/images/qiblah.jpg', description: 'Find the Qibla direction from your location.', action: 'Find Qibla', route: '/Qibla' },
  { title: '99 Names of Allah', icon: StarsIcon, image: '/images/99NAMES.jpg', description: 'Explore the 99 Names of Allah with their meanings.', action: 'View 99 Names', route: '/AsmaAlHusna' },
  { title: 'Tasbeeh Counter', icon: Mosque, image: '/images/tasbeeh.jpeg', description: 'Keep track of your dhikr with our digital counter.', action: 'Start Counting', route: '/TasbeehCounter' },
];

const steps = [
  { title: 'AI-Powered Halal Finder', description: 'Our advanced AI helps you locate authentic halal restaurants near you.' },
  { title: 'Comprehensive Islamic Resources', description: 'Access prayer times, Quran, Qibla direction, and more in one place.' },
  { title: 'Personalized Experience', description: 'Sign in to save preferences and get tailored recommendations.' },
];

const socialLinks = [
  { icon: FacebookIcon, href: 'https://www.facebook.com/profile.php?id=61564835835888' },
  { icon: InstagramIcon, href: 'https://www.instagram.com/ummati_app/' },
];

export default function MainPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [email, setEmail] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleFeatureClick = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Here you would typically send the email to your backend service
    console.log('Subscribed email:', email);
    setSnackbarOpen(true);
    setEmail('');
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
        <AppBar position="sticky" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Image
                src="/images/Ummati.png"  
                alt="Ummati Logo"
                width={40}
                height={40}
                style={{ marginRight: '10px' }}
              />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Ummati
              </Typography>
            </Box>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button color="primary" variant="outlined" sx={{ mr: 1 }}>Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button color="primary" variant="contained">Sign Up</Button>
              </SignUpButton>
            </SignedOut>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 3, mb: 8, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 8 }}>
          <Image
            src="/images/Ummati.png"  
            alt="Ummati Logo"
            width={250}
            height={250}
            style={{ marginBottom: '20px' }}
          />
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              color: 'primary.main', 
              fontStyle: 'italic', 
              mb: 2,  // Add some margin bottom for spacing
              fontWeight: 'medium'  // Optional: adjust font weight if needed
            }}
          >
            For the Ummah, By the Ummah
          </Typography>
          <Typography variant="h5" align="center" sx={{ color: 'text.secondary', maxWidth: '800px' }}>
            Discover halal restaurants, access Islamic resources, and connect with your faith using our intelligent platform
          </Typography>
        </Box>

          <Grid container spacing={4}>
            {features.map((item, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.image}
                    alt={item.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                      <item.icon color="primary" />
                      {item.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <SignedIn>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => router.push(item.route)}
                      >
                        {item.action}
                      </Button>
                    </SignedIn>
                    <SignedOut>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleFeatureClick}
                      >
                        {item.action}
                      </Button>
                    </SignedOut>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 12, mb: 8 }}>
            <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
              Features
            </Typography>
            <Grid container spacing={4}>
              {steps.map((step, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Box textAlign="center" sx={{ 
                    backgroundColor: 'background.paper',
                    borderRadius: '16px',
                    padding: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                    },
                  }}>
                    <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main', fontWeight: 'bold' }}>{step.title}</Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                      {step.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box sx={{ mt: 12, mb: 8 }}>
            <Typography variant="h3" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
              About Ummati
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box textAlign="center" sx={{ 
                  backgroundColor: 'background.paper',
                  borderRadius: '16px',
                  padding: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                  },
                }}>
                  <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main', fontWeight: 'bold' }}>Our Mission</Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    To empower Muslims worldwide by seamlessly integrating Islamic practices into modern digital life, making it easier to stay connected with faith in today`s fast-paced world.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box textAlign="center" sx={{ 
                  backgroundColor: 'background.paper',
                  borderRadius: '16px',
                  padding: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.15)',
                  },
                }}>
                  <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main', fontWeight: 'bold' }}>Our Values</Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    We are committed to accuracy, innovation, and user privacy. Our app is built on the principles of Islamic ethics, technological excellence, and community service.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>

        

        <Box
          component="footer"
          sx={{
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            py: 6,
            width: '100%',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} justifyContent="space-between">
              <Grid item xs={12} md={3}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Quick Links
                </Typography>
                <Typography variant="body2" component="div">
                  <Box component="ul" sx={{ padding: 0, listStyle: 'none' }}>
                    {features.map((feature, index) => (
                      <Box component="li" key={index} sx={{ mb: 1 }}>
                        <Button color="inherit" sx={{ p: 0 }} onClick={() => router.push(feature.route)}>
                          {feature.title}
                        </Button>
                      </Box>
                    ))}
                  </Box>
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Contact Us
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Email: ummatiapp1@gmail.com<br />
                </Typography>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Follow Us
                </Typography>
                <Box>
                  {socialLinks.map((link, index) => (
                    <IconButton key={index} color="inherit" href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`Visit our ${link.icon.name}`}>
                      <link.icon />
                    </IconButton>
                  ))}
                </Box>
              </Grid>
            </Grid>
            <Typography variant="body2" align="center" sx={{ mt: 4, opacity: 0.7 }}>
              © {new Date().getFullYear()} Ummati. All rights reserved.
            </Typography>
          </Container>
        </Box>

        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Sign In Required"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              You need to be signed in to access our features. Please sign in or create an account to continue.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <SignInButton mode="modal">
              <Button color="primary" variant="contained" autoFocus>
                Sign In
              </Button>
            </SignInButton>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            Thank you for subscribing to our newsletter!
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
