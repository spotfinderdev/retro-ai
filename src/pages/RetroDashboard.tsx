import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Container, Box, TextField, Button, Divider } from "@mui/material";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface RetroSummary {
  loQueGusto: string[];
  loQueAprendio: string[];
  loQueFalto: string[];
}

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

  useEffect(() => {
    fetch("http://localhost:5000/api/retro-data")
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) setRetroSummary(data[0]);
      })
      .catch((error) => console.error("Error al cargar datos:", error));
  }, []);

  const handleAsk = async () => {
    setLoading(true);
    setResponse("");

    try {
      const prompt = `Resumen de la retrospectiva:\n\n${JSON.stringify(retroSummary, null, 2)}\n\nPregunta: ${query}`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }] }),
        }
      );

      const data = await res.json();
      const formattedResponse = data.candidates?.[0]?.content?.parts?.[0]?.text.trim().replace(/\n/g, "\n\n") || "No tengo una respuesta.";

      setResponse(formattedResponse);
      setHistory((prevHistory) => [{ question: query, answer: formattedResponse }, ...prevHistory]); // Último arriba
    } catch (error) {
      setResponse("Error en la consulta.");
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center">Retrospectiva del Equipo</Typography>

      {/* Gráfico de Pastel */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h6">Distribución General</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Positivo", value: retroSummary?.loQueGusto?.length || 0, color: "#4caf50" },
                  { name: "Neutrales", value: retroSummary?.loQueAprendio?.length || 0, color: "#ffeb3b" },
                  { name: "Negativos", value: retroSummary?.loQueFalto?.length || 0, color: "#f44336" },
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

      {/* Buscador con IA */}
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

      {/* Historial de preguntas y respuestas */}
      <Box mt={4}>
        {history.map((entry, index) => (
          <Card key={index} sx={{ mb: 2, p: 3, backgroundColor: "#F5F5F5" }}>
            <CardContent>
              <Typography variant="h6" color="secondary">Pregunta:</Typography>
              <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>{entry.question}</Typography>
              <Divider />
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>Respuesta:</Typography>
              <Typography variant="body1">{entry.answer.split("\n\n").map((paragraph, idx) => (
                <p key={idx} style={{ marginBottom: "10px" }}>{paragraph}</p>
              ))}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
