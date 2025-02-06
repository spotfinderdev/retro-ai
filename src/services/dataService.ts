const API_URL = "http://localhost:5000/api/retro-data";

// 🔹 Transformar nombres de categorías para una mejor visualización en UI
export const formatCategoryName = (category: string) => {
  return category
    .replace(/([A-Z])/g, " $1") // Agrega espacios antes de mayúsculas
    .trim() // Elimina espacios innecesarios
    .replace(/^./, (str) => str.toUpperCase()); // Primera letra en mayúscula
};

// 🔹 Obtener datos correctamente, asegurando que tomamos el primer elemento si es un array
export const fetchData = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0]; // ✅ Si es un array, tomamos el primer objeto
    }
    return data;
  };

// 🔹 Guardar datos en la BD sin modificar estructura
export const saveData = async (updatedData: any) => {
    const response = await fetch(`${API_URL}/retroSummary_001`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    return response.json();
  };

// 🔹 Obtener todas las categorías con nombres formateados SOLO PARA UI
export const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/categories`);
  const categories = await response.json();
  return categories.map(formatCategoryName);
};

// 🔹 Agregar una nueva categoría vacía
export const addCategory = async (categoryName: string) => {
  const newCategoryKey = categoryName.replace(/\s+/g, ""); // Eliminar espacios para guardar
  const newCategory = { [newCategoryKey]: ["No existen datos"] };
  return saveData(newCategory);
};
