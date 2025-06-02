import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography
} from '@mui/material';
import { useState } from 'react';
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from 'react-router-dom';
import * as yup from "yup";
import { MyDialog } from "../../components/MyDialog";
import BackgroundService from "../../services/BackgroundService";
export default function RouteCrud({ mode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isNewMode = mode === 'new';
  const isViewMode = mode === 'view';
  const apikey = localStorage.getItem("apikey");
  const dto = location.state?.dto || {};
  const upstreamIds = location.state?.ids || [];
  const [upstreamId, setUpstreamId] = useState(dto?.upstreamId || null);
  const [methods, setMethods] = useState(dto?.methods || []);
  const methodOptions = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS", "CONNECT", "TRACE"];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Error");
  const [dialogMsg, setDialogMsg] = useState("");
  const schema = yup.object().shape({
    id: yup.string().required("ID is required"),
    uri: yup.string().required("URI is required"),
    useKey: yup.boolean(),
    userKey: yup.string().when("useKey", {
      is: true,
      then: (schema) => schema.required("User Key is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    apiKey: yup.string().when("useKey", {
      is: true,
      then: (schema) => schema.required("API Key is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
    confirmApiKey: yup.string().when("useKey", {
      is: true,
      then: (schema) =>
        schema
          .required("Please confirm API Key")
          .oneOf([yup.ref("apiKey")], "API Key does not match."),
      otherwise: (schema) => schema.notRequired(),
    }),
  });


  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      id: dto?.id || "",
      uri: dto?.uri || "/",
      useKey: false,
      userKey: "",
      apiKey: "",
      confirmApiKey: "",
    },
  });
  const useKey = watch("useKey");


  const onSubmit = (data) => {
    if (!upstreamId) {
      setDialogTitle("Warning!");
      setDialogMsg("Please select an Upstream ID.");
      setDialogOpen(true);
      return;
    }

    if (!methods || methods.length === 0) {
      setDialogTitle("Warning!");
      setDialogMsg("Please select at least one method.");
      setDialogOpen(true);
      return;
    }
    const id = data.id.trim();
    const routeBody = {
      upstream_id: upstreamId,
      uri: data.uri.trim(),
      methods: methods,
    };
    if (useKey) {
      routeBody.plugins = {
        "key-auth": {
          "header": "apisix-key",
        }
      };
      const consumerBody = {
        username: data.userKey.trim(),
        plugins: {
          "key-auth": {
            key: data.apiKey.trim(),
          }
        }
      }
      callConsumers(apikey, consumerBody, id, routeBody);
    } else {
      routeBody.plugins = {};
      callRoutes(apikey, routeBody, id);
    }


  };

  function callConsumers(apikey, reqBody, id, routeBody) {
    BackgroundService.callApi({
      url: '/consumers',
      method: 'PUT',
      isUseBody: true,
      isBackend: false,
      isXApi: true,
      xApiKey: apikey,
      body: reqBody,
    }).then((res) => {
      if (res.status === 200 || res.status === 201) {
        callRoutes(apikey, routeBody, id);
      } else {
        setDialogTitle("401 Unauthorized");
        setDialogMsg("Failed to update consumers. Please check your API key.");
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

  function callRoutes(apikey, reqBody, id) {
    BackgroundService.callApi({
      url: '/routes/' + id,
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
        setDialogMsg("Failed to update routes. Please check your API key.");
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
        sx={{ p: 4, borderRadius: 3, width: "80%", height: "80%", minHeight: "80vh" }}
      >
        <Typography variant="h5" align="center" fontWeight="bold" mb={3}>
          {mode === 'new' ? "Create Route" : mode === 'edit' ? "Edit Route" : "View Route"}
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
              <InputLabel id="upstreamId">Upstream ID</InputLabel>
              <Select
                labelId="upstreamId"
                value={upstreamId}
                label="Upstream ID"
                onChange={(e) => setUpstreamId(e.target.value)}
              >
                {upstreamIds.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth disabled={isViewMode}>
              <InputLabel id="methods">Methods</InputLabel>
              <Select
                labelId="methods"
                value={methods}
                label="Methods"
                onChange={(e) => setMethods(e.target.value)}
                multiple
              >
                {methodOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="URI"
              fullWidth
              {...register("uri")}
              error={!!errors.uri}
              helperText={errors.uri?.message}
              disabled={isViewMode}
            />
            <FormControl>
              <Box display="flex" alignItems="center" gap={1}>
                <input
                  type="checkbox"
                  {...register("useKey")}
                  onChange={(e) => setValue("useKey", e.target.checked)}
                  checked={useKey}
                />

                <Typography variant="body1">Use Api Key</Typography>
              </Box>
            </FormControl>
            {useKey && (
              <>
                <TextField
                  label="USER"
                  fullWidth
                  {...register("userKey")}
                  error={!!errors.userKey}
                  helperText={errors.userKey?.message}
                />
                <TextField
                  label="API Key"
                  fullWidth
                  type="password"
                  {...register("apiKey")}
                  error={!!errors.apiKey}
                  helperText={errors.apiKey?.message}
                />
                <TextField
                  label="Confirm API Key"
                  fullWidth
                  type="password"
                  {...register("confirmApiKey")}
                  error={!!errors.confirmApiKey}
                  helperText={errors.confirmApiKey?.message}
                />
              </>
            )}


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