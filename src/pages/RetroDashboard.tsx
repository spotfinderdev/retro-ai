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
  const [history, setHistory] = useState<QAEntry[]>([]);

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
        const prompt = `Resumen de la retrospectiva en JSON:\n\n${JSON.stringify(summaryJson, null, 2)}\n\nPregunta: ${query}`;
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
        }
      );

      const data = await res.json();
      console.log("🔹 Respuesta del bot:", data);
      const formattedResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text.trim().replace(/\n/g, "\n\n") || "No tengo una respuesta.";

      setResponse(formattedResponse);
      setHistory((prevHistory) => [{ question: query, answer: formattedResponse }, ...prevHistory]);
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
    <Container maxWidth="md" sx={{ py: 4 }}>

     <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            letterSpacing: 2, // 🔹 Espaciado entre letras
            textShadow: "2px 2px 6px rgba(0, 0, 0, 0.3)", // 🔹 Sombra para profundidad
            background: "linear-gradient(90deg, #FF6E4B, #0077C8, #4CAF50)", // 🎨 Degradado en el texto
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ::KyourD:: Dashboard
        </Typography>
      </Box>
      
      {/* 🔹 Gráfico de Pastel Dinámico */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h6">General Distribution</Typography>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
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

      {/* 🔹 Buscador con IA */}
      <Card sx={{ p: 4, backgroundColor: "#E3F2FD" }}>
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
