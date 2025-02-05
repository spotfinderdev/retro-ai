import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

const dataBar = [
  { name: "Lo que gustó", value: 20 },
  { name: "Lo que aprendió", value: 15 },
  { name: "Lo que faltó", value: 12 },
  { name: "Lo esperado", value: 8 },
  { name: "Mejoras propuestas", value: 18 },
  { name: "A mantener", value: 22 },
];

const dataPie = [
  { name: "Aspectos positivos", value: 60 },
  { name: "Aspectos neutrales", value: 20 },
  { name: "Aspectos negativos", value: 20 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function RetroDashboard() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer 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`
        },
        body: JSON.stringify({
          model: "gpt-4",
          prompt: `Basado en la retrospectiva del equipo, responde a la siguiente pregunta: ${query}`,
          max_tokens: 150
        })
      });
      const data = await res.json();
      setResponse(data.choices[0].text.trim() || "No tengo una respuesta en este momento.");
    } catch (error) {
      console.error("Error en la consulta:", error);
      setResponse("Error al obtener la respuesta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Retrospectiva del Equipo</h1>
      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold">Análisis de Retrospectiva</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataBar}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold">Distribución General</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={dataPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                {dataPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border border-blue-300">
        <CardContent>
          <h2 className="text-lg font-semibold text-blue-700">Consultas en Tiempo Real</h2>
          <div className="flex space-x-2 p-4 bg-blue-100 rounded">
            <Input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Escribe tu pregunta..." 
              className="border border-blue-500 p-2 rounded"
            />
            <Button onClick={handleAsk} disabled={loading} className="bg-blue-600 text-white hover:bg-blue-800">
              {loading ? "Cargando..." : "Preguntar"}
            </Button>
          </div>
          {response && <p className="mt-4 p-3 bg-blue-200 text-blue-800 font-semibold rounded">{response}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
