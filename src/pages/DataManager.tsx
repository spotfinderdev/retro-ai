import React, { useEffect, useState } from "react";
import { fetchData, addData, updateData, deleteData, fetchCategories } from "../services/dataService";
import { Card, CardContent, Typography, Container, Box, TextField, Button, List, ListItem, ListItemText, IconButton, MenuItem, Select } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

interface RetroData {
  _id?: string;
  category: string;
  content: string;
}

export default function DataManager() {
  const [data, setData] = useState<RetroData[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newEntry, setNewEntry] = useState({ category: "", content: "" });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetchData().then(setData);
    fetchCategories().then(setCategories);
  }, []);

  const handleSave = async () => {
    if (!categories.includes(newEntry.category) && newEntry.category) {
      setCategories((prev) => [...prev, newEntry.category]); // Agregar nueva categoría si no existe
    }
    if (editId) {
      await updateData(editId, newEntry);
    } else {
      await addData(newEntry);
    }
    setNewEntry({ category: "", content: "" });
    setEditId(null);
    fetchData().then(setData);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center">Administrador de Datos</Typography>

      <Card sx={{ p: 3, mb: 4 }}>
        <CardContent>
          <Typography variant="h6">Agregar / Editar Datos</Typography>
          <Select fullWidth value={newEntry.category} onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })} displayEmpty sx={{ mb: 2 }}>
            <MenuItem value="" disabled>Selecciona una categoría</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </Select>
          <TextField fullWidth label="Nueva Categoría" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onBlur={() => newCategory && setCategories([...categories, newCategory])} />
          <TextField fullWidth label="Contenido" multiline rows={3} value={newEntry.content} onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })} sx={{ mt: 2 }} />
          <Button variant="contained" color="primary" onClick={handleSave}>{editId ? "Actualizar" : "Agregar"}</Button>
        </CardContent>
      </Card>
    </Container>
  );
}
