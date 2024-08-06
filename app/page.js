'use client'
import { useState, useEffect } from 'react';
import { Box, Button, Modal, Stack, TextField, Typography, AppBar, Toolbar, IconButton, Container, CssBaseline, ThemeProvider, Drawer, List, ListItem, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { firestore } from "@/firebase";
import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      ...(mode === 'dark'
        ? {
            primary: {
              main: '#90caf9',
            },
            background: {
              default: '#121212',
              paper: '#1d1d1d',
            },
            text: {
              primary: '#ffffff',
              secondary: grey[500],
            },
            buttons: {
              home: '#e64a19', // Darker shade for Home button
              portfolio: '#388e3c', // Darker shade for Portfolio button
              linkedin: '#004c8c', // Darker shade for LinkedIn button
            }
          }
        : {
            primary: {
              main: '#1976d2',
            },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
            text: {
              primary: '#000000',
              secondary: grey[700],
            },
            buttons: {
              home: '#ff5722', // Default color for Home button
              portfolio: '#4caf50', // Default color for Portfolio button
              linkedin: '#0e76a8', // Default color for LinkedIn button
            }
          }),
    },
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif',
      button: {
        textTransform: 'none',
        fontWeight: 'bold',
        fontSize: '1rem',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&.home': {
              backgroundColor: theme.palette.buttons.home,
              color: theme.palette.getContrastText(theme.palette.buttons.home),
            },
            '&.portfolio': {
              backgroundColor: theme.palette.buttons.portfolio,
              color: theme.palette.getContrastText(theme.palette.buttons.portfolio),
            },
            '&.linkedin': {
              backgroundColor: theme.palette.buttons.linkedin,
              color: theme.palette.getContrastText(theme.palette.buttons.linkedin),
            },
          }),
        },
      },
      MuiListItemText: {
        styleOverrides: {
          primary: {
            fontFamily: 'Roboto, Arial, sans-serif',
            fontWeight: 'bold',
            fontSize: '1.2rem',
          },
        },
      },
    },
  });


export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [item, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [darkMode] = useState(true); // Dark mode only

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setPantry(pantryList);
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);
    const qty = parseInt(quantity);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + qty });
    } else {
      await setDoc(docRef, { quantity: qty });
    }
    await updatePantry();
  };

  const updateItemQuantity = async () => {
    const docRef = doc(collection(firestore, 'pantry'), editingItem);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const newQuantity = parseInt(quantity);
      if (newQuantity > 0) {
        await setDoc(docRef, { quantity: newQuantity });
      } else {
        alert('Quantity must be greater than 0');
      }
    }
    setEditingItem(null);
    setQuantity('');
    handleClose();
    await updatePantry();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updatePantry();
  };

  const removeAllQuantities = async (item) => {
    const docRef = doc(collection(firestore, 'pantry'), item);
    await deleteDoc(docRef);
    await updatePantry();
  };

  const removeAllItems = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const deletePromises = docs.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    await updatePantry();
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
    setQuantity('');
  };

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
  };

  return (
    <ThemeProvider theme={getTheme('dark')}>
      <CssBaseline />
      <Box
        sx={{
          flexGrow: 1,
          backgroundImage: 'url(/wowww.jpg)', // Path from public folder
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          minHeight: '100vh',
        }}
      >
        <AppBar position="static" sx={{ mb: 4 }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{
                mr: 2,
                fontSize: '2rem',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
              sx={{
                '& .MuiDrawer-paper': {
                  backgroundColor: theme.palette.background.default,
                  color: theme.palette.text.primary,
                  padding: theme.spacing(2),
                },
              }}
            >
              <Box
                sx={{ width: 250 }}
                role="presentation"
                onClick={toggleDrawer(false)}
                onKeyDown={toggleDrawer(false)}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Menu
                </Typography>
                <List>
                  <Link href="/" passHref>
                    <ListItem button component="a" sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                      <ListItemText primary="Home" primaryTypographyProps={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'Roboto, Arial, sans-serif', color: '#0e76a8' }} />
                    </ListItem>
                  </Link>
                  <Link href="https://husnain-landingpage.vercel.app" passHref>
                    <ListItem button component="a" sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                      <ListItemText primary="Portfolio" primaryTypographyProps={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'Roboto, Arial, sans-serif', color: '#0e76a8' }} />
                    </ListItem>
                  </Link>
                  <Link href="https://www.linkedin.com/in/husnain-khaliq-5414b9277/" passHref>
                    <ListItem button component="a" sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}>
                      <ListItemText primary="LinkedIn" primaryTypographyProps={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'Roboto, Arial, sans-serif', color: '#0e76a8' }} />
                    </ListItem>
                  </Link>
                </List>
              </Box>
            </Drawer>

            {!isMobile && (
              <>
                <Link href="/" passHref>
                  <Button sx={{ color: 'white' }}>Home</Button>
                </Link>
                <Link href="https://husnain-landingpage.vercel.app" passHref>
                  <Button sx={{ color: 'white' }}>Portfolio</Button>
                </Link>
                <Link href="https://www.linkedin.com/in/husnain-khaliq-5414b9277/" passHref>
                  <Button sx={{ color: 'white' }}>LinkedIn</Button>
                </Link>
              </>
            )}
            <Box sx={{ flexGrow: 1 }} />
            {/* Remove the Switch */}
          </Toolbar>
        </AppBar>

        <Container>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Typography variant="h4" align="center" sx={{ mb: 4 }}>
              Pantry Tracker
            </Typography>
            <Typography
  variant="body1"
  align="center"
  sx={{
    mb: 4,
    fontFamily: 'Lora, serif',
    fontSize: '1.8rem',
    color: 'rgba(255, 255, 255, 50)', // Slightly less opaque for better readability
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)', // Adds a subtle shadow to improve contrast
  }}
>
  It&apos;s a simple and intuitive application designed to help you keep track of the items in your pantry. With this app, you can easily add new items, update their quantities, and remove items when they&apos;re no longer needed.
</Typography>




            <Box display="flex" gap={2} sx={{ mb: 4 }}>
              <Button variant="contained" color="primary" onClick={handleOpen}>
                Add New Item
              </Button>
              <Button variant="contained" color="error" onClick={removeAllItems}>
                Remove All
              </Button>
            </Box>

            <Modal open={open} onClose={handleClose}>
              <Box
                sx={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '90%',
                  maxWidth: '500px',
                  bgcolor: 'background.paper',
                  p: 4,
                  borderRadius: '12px',
                  boxShadow: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  outline: 'none',
                }}
              >
                <Typography variant="h6">
                  {editingItem ? 'Update Quantity' : 'Add Item'}
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    value={item}
                    onChange={(e) => setItemName(e.target.value)}
                    label="Item Name"
                    variant="outlined"
                    fullWidth
                    disabled={!!editingItem}
                  />
                  <TextField
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    label="Quantity"
                    variant="outlined"
                    fullWidth
                    type="number"
                    inputProps={{ min: "1" }} // Ensure input allows only positive numbers
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      if (editingItem) {
                        if (parseInt(quantity) > 0) {
                          updateItemQuantity();
                        } else {
                          alert('Quantity must be greater than 0');
                        }
                      } else {
                        if (parseInt(quantity) > 0) {
                          addItem(item);
                          setItemName('');
                        } else {
                          alert('Quantity must be greater than 0');
                        }
                      }
                      handleClose();
                    }}
                    disabled={parseInt(quantity) <= 0} // Disable button if quantity is not valid
                  >
                    {editingItem ? 'Update' : 'Add'}
                  </Button>
                </Stack>
              </Box>
            </Modal>

            <Box width="100%" maxWidth="800px" mt={4}>
              <Typography variant="h5" align="center" sx={{ mb: 2 }}>
                Pantry Items
              </Typography>
              <Stack spacing={2}>
                {pantry.map(({ name, quantity }) => (
                  <Box
                    key={name}
                    p={2}
                    bgcolor="background.paper"
                    borderRadius={4}
                    boxShadow={2}
                    display="flex"
                    flexDirection="column"
                    gap={2}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </Typography>
                      <Typography variant="h6">
                        Quantity: {quantity}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                          setEditingItem(name);
                          setItemName(name);
                          setQuantity(quantity);
                          handleOpen();
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => removeItem(name)}
                      >
                        Remove
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => removeAllQuantities(name)}
                      >
                        Remove All
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </Container>

        <Analytics />
        <SpeedInsights />
      </Box>
    </ThemeProvider>
  );
}
