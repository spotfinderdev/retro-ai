import React, { useEffect, useState } from "react";
import { fetchData, fetchCategories, saveData, addCategory } from "../services/dataService";
import { Card, CardContent, Typography, Container, Box, TextField, Button, IconButton } from "@mui/material";
import { Add, Save } from "@mui/icons-material";

export default function DataManager() {
  const [data, setData] = useState<{ [key: string]: string[] }>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    fetchData()
      .then((result) => {
        setData(result as { [key: string]: string[] }); // 🔹 Aseguramos el tipo correcto
      })
      .catch((error) => console.error("Error al obtener datos:", error));

    fetchCategories()
      .then((categories) => setCategories(categories))
      .catch((error) => console.error("Error al obtener categorías:", error));
  }, []);

  const handleSave = async () => {
    await saveData(data);
    fetchData().then((result) => setData(result as { [key: string]: string[] }));
  };

  const handleAddCategory = async () => {
    if (newCategory.trim() !== "") {
      await addCategory(newCategory);
      setNewCategory("");
      fetchCategories().then(setCategories);
      fetchData().then((result) => setData(result as { [key: string]: string[] }));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Administrador de Datos
      </Typography>

      {categories.map((category) => (
        <Card key={category} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {category}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              value={data[category]?.join("\n") || "No existen datos"}
              onChange={(e) =>
                setData({
                  ...data,
                  [category]: e.target.value.trim() ? e.target.value.split("\n") : ["No existen datos"],
                })
              }
              sx={{ mb: 2 }}
            />
          </CardContent>
        </Card>
      ))}

      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Nueva Categoría"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <IconButton onClick={handleAddCategory} color="primary">
          <Add />
        </IconButton>
      </Box>

      <Button variant="contained" color="primary" onClick={handleSave} startIcon={<Save />}>
        Guardar Cambios
      </Button>
    </Container>
  );
}
