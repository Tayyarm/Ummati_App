'use client';
import React, { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Typography, Box, Container, useMediaQuery, CssBaseline, Select, MenuItem, FormControl, InputLabel, Button } from '@mui/material';
import Link from 'next/link';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1B5E20', // Darker green
    },
    secondary: {
      main: '#4CAF50', // Lighter green
    },
    background: {
      default: '#E8F5E9', // Very light green background
    },
  },
});

const dhikrList = [
  'SubhanAllah',
  'Alhamdulillah',
  'La ilaha illa Allah',
  'Allahu Akbar',
  'Astaghfirullah'
];

const colorOptions = [
  { name: 'Green', value: '#4CAF50' },
  { name: 'Blue', value: '#2196F3' },
  { name: 'Brown', value: '#795548' },
  { name: 'Purple', value: '#9C27B0' },
  { name: 'Teal', value: '#009688' },
];

const TasbeehBeads = ({ count, color }) => {
  const radius = 160;
  const center = 200;
  const beadRadius = 7;

  // Helper function to round to 2 decimal places
  const round = (num) => Number(num.toFixed(2));

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" style={{width: '100%', height: '400px'}}>
      <defs>
        <radialGradient id="beadGradient" cx="40%" cy="40%" r="60%" fx="40%" fy="40%">
          <stop offset="0%" style={{stopColor: 'white', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: color, stopOpacity: 0.8}} />
          <stop offset="100%" style={{stopColor: color, stopOpacity: 0.6}} />
        </radialGradient>
        <filter id="beadShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
          <feOffset dx="1" dy="1" result="offsetblur" />
          <feFlood floodColor="rgba(0,0,0,0.5)" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="beadHighlight">
          <feSpecularLighting result="specOut" specularExponent="20" lightingColor="white">
            <fePointLight x="50" y="50" z="200"/>
          </feSpecularLighting>
          <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
        </filter>
      </defs>
      
      {/* Strings at the top */}
      <path d="M200,40 Q160,10 120,40" stroke={color} strokeWidth="2" fill="none" />
      <path d="M200,40 Q240,10 280,40" stroke={color} strokeWidth="2" fill="none" />
      
      {/* Circular string */}
      <circle cx={center} cy={center} r={radius} stroke={color} strokeWidth="2" fill="none" />
      
      {/* Beads */}
      {[...Array(99)].map((_, i) => {
        const angle = (i * 360 / 99 - 90) * (Math.PI / 180);
        const x = round(center + radius * Math.cos(angle));
        const y = round(center + radius * Math.sin(angle));
        return (
          <g key={i}>
            <circle 
              cx={x} 
              cy={y} 
              r={beadRadius}
              fill={i < count ? "url(#beadGradient)" : `${color}33`}
              filter={i < count ? "url(#beadShadow) url(#beadHighlight)" : ""}
              transform={i < count ? `scale(1.2)` : ''}
              transformOrigin={`${x}px ${y}px`}
              transition="transform 0.3s ease, fill 0.3s ease, filter 0.3s ease"
            />
          </g>
        );
      })}
      
      {/* Separators */}
      {[0, 33, 66].map((i) => {
        const angle = (i * 360 / 99 - 90) * (Math.PI / 180);
        const x = round(center + radius * Math.cos(angle));
        const y = round(center + radius * Math.sin(angle));
        return (
          <rect 
            key={i} 
            x={round(x - 6)} 
            y={round(y - 6)} 
            width="12" 
            height="12" 
            fill={color} 
            transform={`rotate(45, ${x}, ${y})`}
            filter="url(#beadShadow)"
          />
        );
      })}
    </svg>
  );
};

const IslamicPrayerCounterPage = () => {
  const [count, setCount] = useState(0);
  const [selectedDhikr, setSelectedDhikr] = useState(dhikrList[0]);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleIncrement = () => {
    setCount((prevCount) => (prevCount === 98 ? 0 : prevCount + 1));
  };

  const handleDhikrChange = (event) => {
    setSelectedDhikr(event.target.value);
    setCount(0); // Reset count when changing dhikr
  };

  const handleColorChange = (event) => {
    setSelectedColor(event.target.value);
  };

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.target.tagName !== 'SELECT' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        handleIncrement();
      }
    };

    document.addEventListener('touchstart', handleTouchStart);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  return (
    <Box
      onClick={(e) => e.target.tagName !== 'SELECT' && e.target.tagName !== 'BUTTON' && handleIncrement()}
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: theme.palette.background.default,
        cursor: 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
        touchAction: 'manipulation',
        pt: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography 
            variant={isMobile ? "h3" : "h2"} 
            component="h1" 
            color="primary"
          >
            Dhikr Counter
          </Typography>
          <Link href="/" passHref>
            <Button
              variant="outlined"
              color="primary"
              onClick={(e) => e.stopPropagation()}
              sx={{ ml: 2 }}
            >
              Back to Home
            </Button>
          </Link>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <FormControl sx={{ width: '48%' }}>
            <InputLabel id="dhikr-select-label">Select Dhikr</InputLabel>
            <Select
              labelId="dhikr-select-label"
              id="dhikr-select"
              value={selectedDhikr}
              label="Select Dhikr"
              onChange={handleDhikrChange}
              onClick={(e) => e.stopPropagation()}
            >
              {dhikrList.map((dhikr) => (
                <MenuItem key={dhikr} value={dhikr}>{dhikr}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ width: '48%' }}>
            <InputLabel id="color-select-label">Tasbeeh Color</InputLabel>
            <Select
              labelId="color-select-label"
              id="color-select"
              value={selectedColor}
              label="Tasbeeh Color"
              onChange={handleColorChange}
              onClick={(e) => e.stopPropagation()}
            >
              {colorOptions.map((color) => (
                <MenuItem key={color.name} value={color.value}>
                  {color.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ position: 'relative', width: '100%', height: '400px', mb: 3 }}>
          <TasbeehBeads count={count} color={selectedColor} />
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h2" 
              gutterBottom 
              align="center"
              color="primary"
            >
              {selectedDhikr}
            </Typography>
            <Typography 
              variant="h1" 
              component="h2" 
              gutterBottom 
              align="center" 
              sx={{ 
                fontSize: isMobile ? '3.5rem' : '5rem',
                transition: 'font-size 0.3s ease',
                color: theme.palette.primary.main,
              }}
            >
              {count}
            </Typography>
          </Box>
        </Box>
        <Typography 
          variant={isMobile ? "body1" : "h6"} 
          align="center" 
          sx={{ mt: 1 }}
        >
          {isMobile ? 'Tap anywhere to count' : 'Click anywhere to count'}
        </Typography>
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ mt: 1 }}
        >
          (Resets after 99 {isMobile ? 'taps' : 'clicks'})
        </Typography>
      </Container>
    </Box>
  );
};

export default function Home() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <IslamicPrayerCounterPage />
    </ThemeProvider>
  );
}