import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Container, Box, TextField, Button, Divider } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { fetchData, fetchDataJson } from "../services/dataService";

interface RetroSummary {
  [key: string]: string[];
}

interface SummaryJson {
    [key: string]: { [attribute: string]: string }[];
  }
  

interface QAEntry {
  question: string;
  answer: string;
}

export default function RetroDashboard() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [retroSummary, setRetroSummary] = useState<RetroSummary>({});
  const [summaryJson, setSummaryJson] = useState<SummaryJson>({});
  const [history, setHistory] = useState<QAEntry[]>(() => {
    // 🔹 Recupera historial desde localStorage si existe
    const savedHistory = localStorage.getItem("retro_ai_history");
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  
  const [chartDataDinamic, setChartDataDinamic] = useState<{ name: string; value: number }[]>(() => {
    const savedChartData = localStorage.getItem("retro_ai_chart_data");
    return savedChartData ? JSON.parse(savedChartData) : [];
  });
  
  const [chartTitle, setChartTitle] = useState<string>(() => {
    return localStorage.getItem("retro_ai_chart_title") || "";
  });
  
  

  useEffect(() => {
    fetchData()
      .then((data) => {
        console.log("📥 Datos recibidos del backend:", data);
        if (data && typeof data === "object") {
          // 🔹 Excluir `_id` y categorías con solo "No existen datos"
          const filteredData: RetroSummary = Object.entries(data)
            .filter(([key, value]) => 
              key !== "_id" && 
              Array.isArray(value) && 
              !(value.length === 1 && value[0] === "No existen datos")
            )
            .reduce((acc, [key, value]) => {
              acc[key] = value as string[]; // ✅ Ahora TypeScript sabe que value es string[]
              return acc;
            }, {} as RetroSummary);

          setRetroSummary(filteredData);
        }
      })
      .catch((error) => console.error("❌ Error al cargar datos:", error));
  }, []);

  useEffect(() => {
    fetchDataJson()
      .then((data) => {
        console.log("📥 Datos JSON recibidos para el chatbot:", data);
        if (data && typeof data === "object") {
          setSummaryJson(data); // ✅ Almacena el JSON formateado para el chatbot
        }
      })
      .catch((error) => console.error("❌ Error al cargar datos JSON para el chatbot:", error));
  }, []);


  
  const handleAsk = async () => {
    setLoading(true);
    setResponse("");

    try {   
       const prompt = `
       Resumen de la retrospectiva en JSON:\n\n${JSON.stringify(summaryJson, null, 2)}
       
       Pregunta: ${query}
       
       ⚠️ IMPORTANTE: Si la pregunta requiere una respuesta numérica o estadística, responde SOLO con JSON limpio en este formato:
       
       {
         "type": "chart",
         "title": "Título del gráfico",
         "data": [
           { "name": "Categoría 1", "value": 100 },
           { "name": "Categoría 2", "value": 200 },
           { "name": "Categoría 3", "value": 150 }
         ]
       }
       
       Si la pregunta requiere un valor numérico, responde SOLO con este JSON:
       {
         "type": "value",
         "value": 50
       }
       
       Si la pregunta no requiere datos numéricos ni gráficos, responde solo con texto normal sin envolver en JSON.
       `;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
        }
      );

      const data = await res.json();
      console.log("🔹 Respuesta del bot (sin procesar):", data);
      
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text.trim();
      let formattedResponse = responseText || "No tengo una respuesta.";
      
      try {
        // 🔹 Limpiar caracteres adicionales y parsear JSON
        const jsonStart = responseText.indexOf("{");
        const jsonEnd = responseText.lastIndexOf("}") + 1;
        const cleanJson = responseText.substring(jsonStart, jsonEnd);
      
        const parsedJson = JSON.parse(cleanJson);
        console.log("🔹 JSON procesado:", parsedJson);
      
        if (parsedJson.type === "chart" && Array.isArray(parsedJson.data)) {
          setChartDataDinamic(parsedJson.data);
          setChartTitle(parsedJson.title);
          localStorage.setItem("retro_ai_chart_data", JSON.stringify(parsedJson.data));
          localStorage.setItem("retro_ai_chart_title", parsedJson.title);
          formattedResponse = `📊 Se generó un gráfico: ${parsedJson.title}`;
        } else if (parsedJson.type === "value") {
          formattedResponse = `🔢 Resultado: ${parsedJson.value}`;
        }
      } catch (error) {
        console.log("🔹 No es JSON, mostrando como texto.");
      }

      // 🔹 Actualiza historial y almacena en localStorage
      const updatedHistory = [{ question: query, answer: formattedResponse }, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("retro_ai_history", JSON.stringify(updatedHistory));

      setResponse(formattedResponse);

    } catch (error) {
      console.error("❌ Error en la consulta:", error);
      setResponse("Error en la consulta.");
    } finally {
      setLoading(false);
      setQuery("");
    }
};

  
  // 🔹 Generar datos dinámicos para el gráfico excluyendo categorías vacías
  const chartData = Object.entries(retroSummary)
    .filter(([_, items]) => items.length > 0)
    .map(([category, items]) => ({
      name: category,
      value: items.length,
    }));

  const colors = ["#4caf50", "#ffeb3b", "#f44336", "#2196F3", "#9C27B0", "#FF9800"];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}> {/* Aumentamos el tamaño del container */}
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
          ::KyourD:: Dashboard
        </Typography>
      </Box>
  
      {/* 🔹 Sección de gráficos en dos columnas */}
      <Box display="flex" flexWrap="wrap" justifyContent="center" gap={4}>
  
        {/* 🔹 Gráfico de Distribución General */}
        <Card sx={{ flex: "1 1 48%", p: 3, minWidth: "350px" }}>
          <CardContent>
            <Typography variant="h6">General Distribution</Typography>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={140}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography align="center" color="textSecondary">
                No hay datos para mostrar.
              </Typography>
            )}
          </CardContent>
        </Card>
  
        {/* 🔹 Gráfico Dinámico generado por AI */}
        {chartDataDinamic.length > 0 && chartTitle && (
          <Card sx={{ flex: "1 1 48%", p: 3, minWidth: "350px" }}>
            <CardContent>
              <Typography variant="h6">{chartTitle}</Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie data={chartDataDinamic} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={140}>
                    {chartDataDinamic.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
  
</Box>

      {/* 🔹 Buscador con IA */}
      <Card sx={{ p: 4, backgroundColor: "#E3F2FD", mt: 4 }}>
        <CardContent>
          <Typography variant="h6" align="center" color="primary">Consultas</Typography>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <TextField fullWidth variant="outlined" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Escribe tu pregunta..." />
            <Button variant="contained" color="primary" onClick={handleAsk} disabled={loading}>
              {loading ? "Cargando..." : "Preguntar"}
            </Button>
          </Box>
        </CardContent>
      </Card>
  
      {/* 🔹 Historial de preguntas y respuestas */}
      <Box mt={4}>
        {history.map((entry, index) => (
          <Card key={index} sx={{ mb: 2, p: 3, backgroundColor: "#F5F5F5" }}>
            <CardContent>
              <Typography variant="h6" color="secondary">Pregunta:</Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>{entry.question}</Typography>
              <Divider />
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>Respuesta:</Typography>
              {entry.answer.split("\n\n").map((paragraph, idx) => (
                <Typography key={idx} variant="body2" component="span" sx={{ display: "block", marginBottom: "10px" }}>
                  {paragraph}
                </Typography>
              ))}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
              }  