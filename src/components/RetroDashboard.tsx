import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Container, Box, TextField, Button, Divider } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Definir el tipo de la estructura del JSON
interface RetroSummary {
  loQueGusto: string[];
  loQueAprendio: string[];
  loQueFalto: string[];
  mejorasPropuestas: string[];
  mantener: string[];
}

// Definir el tipo para el historial de preguntas y respuestas
interface QAEntry {
  question: string;
  answer: string;
}

export default function RetroDashboard() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [retroSummary, setRetroSummary] = useState<RetroSummary | null>(null);
  const [history, setHistory] = useState<QAEntry[]>([]); // Historial de preguntas y respuestas

  // 🔹 Cargar el archivo JSON con los datos de la retrospectiva
  useEffect(() => {
    fetch("/data/retroSummary.json")
      .then((res) => res.json())
      .then((data: RetroSummary) => {
        console.log("📥 Archivo JSON cargado:", data);
        setRetroSummary(data);
      })
      .catch((error) => console.error("❌ Error al cargar el archivo JSON:", error));
  }, []);

  const handleAsk = async () => {
    if (!retroSummary) {
      setResponse("❌ Error: No se pudo cargar la retrospectiva.");
      return;
    }

    setLoading(true);
    setResponse("");

    try {
      const prompt = `Aquí tienes un resumen detallado de la retrospectiva del equipo en formato JSON. Usa esta información para responder preguntas de manera clara y concisa:

      ${JSON.stringify(retroSummary, null, 2)}

      Pregunta: ${query}

      Responde en lista numerada, con un formato claro y organizado.`;

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
        const formattedResponse = data.candidates[0].content.parts[0].text
          .trim()
          .replace(/\n/g, "\n\n"); // Espacios entre párrafos

        setResponse(formattedResponse);
        setHistory((prevHistory) => [{ question: query, answer: formattedResponse }, ...prevHistory]); // Último arriba
      } else {
        setResponse("⚠️ No tengo una respuesta en este momento.");
      }
    } catch (error) {
      console.error("❌ Error en la consulta:", error);
      setResponse("❌ Error al obtener la respuesta. Verifica la consola.");
    } finally {
      setLoading(false);
      setQuery(""); // Limpiar el input después de preguntar
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
              <Pie
                data={[
                  { name: "Aspectos positivos", value: retroSummary?.loQueGusto?.length || 0, color: "#4caf50" },
                  { name: "Aspectos neutrales", value: retroSummary?.loQueAprendio?.length || 0, color: "#ffeb3b" },
                  { name: "Aspectos negativos", value: retroSummary?.loQueFalto?.length || 0, color: "#f44336" },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                <Cell fill="#4caf50" />
                <Cell fill="#ffeb3b" />
                <Cell fill="#f44336" />
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
        </CardContent>
      </Card>

      {/* Historial de preguntas y respuestas en orden de pila (última arriba) */}
      <Box mt={4}>
        {history.map((entry, index) => (
          <Card key={index} sx={{ mb: 2, p: 3, backgroundColor: "#F5F5F5" }}>
            <CardContent>
              <Typography variant="h6" color="secondary">
                Pregunta:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
                {entry.question}
              </Typography>
              <Divider />
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                Respuesta:
              </Typography>
              <Typography variant="body1">
                {entry.answer.split("\n\n").map((paragraph, index) => (
                  <p key={index} style={{ marginBottom: "10px" }}>
                    {paragraph}
                  </p>
                ))}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
