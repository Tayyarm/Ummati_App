'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Container, Typography, CircularProgress, Box, Button, Card, CardContent,
  Dialog, DialogContent, DialogTitle, DialogActions, TextField,
  Radio, RadioGroup, FormControlLabel, FormControl, Grid, Paper
} from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SchoolIcon from '@mui/icons-material/School';

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

const FlashCardContainer = styled(Box)({
  perspective: '1000px',
  height: '200px',
  width: '100%',
  margin: '0 auto',
});

const FlashCard = styled(Box)(({ flipped }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  transition: 'transform 0.6s',
  transformStyle: 'preserve-3d',
  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
  cursor: 'pointer',
}));

const CardFace = styled(Paper)({
  position: 'absolute',
  width: '100%',
  height: '100%',
  backfaceVisibility: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '15px',
  borderRadius: '12px',
});

const CardFront = styled(CardFace)({
  backgroundColor: '#e8f5e9',
  zIndex: 2,
});

const CardBack = styled(CardFace)({
  backgroundColor: '#c8e6c9',
  transform: 'rotateY(180deg)',
});

const AsmaAlHusna = () => {
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('default'); // 'default', 'study', or 'quiz'
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [flippedCards, setFlippedCards] = useState({});
  const router = useRouter();

  useEffect(() => {
    const fetchNames = async () => {
      try {
        const response = await axios.get('https://api.aladhan.com/v1/asmaAlHusna');
        setNames(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchNames();
  }, []);

  const toggleCard = (number) => {
    setFlippedCards(prev => ({
      ...prev,
      [number]: !prev[number]
    }));
  };

  const resetQuiz = () => {
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizComplete(false);
    setSelectedAnswer('');
    setShowQuizAnswer(false);
    setMode('default');
  };

  const startQuiz = () => {
    const shuffled = [...names].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numQuestions);
    const questions = selected.map((name) => {
      const options = [name.en.meaning];
      while (options.length < 4) {
        const randomName = names[Math.floor(Math.random() * names.length)];
        if (!options.includes(randomName.en.meaning)) {
          options.push(randomName.en.meaning);
        }
      }
      return {
        name: name.name,
        transliteration: name.transliteration,
        correctAnswer: name.en.meaning,
        options: options.sort(() => 0.5 - Math.random()),
      };
    });
    setQuizQuestions(questions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizComplete(false);
    setSelectedAnswer('');
    setShowQuizAnswer(false);
    setMode('quiz');
  };

  const handleQuizAnswer = () => {
    setShowQuizAnswer(true);
    if (selectedAnswer === quizQuestions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setShowQuizAnswer(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleNumQuestionsChange = (event) => {
    setNumQuestions(parseInt(event.target.value, 10));
  };

  if (loading) {
    return (
      <ThemeProvider theme={customTheme}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={customTheme}>
        <Container maxWidth="md" sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="error">
            Error: {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push('/')}
            sx={{ mt: 4 }}
          >
            Go Back to Home
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={customTheme}>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'background.default' }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h2" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 4 }}>
            Asma al-Husna (99 Names of Allah)
          </Typography>
          <Typography variant="h5" align="center" sx={{ mb: 8, color: 'text.secondary' }}>
            Explore and study the beautiful names of Allah
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<MenuBookIcon />}
              onClick={() => setMode(mode === 'study' ? 'default' : 'study')}
            >
              {mode === 'study' ? 'Exit Study Mode' : 'Study Mode'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<SchoolIcon />}
              onClick={() => setMode(mode === 'quiz' ? 'default' : 'quiz')}
            >
              {mode === 'quiz' ? 'Exit Quiz Mode' : 'Quiz Mode'}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => router.push('/')}
            >
              Go Back to Home
            </Button>
          </Box>

          {mode === 'study' && (
            <>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  mb: 3, 
                  textAlign: 'center', 
                  fontStyle: 'italic', 
                  color: 'text.secondary'
                }}
              >
                Make sure you click on each flashcard to see the answer
              </Typography>
              <Grid container spacing={3}>
                {names.map((name) => (
                  <Grid item xs={12} sm={6} md={4} key={name.number}>
                    <FlashCardContainer>
                      <FlashCard
                        onClick={() => toggleCard(name.number)}
                        flipped={flippedCards[name.number]}
                      >
                        <CardFront>
                          <Typography variant="h5" component="div" sx={{ color: 'primary.main', fontWeight: 'bold', textAlign: 'center' }}>
                            {name.name}
                          </Typography>
                          <Typography sx={{ mt: 2 }} color="text.secondary" align="center">
                            {name.transliteration}
                          </Typography>
                        </CardFront>
                        <CardBack>
                          <Typography variant="body1" sx={{ color: 'primary.dark', textAlign: 'center' }}>
                            {name.en.meaning}
                          </Typography>
                        </CardBack>
                      </FlashCard>
                    </FlashCardContainer>
                  </Grid>
                ))}
              </Grid>
            </>
          )}

          {mode === 'default' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
              {names.map((name) => (
                <Card key={name.number} sx={{ width: 300, display: 'flex', flexDirection: 'column' }}>
                  <CardContent>
                    <Typography variant="h5" component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      {name.name}
                    </Typography>
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      {name.transliteration}
                    </Typography>
                    <Typography variant="body2">
                      {name.en.meaning}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}

          {mode === 'quiz' && (
            <Box sx={{ maxWidth: 600, margin: '0 auto' }}>
              {!quizComplete ? (
                quizQuestions.length > 0 ? (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Question {currentQuestionIndex + 1} of {quizQuestions.length}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      What is the meaning of {quizQuestions[currentQuestionIndex].name} ({quizQuestions[currentQuestionIndex].transliteration})?
                    </Typography>
                    <FormControl component="fieldset" style={{ width: '100%' }}>
                      <RadioGroup
                        value={selectedAnswer}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                      >
                        {quizQuestions[currentQuestionIndex].options.map((choice, index) => (
                          <FormControlLabel
                            key={index}
                            value={choice}
                            control={<Radio />}
                            label={
                              <>
                                {choice}
                                {showQuizAnswer && choice === quizQuestions[currentQuestionIndex].correctAnswer && (
                                  <span style={{ color: 'green' }}> (Correct Answer)</span>
                                )}
                                {showQuizAnswer && choice === selectedAnswer && choice !== quizQuestions[currentQuestionIndex].correctAnswer && (
                                  <span style={{ color: 'red' }}> (Wrong)</span>
                                )}
                              </>
                            }
                            sx={{
                              backgroundColor: showQuizAnswer
                                ? choice === quizQuestions[currentQuestionIndex].correctAnswer
                                  ? '#c8e6c9'
                                  : choice === selectedAnswer
                                    ? '#ffcdd2'
                                    : 'transparent'
                                : 'transparent',
                              padding: '10px',
                              borderRadius: '4px',
                              marginBottom: '8px',
                            }}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                    {!showQuizAnswer ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleQuizAnswer}
                        disabled={!selectedAnswer}
                        sx={{ mt: 2 }}
                      >
                        Submit Answer
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleNextQuestion}
                        sx={{ mt: 2 }}
                      >
                        {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      How many questions would you like in your quiz?
                    </Typography>
                    <TextField
                      type="number"
                      value={numQuestions}
                      onChange={handleNumQuestionsChange}
                      inputProps={{ min: 1, max: 99 }}
                      sx={{ mb: 2 }}
                    />
                    <Button variant="contained" onClick={startQuiz} sx={{ mt: 2 }}>
                      Start Quiz
                    </Button>
                  </Box>
                )
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Quiz Complete!
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Your score: {score} out of {quizQuestions.length}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Percentage: {((score / quizQuestions.length) * 100).toFixed(2)}%
                  </Typography>
                  <Button variant="contained" onClick={resetQuiz} sx={{ mt: 2 }}>
                    Close and Reset Quiz
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default AsmaAlHusna;


