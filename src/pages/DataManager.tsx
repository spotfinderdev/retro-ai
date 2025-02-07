import React, { useEffect, useState } from "react";
import { fetchData, saveCategory, addCategory, saveData } from "../services/dataService";
import { 
  Card, CardContent, Typography, Container, Box, TextField, Button, IconButton, List, ListItem, ListItemText, Checkbox 
} from "@mui/material";
import { Add, Save, Delete } from "@mui/icons-material";

// 🔹 Formatear nombres de categorías para la UI
const formatCategoryName = (category: string) => {
  return category.replace(/([A-Z])/g, " $1").trim().replace(/^./, (str) => str.toUpperCase());
};

// 🔹 Revertir el formato antes de almacenar en la BD
const revertCategoryName = (category: string) => {
  return category.replace(/\s+/g, "");
};

export default function DataManager() {
  const [data, setData] = useState<{ [key: string]: string[] }>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newEntries, setNewEntries] = useState<{ [key: string]: string }>({});
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: Set<string> }>({});

  // 🔹 Cargar datos al iniciar
  useEffect(() => {
    fetchData()
      .then((result) => {
        console.log("📥 Datos cargados desde API:", result);

        const cleanData: { [key: string]: string[] } = Object.fromEntries(
          Object.entries(result)
            .filter(([key, value]) => key !== "_id" && Array.isArray(value))
            .map(([key, value]) => [formatCategoryName(key), value as string[]])
        );

        setData(cleanData);
        setCategories(Object.keys(cleanData));
      })
      .catch((error) => console.error("❌ Error al obtener datos:", error));
  }, []);

  // 🔹 Guardar TODOS los cambios en la BD manualmente
  const handleSave = async () => {
    const formattedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [revertCategoryName(key), value])
    );

    await saveData(formattedData);

    // 🔄 Recargar datos después de guardar
    fetchData().then((result) => {
      const updatedData: { [key: string]: string[] } = Object.fromEntries(
        Object.entries(result)
          .filter(([key, value]) => key !== "_id" && Array.isArray(value))
          .map(([key, value]) => [formatCategoryName(key), value as string[]])
      );

      setData(updatedData);
      setCategories(Object.keys(updatedData));
    });
  };

  // 🔹 Agregar una nueva categoría y guardarla en la BD
  const handleAddCategory = async () => {
    if (newCategory.trim() !== "") {
      const formattedName = revertCategoryName(newCategory);

      await addCategory(formattedName); // Guardar en BD

      setData((prevData) => ({
        ...prevData,
        [formatCategoryName(formattedName)]: [],
      }));

      setCategories((prevCategories) => [...prevCategories, formatCategoryName(formattedName)]);
      setNewCategory("");
    }
  };

  // 🔹 Agregar un nuevo ítem a una categoría y guardarlo en la BD
  const handleAddItem = async (category: string) => {
    if (newEntries[category]?.trim()) {
      const newItem = newEntries[category].trim();
      const updatedCategoryItems = [...(data[category] || []), newItem];

      setData((prevData) => ({
        ...prevData,
        [category]: updatedCategoryItems,
      }));

      setNewEntries((prevEntries) => ({ ...prevEntries, [category]: "" })); // Limpiar input

      // 🔹 Guardar el nuevo ítem en la BD inmediatamente
      await saveCategory(revertCategoryName(category), updatedCategoryItems);
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

  // 🔹 Eliminar elementos seleccionados de una categoría y actualizar en la BD
  const handleDeleteSelected = async (category: string) => {
    const updatedItems = data[category].filter((item) => !(selectedItems[category]?.has(item)));

    setData((prevData) => ({
      ...prevData,
      [category]: updatedItems,
    }));

    setSelectedItems((prev) => ({ ...prev, [category]: new Set() })); // Limpiar selección

    // 🔹 Guardar cambios en la BD solo para esta categoría
    await saveCategory(revertCategoryName(category), updatedItems);
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

      {/* 🔹 Guardar todos los cambios en la BD */}
      <Button variant="contained" color="primary" onClick={handleSave} startIcon={<Save />}>
        Guardar Cambios
      </Button>
    </Container>
  );
}
