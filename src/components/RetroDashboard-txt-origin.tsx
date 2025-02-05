import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Container, Box, TextField, Button } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const dataPie = [
  { name: "Aspectos positivos", value: 60, color: "#4caf50" },
  { name: "Aspectos neutrales", value: 20, color: "#ffeb3b" },
  { name: "Aspectos negativos", value: 20, color: "#f44336" },
];

export default function RetroDashboard() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [retroSummary, setRetroSummary] = useState("");

  // 🔹 Cargar el archivo retroSummary.txt
  useEffect(() => {
    fetch("/data/retroSummary.txt")
      .then((res) => res.text())
      .then((data) => {
        console.log("📥 Archivo cargado:", data);
        setRetroSummary(data);
      })
      .catch((error) => console.error("❌ Error al cargar el archivo:", error));
  }, []);

  const handleAsk = async () => {
    if (!retroSummary) {
      setResponse("❌ Error: No se pudo cargar la retrospectiva.");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const prompt = `Aquí tienes un resumen detallado de la retrospectiva del equipo. Usa esta información para responder de manera clara y concisa:

      ${retroSummary}

      Pregunta: ${query}

      Responde de forma clara, concisa y con formato adecuado.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: prompt }],
              },
            ],
          }),
        }
      );

      const data = await res.json();

      if (data.error) {
        console.error("❌ Error en la API:", data.error);
        setResponse(`❌ Error: ${data.error.message}`);
        return;
      }

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        // 🔹 Formatear la respuesta para que tenga saltos de línea
        setResponse(data.candidates[0].content.parts[0].text.trim().replace(/\n/g, "\n\n"));
      } else {
        setResponse("⚠️ No tengo una respuesta en este momento.");
      }
    } catch (error) {
      console.error("❌ Error en la consulta:", error);
      setResponse("❌ Error al obtener la respuesta. Verifica la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Retrospectiva del Equipo
      </Typography>

      {/* Gráfico de Pastel (Distribución General) */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Distribución General de la Retrospectiva
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dataPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                {dataPie.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Buscador con IA de Gemini */}
      <Card sx={{ p: 4, backgroundColor: "#E3F2FD" }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" align="center" color="primary" gutterBottom>
            Consultas en Tiempo Real
          </Typography>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <TextField
              fullWidth
              variant="outlined"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe tu pregunta..."
              sx={{
                backgroundColor: "white",
                borderRadius: "8px",
                width: "80%",
                textAlign: "center",
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAsk}
              disabled={loading}
              sx={{ width: "50%" }}
            >
              {loading ? "Cargando..." : "Preguntar"}
            </Button>
          </Box>
          {response && (
            <Box mt={3} p={2} bgcolor="#BBDEFB" borderRadius="8px">
              <Typography variant="body1" align="left" color="primary">
                {response.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
