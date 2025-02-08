import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box } from "@mui/material";
import { Dashboard, Storage } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const drawerWidth = 240;

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 2 },
      }}
    >
      {/* 🔹 Espaciado superior */}
      <Toolbar />

      {/* 🔹 Lista de navegación */}
      <Box sx={{ flexGrow: 1 }}>
        <List>
          <ListItem component="div" onClick={() => navigate("/")} sx={{ cursor: "pointer" }}>
            <ListItemIcon>
              <Dashboard />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem component="div" onClick={() => navigate("/data-manager")} sx={{ cursor: "pointer" }}>
            <ListItemIcon>
              <Storage />
            </ListItemIcon>
            <ListItemText primary="Data Manager" />
          </ListItem>
        </List>
      </Box>

      {/* 🔹 Contenedor del Logo - Siempre en la parte inferior */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "12px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #FF6E4B, #0077C8, #4CAF50)", // 🎨 Degradado con colores de Intraway + extra
        }}
      >
        <Box
          sx={{
            background: "#1E1E1E", // Fondo oscuro detrás del logo
            padding: "10px",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src="/img/logo-kyd.png"
            alt="Know Your Data"
            style={{
              width: "80%",
              height: "auto",
              maxWidth: "160px",
              borderRadius: "6px",
            }}
          />
        </Box>
      </Box>
    </Drawer>
  );
}
