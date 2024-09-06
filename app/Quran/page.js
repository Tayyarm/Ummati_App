'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Container, Typography, List, ListItem, ListItemText, CircularProgress,
  Paper, Box, Divider, AppBar, Toolbar, Dialog, DialogContent,
  Button, IconButton, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, Card, CardContent, CardActions,
  TextField, useMediaQuery
} from '@mui/material';
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import BookIcon from '@mui/icons-material/Book';

// Theme configuration
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
      fontSize: '2.5rem',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.5rem',
      '@media (max-width:600px)': {
        fontSize: '1.2rem',
      },
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

// Utility functions
const removeHtmlTags = (str) => {
  if ((str === null) || (str === '')) return '';
  str = str.toString();
  str = str.replace(/<br\s*\/?>/gi, '\n')
           .replace(/<p>/gi, '\n')
           .replace(/<\/p>/gi, '\n\n')
           .replace(/<sup[^>]*>.*?<\/sup>/gi, '')
           .replace(/<[^>]*>/g, '')
           .split('\n').map(line => line.trim()).join('\n').trim()
           .replace(/^(Period of Revelation|Name)(?!:)/gm, '$1:')
           .replace(/:\S/g, ': ');
  return str;
};

const recitations = [
  { id: 2, reciter_name: 'AbdulBaset AbdulSamad', style: 'Murattal' },
  { id: 1, reciter_name: 'AbdulBaset AbdulSamad', style: 'Mujawwad' },
  { id: 3, reciter_name: 'Abdur-Rahman as-Sudais', style: null },
  { id: 4, reciter_name: 'Abu Bakr al-Shatri', style: null },
  { id: 5, reciter_name: 'Hani ar-Rifai', style: null },
  { id: 12, reciter_name: 'Mahmoud Khalil Al-Husary', style: 'Muallim' },
  { id: 6, reciter_name: 'Mahmoud Khalil Al-Husary', style: null },
  { id: 7, reciter_name: 'Mishari Rashid al-`Afasy', style: null },
  { id: 9, reciter_name: 'Mohamed Siddiq al-Minshawi', style: 'Murattal' },
  { id: 8, reciter_name: 'Mohamed Siddiq al-Minshawi', style: 'Mujawwad' },
  { id: 10, reciter_name: 'Sa`ud ash-Shuraym', style: null },
  { id: 11, reciter_name: 'Abdul Muhsin al-Qasim', style: null }
];

// API functions
const fetchChapterAudio = async (reciterId, chapterNumber) => {
  try {
    const response = await axios.get(`https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${chapterNumber}`, {
      headers: { 'Accept': 'application/json' }
    });
    return response.data.audio_file.audio_url;
  } catch (err) {
    console.error('Failed to fetch chapter audio', err);
    return null;
  }
};

const fetchChapters = async () => {
  try {
    const response = await axios.get('https://api.quran.com/api/v4/chapters', {
      headers: { 'Accept': 'application/json' }
    });
    return response.data.chapters;
  } catch (err) {
    throw new Error('Failed to fetch chapters');
  }
};

const fetchChapterDetails = async (id, reciterId, translationId) => {
  try {
    const [detailsResponse, infoResponse, versesResponse] = await Promise.all([
      axios.get(`https://api.quran.com/api/v4/chapters/${id}`, {
        headers: { 'Accept': 'application/json' }
      }),
      axios.get(`https://api.quran.com/api/v4/chapters/${id}/info`, {
        headers: { 'Accept': 'application/json' }
      }),
      axios.get(`https://api.quran.com/api/v4/verses/by_chapter/${id}`, {
        headers: { 'Accept': 'application/json' },
        params: {
          language: 'en',
          words: true,
          translations: translationId,
          per_page: 286,
          fields: 'text_uthmani'
        }
      })
    ]);

    const chapterDetails = detailsResponse.data.chapter;
    const chapterInfo = {
      ...infoResponse.data.chapter_info,
      text: removeHtmlTags(infoResponse.data.chapter_info.text),
      short_text: removeHtmlTags(infoResponse.data.chapter_info.short_text)
    };
    const chapterVerses = versesResponse.data.verses.map(verse => ({
      ...verse,
      translations: verse.translations.map(translation => ({
        ...translation,
        text: removeHtmlTags(translation.text)
      }))
    }));

    const audioUrl = await fetchChapterAudio(reciterId, id);

    return { chapterDetails, chapterInfo, chapterVerses, audioUrl };
  } catch (err) {
    console.error('Failed to fetch chapter details, info, or verses', err);
    throw err;
  }
};

const fetchTafsirs = async () => {
  try {
    const response = await axios.get('https://api.quran.com/api/v4/resources/tafsirs', {
      headers: { 'Accept': 'application/json' }
    });
    return response.data.tafsirs;
  } catch (err) {
    console.error('Failed to fetch tafsirs', err);
    return [];
  }
};

const fetchTafsir = async (tafsirId, chapterId) => {
  try {
    let allTafsirs = [];
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const response = await axios.get(`https://api.quran.com/api/v4/tafsirs/${tafsirId}/by_chapter/${chapterId}`, {
        headers: { 'Accept': 'application/json' },
        params: { page: currentPage }
      });
      
      allTafsirs = [...allTafsirs, ...response.data.tafsirs];
      
      hasMorePages = response.data.pagination.next_page !== null;
      currentPage++;
    }

    return allTafsirs;
  } catch (err) {
    console.error('Failed to fetch tafsir', err);
    return null;
  }
};

const fetchAvailableTranslations = async () => {
  try {
    const response = await axios.get('https://api.quran.com/api/v4/resources/translations', {
      headers: { 'Accept': 'application/json' }
    });
    return response.data.translations;
  } catch (err) {
    console.error('Failed to fetch available translations', err);
    return [];
  }
};

// Main component
export default function QuranChapters() {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterDetails, setChapterDetails] = useState(null);
  const [chapterInfo, setChapterInfo] = useState(null);
  const [chapterVerses, setChapterVerses] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [selectedReciterId, setSelectedReciterId] = useState(recitations[0]?.id);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChapters, setFilteredChapters] = useState([]);
  const [tafsirs, setTafsirs] = useState([]);
  const [selectedTafsirId, setSelectedTafsirId] = useState('');
  const [tafsirContent, setTafsirContent] = useState(null);
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [availableTranslations, setAvailableTranslations] = useState([]);
  const [selectedTranslationId, setSelectedTranslationId] = useState('');
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const loadChaptersAndTafsirs = async () => {
      try {
        const [fetchedChapters, fetchedTafsirs, fetchedTranslations] = await Promise.all([
          fetchChapters(),
          fetchTafsirs(),
          fetchAvailableTranslations()
        ]);
        setChapters(fetchedChapters);
        setFilteredChapters(fetchedChapters);
        setTafsirs(fetchedTafsirs);
        setSelectedTafsirId(fetchedTafsirs[0]?.id);
        setAvailableTranslations(fetchedTranslations);
        setSelectedTranslationId(fetchedTranslations[0]?.id.toString());
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadChaptersAndTafsirs();
  }, []);

  useEffect(() => {
    if (selectedChapter) {
      const loadChapterDetails = async () => {
        try {
          const { chapterDetails, chapterInfo, chapterVerses, audioUrl } = await fetchChapterDetails(selectedChapter.id, selectedReciterId, selectedTranslationId);
          setChapterDetails(chapterDetails);
          setChapterInfo(chapterInfo);
          setChapterVerses(chapterVerses);
          setAudioUrl(audioUrl);
        } catch (err) {
          console.error('Failed to load chapter details', err);
        }
      };
      loadChapterDetails();
    }
  }, [selectedChapter, selectedReciterId, selectedTranslationId]);

  useEffect(() => {
    if (selectedChapter && selectedTafsirId) {
      const loadTafsir = async () => {
        setTafsirLoading(true);
        const fetchedTafsir = await fetchTafsir(selectedTafsirId, selectedChapter.id);
        setTafsirContent(fetchedTafsir);
        setTafsirLoading(false);
      };
      loadTafsir();
    }
  }, [selectedChapter, selectedTafsirId]);

  useEffect(() => {
    const filtered = chapters.filter(chapter =>
      chapter.name_simple.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.name_arabic.includes(searchTerm) ||
      chapter.translated_name.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chapter.id.toString() === searchTerm
    );
    setFilteredChapters(filtered);
  }, [searchTerm, chapters]);

  const handleChapterClick = (chapter) => setSelectedChapter(chapter);
  const handleCloseDialog = () => {
    setSelectedChapter(null);
    setChapterDetails(null);
    setChapterInfo(null);
    setChapterVerses([]);
    setAudioUrl(null);
    setTabValue(0);
    setIsPlaying(false);
    setTafsirContent(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const handleReciterChange = (event) => setSelectedReciterId(parseInt(event.target.value, 10));
  const handleTafsirChange = (event) => setSelectedTafsirId(event.target.value);
  const handleTranslationChange = (event) => setSelectedTranslationId(event.target.value);
  
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <CircularProgress />
    </Box>
  );
  if (error) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Typography color="error">{error}</Typography>
    </Box>
  );
  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
        <AppBar position="static" sx={{ backgroundColor: 'primary.main' }}>
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1 : 0 }}>
              <MenuBookIcon sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Quran Chapters
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => router.push('/')}
                sx={{ 
                  backgroundColor: 'white', 
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                  mb: isMobile ? 1 : 0
                }}
              >
                Go Back to Home
              </Button>
              <FormControl variant="outlined" sx={{ minWidth: isMobile ? '100%' : 250, mb: isMobile ? 1 : 0 }}>
                <InputLabel id="reciter-select-label" sx={{ 
                  color: 'primary.contrastText', 
                  '&.Mui-focused': { color: 'primary.contrastText' },
                  transform: 'translate(14px, 9px) scale(1)',
                  '&.MuiInputLabel-shrink': { transform: 'translate(14px, -6px) scale(0.75)' }
                }}>
                  Select Reciter
                </InputLabel>
                <Select
                  labelId="reciter-select-label"
                  id="reciter-select"
                  value={selectedReciterId}
                  onChange={handleReciterChange}
                  label="Select Reciter"
                  sx={{
                    height: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'primary.contrastText',
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.7)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.contrastText' },
                    '& .MuiSvgIcon-root': { color: 'primary.contrastText' },
                    '& .MuiSelect-select': { 
                      paddingTop: '8px', 
                      paddingBottom: '8px',
                      display: 'flex',
                      alignItems: 'center'
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        maxHeight: 300,
                        '& .MuiMenuItem-root': {
                          padding: '6px 16px',
                          '&:hover': { backgroundColor: 'primary.light' }
                        }
                      }
                    }
                  }}
                >
                  {recitations.map((reciter) => (
                    <MenuItem key={reciter.id} value={reciter.id}>
                      <Typography noWrap>
                        {reciter.reciter_name}
                        {reciter.style && (
                          <Typography component="span" sx={{ ml: 1, fontSize: '0.8em', color: 'text.secondary' }}>
                            ({reciter.style})
                          </Typography>
                        )}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: isMobile ? 2 : 3 }}>
          <Typography variant="h2" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
            Explore Quran Chapters
          </Typography>
          <Typography variant="h5" align="center" sx={{ mb: 8, color: 'text.secondary' }}>
            Discover the wisdom and beauty of the Quran through its chapters
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="Search Surah"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ mb: 4 }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {filteredChapters.map((chapter) => (
              <Card key={chapter.id} sx={{ width: isMobile ? '100%' : 300, display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Typography variant="h5" component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                    {chapter.id}. {chapter.name_simple}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {chapter.name_arabic}
                  </Typography>
                  <Typography variant="body2">
                    {chapter.translated_name.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Verses: {chapter.verses_count}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleChapterClick(chapter)}
                    fullWidth
                  >
                    Explore Chapter
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>
      <Dialog
        open={!!selectedChapter}
        onClose={handleCloseDialog}
        fullScreen
      >
        <AppBar sx={{ position: 'relative', backgroundColor: 'primary.main' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseDialog}
              aria-label="close"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1, fontWeight: 'bold' }} variant="h6" component="div">
              {selectedChapter?.name_simple}
            </Typography>
          </Toolbar>
        </AppBar>
        <DialogContent sx={{ backgroundColor: 'background.default', p: isMobile ? 2 : 3 }}>
          {selectedChapter && (
            <Container maxWidth="md">
              <Typography variant="h3" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold', mt: 4 }}>{selectedChapter.name_simple}</Typography>
              <Typography variant="h4" gutterBottom sx={{ color: 'secondary.main' }}>Arabic Name: {selectedChapter.name_arabic}</Typography>
  
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="chapter-tabs" 
                sx={{ mt: 4, mb: 4 }}
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : "auto"}
                allowScrollButtonsMobile
              >
                <Tab label="Info" />
                <Tab label="Short Info" />
                <Tab label="Verses" />
                <Tab label="Tafsir" />
              </Tabs>
  
              <Box sx={{ mt: 4 }}>
                {tabValue === 0 && (
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>{chapterInfo?.text}</Typography>
                )}
                {tabValue === 1 && (
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>{chapterInfo?.short_text}</Typography>
                )}
                {tabValue === 2 && (
                  <>
                    <Box sx={{ mb: 4, width: '100%' }}>
                      {audioUrl ? (
                        <audio 
                          controls 
                          style={{ 
                            width: '100%', 
                            backgroundColor: customTheme.palette.primary.light,
                            color: customTheme.palette.primary.contrastText,
                            borderRadius: '24px',
                            padding: '8px',
                            outline: 'none'
                          }}
                        >
                          <source src={audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No audio available
                        </Typography>
                      )}
                    </Box>
                    <FormControl fullWidth sx={{ mb: 4 }}>
                      <InputLabel id="translation-select-label">Select Translation</InputLabel>
                      <Select
                        labelId="translation-select-label"
                        id="translation-select"
                        value={selectedTranslationId}
                        onChange={handleTranslationChange}
                        label="Select Translation"
                      >
                        {availableTranslations.map((translation) => (
                          <MenuItem key={translation.id} value={translation.id.toString()}>
                            {translation.name} ({translation.language_name})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <List>
                      {chapterVerses.map((verse) => (
                        <Card key={verse.id} sx={{ mb: 4 }}>
                          <CardContent>
                            <Typography variant="h5" sx={{ mb: 2, textAlign: 'right', color: 'primary.main' }}>
                              {verse.text_uthmani}
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'secondary.main' }}>
                              Verse {verse.verse_number}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                              {verse.translations[0]?.text || 'Translation not available'}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))}
                    </List>
                  </>
                )}
                {tabValue === 3 && (
                  <>
                    <FormControl fullWidth sx={{ mb: 4 }}>
                      <InputLabel id="tafsir-select-label">Select Tafsir</InputLabel>
                      <Select
                        labelId="tafsir-select-label"
                        id="tafsir-select"
                        value={selectedTafsirId}
                        onChange={handleTafsirChange}
                        label="Select Tafsir"
                      >
                        {tafsirs.map((tafsir) => (
                          <MenuItem key={tafsir.id} value={tafsir.id}>
                            {tafsir.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {tafsirLoading ? (
                      <Box display="flex" justifyContent="center" alignItems="center">
                        <CircularProgress />
                      </Box>
                    ) : tafsirContent && tafsirContent.length > 0 ? (
                      tafsirContent.map((tafsir, index) => (
                        <Card key={index} sx={{ mb: 4 }} id={`tafsir-verse-${tafsir.verse_number}`}>
                          <CardContent>
                            <Typography variant="h6" sx={{ color: 'secondary.main', mb: 2 }}>
                              Verse {tafsir.verse_number}
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                              {removeHtmlTags(tafsir.text)}
                            </Typography>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        No tafsir content available for this chapter.
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Container>
          )}
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
}