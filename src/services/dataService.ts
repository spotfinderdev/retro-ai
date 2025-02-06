const API_URL = "http://localhost:5000/api/retro-data";

// 🔹 Transformar nombres de categorías para una mejor visualización
const formatCategoryName = (category: string) => {
  return category
    .replace(/([A-Z])/g, " $1") // Agrega espacios antes de mayúsculas
    .trim() // Elimina espacios innecesarios
    .replace(/^./, (str) => str.toUpperCase()); // Primera letra en mayúscula
};

// 🔹 Obtener todas las categorías (transformadas para UI)
export const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/categories`);
  const categories = await response.json();
  return categories.map(formatCategoryName);
};

export const fetchData = async () => {
  const response = await fetch(API_URL);
  return response.json();
};

export const addData = async (newData: any) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newData),
  });
  return response.json();
};

export const updateData = async (id: string, updatedData: any) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
  return response.json();
};

export const deleteData = async (id: string) => {
  await fetch(`${API_URL}/${id}`, { method: "DELETE" });
};
