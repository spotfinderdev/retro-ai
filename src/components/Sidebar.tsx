import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from "@mui/material";
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
        "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
      }}
    >
      <Toolbar />
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
    </Drawer>
  );
}
