import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { MyDialog } from "../components/MyDialog";
import BackgroundService from "../services/BackgroundService";



export default function Login() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Error");
  const [dialogMsg, setDialogMsg] = useState("");

  const schema = yup.object().shape({
    username: yup.string().required("Username is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    const { username, password } = data;
    BackgroundService.callApi({
      url: '/login',
      method: 'POST',
      body: { username, password },
      isUseBody: true,
    })
      .then(res => {
        if (res.status === 200 && res.data.token) {
          localStorage.setItem("token", res.data.token);
          navigate("/home");
        } else {
          setDialogMsg("Invalid credentials");
          setDialogOpen(true);
        }
      })
      .catch(() => {
        setDialogTitle("Login Failed");
        setDialogMsg("Invalid credentials");
        setDialogOpen(true);
      });
  };

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
        sx={{ p: 4, borderRadius: 3, width: "100%", maxWidth: 400 }}
      >
        <Typography variant="h5" align="center" fontWeight="bold" mb={3}>
          Login
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Username"
              fullWidth
              {...register("username")}
              error={!!errors.username}
              helperText={errors.username?.message}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ bgcolor: "#1976d2", ":hover": { bgcolor: "#1565c0" } }}
            >
              Login
            </Button>
          </Box>
        </form>
      </Paper>

      <MyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogTitle}
        message={dialogMsg}
      />
    </Box>
  );
}
