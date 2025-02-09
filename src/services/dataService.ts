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

export async function fetchDataJson() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }
  
      const result = await response.json();
  
      // 🔹 Transformar el objeto en el formato JSON correcto
      const formattedData: { [key: string]: any[] } = {};
  
      Object.entries(result).forEach(([category, values]) => {
        if (Array.isArray(values) && values.length > 0 && typeof values[0] === "object") {
          formattedData[category] = values; // ✅ Mantiene los objetos con sus atributos
        } else {
          console.error(`⚠️ Advertencia: "${category}" no contiene datos válidos.`, values);
          formattedData[category] = [];
        }
      });
  
      console.log("📂 Datos formateados para el frontend:", formattedData);
      return formattedData;
    } catch (error) {
      console.error("❌ Error al obtener datos:", error);
      return {};
    }
  }

  
// 🔹 Obtener datos y combinarlos correctamente
export async function fetchData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();

    // 🔹 Transformar el objeto en el formato que espera el frontend
    const formattedData: { [key: string]: string[] } = {};

    Object.entries(result).forEach(([category, values]) => {
      if (Array.isArray(values)) {
        formattedData[category] = values.map(row =>
          typeof row === "object" ? Object.values(row).join(" | ") : String(row)
        );
      } else {
        console.error(`⚠️ Advertencia: "${category}" no es un array.`, values);
        formattedData[category] = [];
      }
    });

    console.log("📂 Datos transformados para el frontend:", formattedData);
    return formattedData;
  } catch (error) {
    console.error("❌ Error al obtener datos:", error);
    return {};
  }
}

// 🔹 Guardar TODOS los datos en la BD (reemplaza los valores existentes de cada categoría)
export const saveData = async (updatedData: { [key: string]: any[] }) => {
  try {
    const promises = Object.entries(updatedData).map(async ([category, values]) => {
      const formattedCategory = revertCategoryName(category);
      const payload = { values };

      console.log(`🔹 Guardando datos en la categoría "${formattedCategory}":`, payload);

      const response = await fetch(`${API_URL}/${formattedCategory}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
      }

      return response.json();
    });

    return Promise.all(promises);
  } catch (error) {
    console.error("❌ Error al guardar datos:", error);
    throw error;
  }
};

// 🔹 Guardar SOLO UNA categoría sin afectar otras
export const saveCategory = async (categoryName: string, items: any[]) => {
  const formattedCategory = revertCategoryName(categoryName);
  const payload = { values: items };

  console.log("🔹 Enviando datos a la API:", { category: formattedCategory, payload });

  const response = await fetch(`${API_URL}/${formattedCategory}`, {
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

// 🔹 Agregar una nueva categoría vacía
export const addCategory = async (categoryName: string) => {
  const formattedCategory = revertCategoryName(categoryName);
  const newCategory = { values: [] };

  try {
    const response = await fetch(`${API_URL}/${formattedCategory}`, {
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

// 🔹 Subir un archivo CSV
export async function uploadCsvData(formData: FormData) {
  try {
    const response = await fetch(`${API_URL}/upload-csv`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error al subir el archivo CSV: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Error al subir el archivo CSV:", error);
    throw error;
  }
}
