import React, { useState } from "react";
import { Card, CardContent, Typography, Container, Box, TextField, Button } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const retroSummary = `
  **Resumen de la retrospectiva del equipo:**

  **Lo que gustó al equipo:**
  - El equipo siempre está dispuesto a ayudar.
  - Aumento en la generación de documentación.
  - Los servidores de pruebas son más estables.
  - Se han implementado nuevos procedimientos y documentos.
  - Mayor compromiso y sinergia en el equipo.

  **Lo que el equipo aprendió:**
  - Aceptar que las prioridades cambian y no es algo personal.
  - La importancia de documentar bien cada sistema (README, release notes).
  - El uso de nuevas plataformas para pruebas y despliegues.
  - Revisión frecuente de los DoD (Definitions of Done) para no omitir temas clave.

  **Lo que faltó:**
  - Mejor documentación en Jira.
  - Organización en la reunión de demostración.
  - Claridad en la definición de tickets y alcance de tareas.
  - Mayor comunicación sobre cambios de prioridades.

  **Mejoras propuestas:**
  - Estabilidad del ambiente de pruebas.
  - Definición de objetivos con anticipación.
  - Evitar cambios de alcance en la marcha.
  - Mejorar reuniones de planificación.

  **Qué se debería mantener:**
  - Buen trabajo en equipo.
  - Compromiso y profesionalismo.
  - Pruebas al código.
  - Confiabilidad y colaboración dentro del equipo.
`;

const dataBar = [
  { name: "Lo que gustó", value: 20, color: "#4caf50" },
  { name: "Lo que aprendió", value: 15, color: "#2196f3" },
  { name: "Lo que faltó", value: 12, color: "#ff9800" },
  { name: "Lo esperado", value: 8, color: "#9c27b0" },
  { name: "Mejoras propuestas", value: 18, color: "#ff5722" },
  { name: "A mantener", value: 22, color: "#795548" },
];

const dataPie = [
  { name: "Aspectos positivos", value: 60, color: "#4caf50" },
  { name: "Aspectos neutrales", value: 20, color: "#ffeb3b" },
  { name: "Aspectos negativos", value: 20, color: "#f44336" },
];

export default function RetroDashboard() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    setResponse("");

    try {
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
                parts: [{ text: `${retroSummary}\n\nPregunta: ${query}` }],
              },
            ],
          }),
        }
      );

      const data = await res.json();

      if (data.error) {
        console.error("Error en la API:", data.error);
        setResponse(`Error: ${data.error.message}`);
        return;
      }

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        setResponse(data.candidates[0].content.parts[0].text.trim());
      } else {
        setResponse("No tengo una respuesta en este momento.");
      }
    } catch (error) {
      console.error("Error en la consulta:", error);
      setResponse("Error al obtener la respuesta. Verifica la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Retrospectiva del Equipo
      </Typography>

      {/* Gráfico de Barras */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Análisis de Retrospectiva
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataBar}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              {dataBar.map((entry, index) => (
                <Bar key={index} dataKey="value" fill={entry.color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Pastel */}
      <Card sx={{ mb: 4, p: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Distribución General
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dataPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {dataPie.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Buscador con IA de Gemini */}
      <Card sx={{ p: 3, backgroundColor: "#E3F2FD" }}>
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
              <Typography variant="body1" align="center" color="primary">
                {response}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
