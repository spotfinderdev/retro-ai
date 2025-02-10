import React, { useEffect, useState } from "react";
import { fetchData, saveCategory, addCategory, saveData } from "../services/dataService";
import { 
  Card, CardContent, Typography, Container, Box, TextField, Button, IconButton, List, ListItem, ListItemText, Checkbox 
} from "@mui/material";
import { Add, Save, Delete, UploadFile } from "@mui/icons-material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { uploadCsvData } from "../services/dataService";

const formatCategoryName = (category: string) => {
  return category.replace(/([A-Z])/g, " $1").trim().replace(/^./, (str) => str.toUpperCase());
};

const revertCategoryName = (category: string) => {
  return category.replace(/\s+/g, "");
};

export default function DataManager() {
  const [data, setData] = useState<{ [key: string]: string[] }>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newEntries, setNewEntries] = useState<{ [key: string]: string }>({});
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: Set<string> }>({});
  const [csvFiles, setCsvFiles] = useState<{ [key: string]: File | null }>({});

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [csvPreview, setCsvPreview] = useState<string[]>([]);


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

  const handleSave = async () => {
    const formattedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [revertCategoryName(key), value])
    );

    await saveData(formattedData);

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

  const handleAddCategory = async () => {
    if (newCategory.trim() !== "") {
      const formattedName = revertCategoryName(newCategory);
      await addCategory(formattedName);

      setData((prevData) => ({
        ...prevData,
        [formatCategoryName(formattedName)]: [],
      }));

      setCategories((prevCategories) => [...prevCategories, formatCategoryName(formattedName)]);
      setNewCategory("");
    }
  };

  const handleAddItem = async (category: string) => {
    if (newEntries[category]?.trim()) {
      const newItem = newEntries[category].trim();
      const updatedCategoryItems = [...(data[category] || []), newItem];

      setData((prevData) => ({
        ...prevData,
        [category]: updatedCategoryItems,
      }));

      setNewEntries((prevEntries) => ({ ...prevEntries, [category]: "" }));

      await saveCategory(revertCategoryName(category), updatedCategoryItems);
    }
  };

  const handleToggleSelect = (category: string, item: string) => {
    setSelectedItems((prev) => {
      const updatedSet = new Set(prev[category] || []);
      updatedSet.has(item) ? updatedSet.delete(item) : updatedSet.add(item);
      return { ...prev, [category]: updatedSet };
    });
  };

  const handleDeleteSelected = async (category: string) => {
    const updatedItems = data[category].filter((item) => !(selectedItems[category]?.has(item)));

    setData((prevData) => ({
        ...prevData,
        [category]: updatedItems,
      }));

    setSelectedItems((prev) => ({ ...prev, [category]: new Set() }));

    await saveCategory(revertCategoryName(category), updatedItems);
  };

  const handleCsvUpload = async (categoryName: string) => {
    if (!csvFiles[categoryName]) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split("\n").map((row) => row.trim()).filter((row) => row.length > 0);

      if (rows.length < 2) {
        alert("El archivo CSV no tiene datos suficientes.");
        return;
      }

      const newEntries = rows.slice(1).map((row) => row.split(",").map((val) => val.trim()).join(" | "));

      setData((prevData) => ({
        ...prevData,
        [categoryName]: [...(prevData[categoryName] || []), ...newEntries],
      }));

      await saveCategory(revertCategoryName(categoryName), [...(data[categoryName] || []), ...newEntries]);

      setCsvFiles((prev) => ({ ...prev, [categoryName]: null }));
    };

    reader.readAsText(csvFiles[categoryName]!);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    console.log("📂 handleFileSelect llamado para la categoría:", category);
  
    const file = event.target.files?.[0];
    if (file) {
      console.log(`📂 Archivo seleccionado para ${category}:`, file.name);
  
      setCsvFiles((prev) => ({ ...prev, [category]: file }));
      setSelectedCategory(category);
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvPreview(text.split("\n").slice(0, 5));
        console.log("📄 Vista previa del CSV:", text.split("\n").slice(0, 5));
        console.log("🟢 Abriendo el modal...");
        setOpenModal(true);
      };
      reader.readAsText(file);
    } else {
      console.log("⚠️ No se seleccionó ningún archivo.");
    }
  };
  
  
  
  
  const handleConfirmCsvUpload = async () => {
    if (!selectedCategory || !csvFiles[selectedCategory]) {
      console.error("⚠️ No hay categoría o archivo seleccionado");
      return;
    }
  
    console.log(`⬆️ Subiendo archivo CSV: ${csvFiles[selectedCategory]?.name} para la categoría ${selectedCategory}`);
  
    const formData = new FormData();
    formData.append("file", csvFiles[selectedCategory]!);
    formData.append("category", revertCategoryName(selectedCategory));
  
    try {
      const response = await uploadCsvData(formData);
      console.log("✅ Respuesta del servidor:", response);
    } catch (error) {
      console.error("❌ Error al subir el archivo CSV:", error);
    }
  
    setOpenModal(false);
    fetchData().then(setData);
  };
  
  
  

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            letterSpacing: 2,
            textShadow: "2px 2px 6px rgba(0, 0, 0, 0.3)",
            background: "linear-gradient(90deg, #FF6E4B, #0077C8, #4CAF50)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          DataManager
        </Typography>
      </Box>

      {categories.map((category) => (
        <Card key={category} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {category}
            </Typography>

            <List sx={{ maxHeight: 200, overflowY: "auto", border: "1px solid #ddd", borderRadius: 2, padding: 1 }}>
              {data[category] && data[category].length > 0 ? (
                data[category].map((item, index) => (
                  <ListItem key={index} dense>
                    <Checkbox checked={selectedItems[category]?.has(item) || false} onChange={() => handleToggleSelect(category, item)} />
                    <ListItemText primary={item} />
                  </ListItem>
                ))
              ) : (
                <Typography color="textSecondary" align="center">
                  No hay datos en esta categoría.
                </Typography>
              )}
            </List>

            <Box display="flex" alignItems="center" gap={1} mt={1}>
              <TextField fullWidth placeholder="Agregar nuevo ítem" value={newEntries[category] || ""} onChange={(e) => setNewEntries({ ...newEntries, [category]: e.target.value })} />
              <IconButton onClick={() => handleAddItem(category)} color="primary">
                <Add />
              </IconButton>
            </Box>

            <Box display="flex" gap={2} mt={2}>
              <Button variant="contained" color="error" startIcon={<Delete />} onClick={() => handleDeleteSelected(category)} disabled={!selectedItems[category] || selectedItems[category].size === 0}>
                Eliminar seleccionados
              </Button>

              <Button component="label" variant="contained" startIcon={<UploadFile />} sx={{ background: "#0077C8", color: "#fff", "&:hover": { background: "#005999" }}}>
  Cargar CSV
  <input 
    type="file" 
    accept=".csv" 
    hidden 
    onChange={(e) => {
      console.log("📂 Archivo seleccionado en input");
      handleFileSelect(e, category);
    }} 
  />
</Button>


            </Box>
          </CardContent>
        </Card>
      ))}

      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
        <TextField fullWidth label="Nueva Categoría" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
        <IconButton onClick={handleAddCategory} color="primary">
          <Add />
        </IconButton>
      </Box>

      <Button variant="contained" color="primary" onClick={handleSave} startIcon={<Save />}>
        Guardar Cambios
      </Button>
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
  <DialogTitle>Confirmar carga de CSV</DialogTitle>
  <DialogContent>
    <Typography>Archivo: {selectedCategory ? csvFiles[selectedCategory]?.name : "Ningún archivo seleccionado"}</Typography>
    <List>
      {csvPreview.length > 0 ? (
        csvPreview.map((line, i) => <ListItem key={i}><ListItemText primary={line} /></ListItem>)
      ) : (
        <Typography color="textSecondary">No hay vista previa disponible.</Typography>
      )}
    </List>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => {
      console.log("🚫 Cancelar presionado");
      setOpenModal(false);
    }}>
      Cancelar
    </Button>
    <Button 
      onClick={() => {
        console.log("✅ Confirmar carga de CSV ejecutado");
        handleConfirmCsvUpload();
      }} 
      color="primary" 
      variant="contained"
    >
      Confirmar
    </Button>
  </DialogActions>
</Dialog>

    </Container>
  );
}
