const API_URL = "http://localhost:5000/api/retro-data";

// 🔹 Obtener todas las categorías con nombres formateados SOLO PARA UI
export const fetchCategories = async () => {
  const response = await fetch(`${API_URL}/categories`);
  const categories = await response.json();
  return categories.map(formatCategoryName);
};


// 🔹 Formatear nombres de categorías para la UI
export const formatCategoryName = (category: string) => {
  return category
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (str) => str.toUpperCase());
};

// 🔹 Revertir nombres de categorías antes de almacenarlas en la BD
export const revertCategoryName = (category: string) => {
  return category.replace(/\s+/g, "");
};

// 🔹 Obtener datos y combinarlos correctamente
export const fetchData = async (): Promise<{ [key: string]: string[] }> => {
  const response = await fetch(API_URL);
  const data = await response.json();

  if (!Array.isArray(data)) {
    console.error("❌ Error: la respuesta no es un array:", data);
    return {};
  }

  // 🔹 Unificar múltiples documentos en una sola estructura
  return data.reduce((acc, curr) => {
    Object.entries(curr).forEach(([key, value]) => {
      if (key !== "_id" && Array.isArray(value)) {
        acc[key] = acc[key] ? [...acc[key], ...value] : [...value];
      }
    });
    return acc;
  }, {} as { [key: string]: string[] });
};

// 🔹 Guardar todos los datos en la BD (REEMPLAZA el documento)
export const saveData = async (updatedData: any) => {
  const response = await fetch(`${API_URL}/retroSummary_001`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedData),
  });
  return response.json();
};

// 🔹 Agregar una nueva categoría sin borrar las existentes
export const addCategory = async (categoryName: string) => {
    const newCategoryKey = categoryName.replace(/\s+/g, ""); 
    const newCategory = { [newCategoryKey]: ["No existen datos"] };
  
    try {
      const response = await fetch(`${API_URL}/retroSummary_001`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });
  
      const data = await response.json();
      console.log("📥 Respuesta de la API al agregar categoría:", data);
      return data;
    } catch (error) {
      console.error("❌ Error al agregar categoría:", error);
      throw error;
    }
  };
  

// 🔹 Guardar SOLO UNA categoría sin afectar otras
export const saveCategory = async (categoryName: string, items: string[]) => {
    const formattedCategory = categoryName.replace(/\s+/g, "");
    const payload = { [formattedCategory]: items };

    console.log("🔹 Enviando datos a la API:", payload);

    const response = await fetch(`${API_URL}/retroSummary_001`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("❌ Error en la solicitud:", response.status, response.statusText);
      throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
    }

    return response.json();
};