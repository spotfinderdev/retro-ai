// src/services/csvService.ts
export const parseCsv = async (file: File): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text.split("\n").map((row) => row.trim()).filter((row) => row.length > 0);
  
        if (rows.length < 2) {
          reject("El archivo CSV no tiene datos suficientes.");
          return;
        }
  
        const newEntries = rows.slice(1).map((row) => row.split(",").map((val) => val.trim()).join(" | "));
        resolve(newEntries);
      };
  
      reader.onerror = () => reject("Error al leer el archivo CSV.");
      reader.readAsText(file);
    });
  };
  