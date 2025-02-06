import React, { useEffect, useState } from "react";
import { fetchData, saveData, addCategory } from "../services/dataService";
import { 
  Card, CardContent, Typography, Container, Box, TextField, Button, IconButton, List, ListItem, ListItemText, Checkbox 
} from "@mui/material";
import { Add, Save, Delete } from "@mui/icons-material";

// 🔹 Función para formatear nombres de categorías para la UI
const formatCategoryName = (category: string) => {
  return category.replace(/([A-Z])/g, " $1").trim().replace(/^./, (str) => str.toUpperCase());
};

// 🔹 Función para revertir el formato de nombres de categorías antes de almacenarlas en la BD
const revertCategoryName = (category: string) => {
  return category.replace(/\s+/g, "");
};

export default function DataManager() {
  const [data, setData] = useState<{ [key: string]: string[] }>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newEntries, setNewEntries] = useState<{ [key: string]: string }>({});
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: Set<string> }>({});

  // 🔹 Cargar datos y categorías al iniciar
  useEffect(() => {
    fetchData()
      .then((result) => {
        console.log("📥 Datos cargados desde API:", result);

        const cleanData = Object.fromEntries(
          Object.entries(result)
            .filter(([key, value]) => key !== "_id" && !(Array.isArray(value) && value.length === 1 && value[0] === "No existen datos"))
            .map(([key, value]) => [formatCategoryName(key), Array.isArray(value) ? value : []]) // Formatear nombre
        );

        setData(cleanData);
        setCategories(Object.keys(cleanData));
      })
      .catch((error) => console.error("❌ Error al obtener datos:", error));
  }, []);

  // 🔹 Guardar cambios en la BD
  const handleSave = async () => {
    const formattedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [revertCategoryName(key), value])
    );

    await saveData(formattedData);
    fetchData().then((result) => {
      const updatedData = Object.fromEntries(
        Object.entries(result)
          .filter(([key, value]) => key !== "_id" && !(Array.isArray(value) && value.length === 1 && value[0] === "No existen datos"))
          .map(([key, value]) => [formatCategoryName(key), Array.isArray(value) ? value : []])
      );

      setData(updatedData);
      setCategories(Object.keys(updatedData));
    });
  };

  // 🔹 Agregar una nueva categoría
  const handleAddCategory = async () => {
    if (newCategory.trim() !== "") {
      const formattedName = revertCategoryName(newCategory);
      
      await addCategory(formattedName); // Agregar la nueva categoría en la BD

      setData((prevData) => ({
        ...prevData,
        [formatCategoryName(formattedName)]: [], // Mostrar inmediatamente en UI con formato correcto
      }));

      setCategories((prevCategories) => [...prevCategories, formatCategoryName(formattedName)]);
      setNewCategory("");
    }
  };

  // 🔹 Agregar un nuevo ítem a una categoría
  const handleAddItem = (category: string) => {
    if (newEntries[category]?.trim()) {
      setData((prevData) => ({
        ...prevData,
        [category]: [...(prevData[category] || []), newEntries[category].trim()],
      }));
      setNewEntries((prevEntries) => ({ ...prevEntries, [category]: "" })); // Limpiar input
    }
  };

  // 🔹 Manejo de selección para eliminar elementos
  const handleToggleSelect = (category: string, item: string) => {
    setSelectedItems((prev) => {
      const updatedSet = new Set(prev[category] || []);
      updatedSet.has(item) ? updatedSet.delete(item) : updatedSet.add(item);
      return { ...prev, [category]: updatedSet };
    });
  };

  // 🔹 Eliminar elementos seleccionados de una categoría
  const handleDeleteSelected = (category: string) => {
    setData((prevData) => ({
      ...prevData,
      [category]: prevData[category].filter((item) => !(selectedItems[category]?.has(item))),
    }));
    setSelectedItems((prev) => ({ ...prev, [category]: new Set() })); // Limpiar selección
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

            {/* 🔹 Lista de elementos con checkboxes */}
            <List sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid #ddd", borderRadius: 2, padding: 1 }}>
              {data[category] && data[category].length > 0 ? (
                data[category].map((item, index) => (
                  <ListItem key={index} dense>
                    <Checkbox
                      checked={selectedItems[category]?.has(item) || false}
                      onChange={() => handleToggleSelect(category, item)}
                    />
                    <ListItemText primary={item} />
                  </ListItem>
                ))
              ) : (
                <Typography color="textSecondary" align="center">
                  No hay datos en esta categoría.
                </Typography>
              )}
            </List>

            {/* 🔹 Botón para eliminar elementos seleccionados */}
            <Button
              variant="contained"
              color="error"
              startIcon={<Delete />}
              onClick={() => handleDeleteSelected(category)}
              sx={{ mt: 1, mb: 2 }}
              disabled={!selectedItems[category] || selectedItems[category].size === 0}
            >
              Eliminar seleccionados
            </Button>

            {/* 🔹 Input para agregar nuevos elementos */}
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                fullWidth
                placeholder="Agregar nuevo ítem"
                value={newEntries[category] || ""}
                onChange={(e) => setNewEntries({ ...newEntries, [category]: e.target.value })}
              />
              <IconButton onClick={() => handleAddItem(category)} color="primary">
                <Add />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* 🔹 Agregar nueva categoría */}
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

      {/* 🔹 Guardar cambios en BD */}
      <Button variant="contained" color="primary" onClick={handleSave} startIcon={<Save />}>
        Guardar Cambios
      </Button>
    </Container>
  );
}
