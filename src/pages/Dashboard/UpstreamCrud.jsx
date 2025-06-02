import {
  Button
} from '@mui/material';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MyDialog } from "../../components/MyDialog";
import BackgroundService from "../../services/BackgroundService";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useForm } from "react-hook-form";
import * as yup from "yup";

export default function DashboardCrud({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const apikey = localStorage.getItem("apikey");
  const dto = location.state?.dto || {};
  const isNewMode = mode === 'new';
  const isViewMode = mode === 'view';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Error");
  const [dialogMsg, setDialogMsg] = useState("");
  const [type, setType] = useState(dto?.type || "roundrobin");
  const [nodes, setNodes] = useState([]);
  const [nodeInput, setNodeInput] = useState("");
  const typeOptions = ["roundrobin", "ewma", "least_conn"]; // , "chash" 
  const nodePattern = /^((\d{1,3}\.){3}\d{1,3}|[\w.-]+):\d+(?::\d+)?$/;
  const schema = yup.object().shape({
    id: yup.string().required("ID is required"),
  });


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: dto?.id || "",
    },
  });


  useEffect(() => {
    if (dto.node) {
      const parsedNodes = dto.node.split(",").map(s => s.trim());
      setNodes(parsedNodes);
    }
  }, [dto.node]);


  const onSubmit = (data) => {
    const id = data.id.trim();
    const body = {
      type: type,
      nodes: nodes.reduce((acc, node) => {
        const [host, port, weightStr] = node.split(":");
        const weight = parseInt(weightStr || "1", 10);
        const nodeKey = `${host}:${port}`;
        acc[nodeKey] = weight;
        return acc;
      }, {})
    };

    callUpstreams(apikey, body, id);
  };

  function callUpstreams(apikey, reqBody, id) {
    BackgroundService.callApi({
      url: '/upstreams/' + id,
      method: 'PUT',
      isUseBody: true,
      isBackend: false,
      isXApi: true,
      xApiKey: apikey,
      body: reqBody,
    }).then((res) => {
      if (res.status === 200 || res.status === 201) {
        setDialogTitle("Success");
        setDialogMsg("Save successfully.");
        setDialogOpen(true);

      } else {
        setDialogTitle("401 Unauthorized");
        setDialogMsg("Failed to update upstreams. Please check your API key.");
        setDialogOpen(true);
        localStorage.removeItem("apikey");
      }
    }
    ).catch((error) => {
      console.error("Failed to update:", error);
      setDialogTitle("Error");
      setDialogMsg("Failed to update. Please check your API key.");
      setDialogOpen(true);
      localStorage.removeItem("apikey");
    });
  }



  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
        height: "100%",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      <Paper
        elevation={6}
        sx={{ p: 4, borderRadius: 3, width: "80%", height: "80%", minHeight: "80vh"}}
      >
        <Typography variant="h5" align="center" fontWeight="bold" mb={3}>
          {mode === 'new' ? "Create Upstream" : mode === 'edit' ? "Edit Upstream" : "View Upstream"}
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection="column" gap={2} mb={3}>
            <TextField
              label="ID"
              fullWidth
              {...register("id")}
              error={!!errors.id}
              helperText={errors.id?.message}
              disabled={!isNewMode}
            />
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                value={type}
                label="Type"
                onChange={(e) => setType(e.target.value)}
              >
                {typeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>


              <Typography fontWeight="bold" mb={1}>Nodes</Typography>
              <Box display="flex" gap={1} mb={1}>
                <TextField
                  label="Enter node (host:port[:weight])"
                  fullWidth
                  value={nodeInput}
                  onChange={(e) => setNodeInput(e.target.value)}
                  disabled={isViewMode}
                />
                <Button
                  disabled={isViewMode}
                  variant="contained"
                  onClick={() => {
                    const trimmed = nodeInput.trim();
                    if (!trimmed) return;

                    if (!nodePattern.test(trimmed)) {
                      setDialogTitle("Invalid Node Format");
                      setDialogMsg("Please use format host:port or host:port:weight (e.g., 127.0.0.1:8080 or api.example.com:443:2)");
                      setDialogOpen(true);
                      return;
                    }

                    const parts = trimmed.split(":");
                    const host = parts[0];
                    const portStr = parts[1];
                    let weight = 1;

                    const port = Number(portStr);
                    if (!Number.isInteger(port) || port < 1 || port > 65535) {
                      setDialogTitle("Invalid Port");
                      setDialogMsg("Port must be an integer between 1 and 65535.");
                      setDialogOpen(true);
                      return;
                    }

                    if (parts.length === 3) {
                      const w = Number(parts[2]);
                      if (!Number.isInteger(w) || w <= 0) {
                        setDialogTitle("Invalid Weight");
                        setDialogMsg("Weight must be a positive integer.");
                        setDialogOpen(true);
                        return;
                      }
                      weight = w;
                    }

                    const hostPort = host + ":" + port;

                    const index = nodes.findIndex(n => {
                      const nParts = n.split(":");
                      return nParts[0] + ":" + nParts[1] === hostPort;
                    });

                    if (index >= 0) {
                      const newNodes = [...nodes];
                      newNodes[index] = `${hostPort}:${weight}`;
                      setNodes(newNodes);
                    } else {
                      setNodes([...nodes, `${hostPort}:${weight}`]);
                    }
                    setNodeInput("");
                  }}
                >
                  Add
                </Button>
              </Box>

              <Box sx={{ pl: 1 }}>
                {nodes.map((node, index) => (
                  <Box key={index} display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Typography>{`${node}`}</Typography>
                    <Button disabled={isViewMode} color="error" size="small" onClick={() => {
                      setNodes(nodes.filter((_, i) => i !== index));
                    }}>
                      Remove
                    </Button>
                  </Box>
                ))}
              </Box>
            </Box>


          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ textTransform: "none" }}
              onClick={() => {
                navigate("/dashboard");
              }}>
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{ textTransform: "none" }}
            >
              {mode === 'new' ? "Create" : mode === 'edit' ? "Update" : "Close"}
            </Button>
          </Box>
        </form>
      </Paper>
      <MyDialog
        open={dialogOpen}
        onClose={() => {
          if (dialogTitle === "Success") {
            setDialogOpen(false)
            navigate("/dashboard");
          } else {
            setDialogOpen(false);
          }
        }}
        title={dialogTitle}
        message={dialogMsg}
      />
    </Box>
  );
}