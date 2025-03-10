'use client';

import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import { Stack, Box, Typography, Modal, TextField, Button } from '@mui/material';
import { collection, query, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export default function Home() {
  // State to store the list of inventory items
  const [inventory, setInventory] = useState([]);
  // Modal control for adding a new item
  const [open, setOpen] = useState(false);
  // Modal control for editing item quantity
  const [editOpen, setEditOpen] = useState(false);
  // State for new item name and quantity input fields
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  // State for tracking the currently selected item for editing
  const [currentEditItem, setCurrentEditItem] = useState('');
  const [newQuantity, setNewQuantity] = useState(0);

  // Modal styling
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'white',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  };

  // Function to fetch and update the inventory list from Firestore
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    
    // Extract document data and store it in an array
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });

    setInventory(inventoryList);
  };

  // Fetch inventory when the component mounts
  useEffect(() => {
    updateInventory();
  }, []);

  // Function to remove an item from inventory (decrement quantity or delete)
  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef); // Delete the item if quantity reaches 0
      } else {
        await setDoc(docRef, { quantity: quantity - 1 }); // Reduce quantity by 1
      }
    }

    await updateInventory(); // Refresh inventory list
  };

  // Function to add a new item or increase its quantity in Firestore
  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity: currentQuantity } = docSnap.data();
      await setDoc(docRef, { quantity: currentQuantity + quantity }); // Update existing quantity
    } else {
      await setDoc(docRef, { quantity }); // Create a new item with the given quantity
    }

    await updateInventory(); // Refresh inventory list
  };

  // Function to edit the quantity of an existing item
  const editItemQuantity = async (item, newQuantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await setDoc(docRef, { quantity: newQuantity }, { merge: true }); // Merge updates
    await updateInventory();
    setEditOpen(false); // Close edit modal
  };

  // Handlers to open and close the "Add Item" modal
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setItemName('');
    setItemQuantity(1);
  };

  // Handlers to open and close the "Edit Quantity" modal
  const handleEditOpen = (item, quantity) => {
    setCurrentEditItem(item);
    setNewQuantity(quantity);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setCurrentEditItem('');
    setNewQuantity(0);
  };

  // Function to delete an item from Firestore
  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    await deleteDoc(docRef);
    await updateInventory();
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      {/* Add Item Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              label="Item Name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              variant="outlined"
              fullWidth
              label="Quantity"
              type="number"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(Number(e.target.value))}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, itemQuantity);
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Edit Item Quantity Modal */}
      <Modal open={editOpen} onClose={handleEditClose}>
        <Box sx={style}>
          <Typography variant="h6">Edit Quantity</Typography>
          <TextField
            variant="outlined"
            fullWidth
            label="New Quantity"
            type="number"
            value={newQuantity}
            onChange={(e) => setNewQuantity(Number(e.target.value))}
          />
          <Button
            variant="outlined"
            onClick={() => editItemQuantity(currentEditItem, newQuantity)}
          >
            Save
          </Button>
        </Box>
      </Modal>

      {/* Button to Open Add Item Modal */}
      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>

      {/* Inventory Display Section */}
      <Box border="1px solid #333">
        <Box
          width="800px"
          height="100px"
          bgcolor="#ADD8E6"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h2" color="#333" textAlign="center">
            Items in Pantry
          </Typography>
        </Box>

        {/* List of Inventory Items */}
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {inventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="150px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              bgcolor="#f0f0f0"
              paddingX={5}
            >
              {/* Item Name */}
              <Typography
                variant="h5"
                color="#333"
                textAlign="center"
                sx={{ fontSize: '1.25rem' }}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>

              {/* Item Quantity */}
              <Typography
                variant="h5"
                color="#333"
                textAlign="center"
                sx={{ fontSize: '1.25rem' }}
              >
                Quantity: {quantity}
              </Typography>

              {/* Action Buttons for Managing Items */}
              <Stack direction="row" spacing={1}>
                <Button variant="contained" onClick={() => addItem(name, 1)}>
                  Add
                </Button>
                <Button variant="contained" onClick={() => removeItem(name)}>
                  Remove
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleEditOpen(name, quantity)}
                >
                  Edit Quantity
                </Button>
                <Button
                  variant="contained"
                  sx={{ bgcolor: 'red', '&:hover': { bgcolor: 'darkred' } }}
                  onClick={() => deleteItem(name)}
                >
                  Delete Item
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
