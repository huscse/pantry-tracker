'use client'; // Add this line at the top of the file

import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [item, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [editingItem, setEditingItem] = useState(null);

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

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
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

  useEffect(() => {
    updatePantry();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
    setQuantity('');
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Box
        width="100%"
        maxWidth="800px"
        bgcolor="#ffffff"
        borderRadius="12px"
        boxShadow={4}
        p={4}
        mb={4}
      >
        <Typography variant="h4" color="#333" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
          Pantry Tracker
        </Typography>
        <Typography variant="body1" color="#555" align="center" sx={{ mb: 3 }}>
          I created this Pantry Tracker app using Next.js, React, and Firebase to store the data. 
          It&apos;s a simple and intuitive application designed to help you keep track of the items in your pantry. 
          With this app, you can easily add new items, update their quantities, and remove items when they&apos;re no longer 
          needed.
        </Typography>
        <Typography variant="body1" color="#555" align="center" sx={{ mb: 3 }}>
          Below is my Portfolio and LinkedIn, feel free to check and let's connect!
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
          <Link href="/" passHref>
            <Button variant="outlined" color="primary">Home</Button>
          </Link>
          <Link href="https://boiledpotatoe.github.io/landing-page/" passHref>
            <Button variant="outlined" color="primary">Portfolio</Button>
          </Link>
          <Link href="https://www.linkedin.com/in/husnain-khaliq-5414b9277/" passHref>
            <Button variant="outlined" color="primary">LinkedIn</Button>
          </Link>
        </Box>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%" left="50%"
          width="90%"
          maxWidth="500px"
          bgcolor="white"
          borderRadius="12px"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
            backdropFilter: 'blur(8px)',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {editingItem ? 'Update Quantity' : 'Add Item'}
          </Typography>
          <Stack width="100%" spacing={2}>
            <TextField
              value={item}
              onChange={(e) => setItemName(e.target.value)}
              label="Item Name"
              variant="outlined"
              fullWidth
              disabled={!!editingItem}
              sx={{ borderRadius: '8px' }}
            />
            <TextField
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              label="Quantity"
              variant="outlined"
              fullWidth
              type="number"
              sx={{ borderRadius: '8px' }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (editingItem) {
                  updateItemQuantity();
                } else {
                  addItem(item);
                  setItemName('');
                }
                handleClose();
              }}
              sx={{ borderRadius: '8px' }}
            >
              {editingItem ? 'Update' : 'Add'}
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Button
        variant="contained"
        color="primary"
        onClick={handleOpen}
        sx={{
          borderRadius: '12px',
          mb: 2,
          '&:hover': {
            backgroundColor: '#0288d1',
          },
        }}
      >
        Add New Item
      </Button>

      <Box
        width="100%"
        maxWidth="800px"
        bgcolor="#ffffff"
        borderRadius="12px"
        boxShadow={4}
        p={4}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Typography variant="h5" color="#333" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
          Pantry Items
        </Typography>
        <Stack width="100%" spacing={2}>
          {pantry.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="80px"
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#f7f7f7"
              padding={2}
              borderRadius={4}
              boxShadow={2}
              sx={{
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 4,
                },
              }}
            >
              <Typography variant="h6" color="#333" flex={2}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h6" color="#333" flex={1} textAlign="center">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={1} flex={1} justifyContent="flex-end">
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setEditingItem(name);
                    setItemName(name);
                    setQuantity(quantity);
                    handleOpen();
                  }}
                  sx={{ borderRadius: '8px' }}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => removeItem(name)}
                  sx={{ borderRadius: '8px' }}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}








