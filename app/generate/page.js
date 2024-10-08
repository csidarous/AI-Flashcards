'use client';

import React, { useState } from 'react';
import { AppBar, Button, Typography, Toolbar, Container, Box, TextField, Grid, Card, CardContent, IconButton, CircularProgress, Menu, MenuItem, } from '@mui/material';
import { useUser, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import FlipIcon from '@mui/icons-material/Flip';
import getStripe from '/utils/get-stripe';
import MenuIcon from '@mui/icons-material/Menu';

export default function Generate() {
  const [text, setText] = useState('');
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [loading, setLoading] = useState(false); // Add loading state

  const handleCheckout = async () => {
    const checkoutSession = await fetch('/api/checkout_session', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' },
    });
    const checkoutSessionJson = await checkoutSession.json();
    console.log('Session ID:', checkoutSessionJson.id);

    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    });

    if (error) {
      console.warn(error.message);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter some text to generate flashcards.');
      return;
    }

    setLoading(true); // Set loading to true when starting to fetch

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: text,
      });

      if (!response.ok) {
        throw new Error('Failed to generate flashcards');
      }

      const data = await response.json();
      setFlashcards(data);
    } catch (error) {
      console.error('Error generating flashcards:', error);
      alert('An error occurred while generating flashcards. Please try again.');
    } finally {
      setLoading(false); // Set loading to false after fetch completes
    }
  };

  const handleFlip = (index) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppBar 
      position="static" 
      sx={{ backgroundColor: '#333', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }} 
      >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        
        <Typography 
          variant="h4" 
          sx={{ fontWeight: 'bold', color: '#fff', letterSpacing: '0.05em' }}
        >
          FlashGenie
        </Typography>
        
        
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: '1rem' }}>
          <SignedOut>
            <Button color="inherit" href="/sign-in" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
              Login
            </Button>
            <Button 
              variant="contained" 
              color="secondary" 
              href="/sign-up" 
              sx={{ fontWeight: 'bold', fontSize: '1.1rem', borderRadius: '20px' }}
            >
              Sign Up
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Box>

        <IconButton 
          edge="start" 
          color="inherit" 
          aria-label="menu" 
          onClick={handleMenuOpen}
          sx={{ display: { xs: 'block', sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          sx={{ display: { xs: 'block', sm: 'none' } }}
        >
          <SignedOut>
            <MenuItem onClick={handleMenuClose} component="a" href="/sign-in">
              Login
            </MenuItem>
            <MenuItem onClick={handleMenuClose} component="a" href="/sign-up">
              Sign Up
            </MenuItem>
          </SignedOut>
          <SignedIn>
            <MenuItem onClick={handleMenuClose}>
              <UserButton />
            </MenuItem>
          </SignedIn>
        </Menu>
      </Toolbar>
    </AppBar>

      <Container maxWidth="md">
        <Box sx={{ my: 6, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#fff' }}>
            Generate Flashcards
          </Typography>
          <TextField
            value={text}
            onChange={(e) => setText(e.target.value)}
            label="Enter your text here"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={{
              mb: 3,
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': {
                  borderColor: '#3f51b5',
                },
                '&:hover fieldset': {
                  borderColor: '#303f9f',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1e88e5',
                },
                '& input': {
                  color: '#ffffff', // Set the text color to white
                },
                '& textarea': {
                  color: '#fff', // Set the text color to white for textarea (multiline)
                },
              },
              '& .MuiInputLabel-root': {
                color: '#3f51b5',
              },
            }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              backgroundColor: '#1e88e5',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: '#1565c0',
                boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate Flashcards'}
          </Button>
        </Box>

        {/* Flashcards display */}
        {flashcards.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Generated Flashcards
            </Typography>
            <Grid container spacing={2}>
              {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ position: 'relative', height: '250px', overflow: 'auto' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 1, color: flipped[index] ? 'text.primary' : '#1976d2' }}>
                        {flipped[index] ? 'Answer:' : 'Question:'}
                      </Typography>
                      <Typography>
                        {flipped[index] ? flashcard.back : flashcard.front}
                      </Typography>
                      <IconButton
                        onClick={() => handleFlip(index)}
                        sx={{ position: 'absolute', top: 10, right: 10 }}
                      >
                        <FlipIcon />
                      </IconButton>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </>
  );
}
