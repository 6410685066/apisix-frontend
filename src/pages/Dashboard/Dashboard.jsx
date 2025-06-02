import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { ConfirmDialog, MyDialog } from "../../components/MyDialog";
import BackgroundService from "../../services/BackgroundService";
export default function Dashboard() {
  const navigate = useNavigate();
  const upstreamColumns = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 1 },
    { field: 'node', headerName: 'Node', flex: 1 },
  ];
  const upstreamPath = {
    new: '/upstreams/new',
    view: '/upstreams/view',
    edit: '/upstreams/edit',
  };
  const [upstreamRows, setUpstreamRows] = useState([]);
  const [upstreamIds, setUpstreamIds] = useState([]);
  const routeColumns = [
    { field: 'id', headerName: 'ID', flex: 15 },
    { field: 'upstreamId', headerName: 'Upstream ID', flex: 15 },
    { field: 'methods', headerName: 'Methods', flex: 35 },
    { field: 'uri', headerName: 'URI', flex: 20 },
    { field: 'useKey', headerName: 'Enable Api Key', flex: 15 },
  ];
  const routePath = {
    new: '/routes/new',
    view: '/routes/view',
    edit: '/routes/edit',
  };
  const [routeRows, setRouteRows] = useState([]);
  const [upstreamSelectedRow, setUpstreamSelectedRow] = useState(null);
  const [routeSelectedRow, setRouteSelectedRow] = useState(null);
  const [showForm, setShowForm] = useState(() => !localStorage.getItem("apikey"));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Error");
  const [dialogMsg, setDialogMsg] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState("");
  const [deleteUrl, setDeleteUrl] = useState("");
  const schema = yup.object().shape({
    apikey: yup.string().required("Apikey is required"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = ({ apikey }) => {
    fetchUpstreams(apikey);
    fetchRoutes(apikey);
  };

  useEffect(() => {
    const apikey = localStorage.getItem("apikey");
    if (apikey) {
      fetchUpstreams(apikey);
      fetchRoutes(apikey);
    }
  }, []);

  function fetchUpstreams(apikey, isRefresh = false) {
    BackgroundService.callApi({
      url: '/upstreams',
      method: 'GET',
      isUseBody: false,
      isBackend: false,
      isXApi: true,
      xApiKey: apikey,
    }).then((res) => {
      if (res.status === 200) {
        localStorage.setItem("apikey", apikey);
        setShowForm(false);
        const rows = res.data.list || [];
        const ids = [];
        const upstreamList = rows.map((item) => {
          ids.push(item.value.id);
          return {
            id: item.value.id,
            type: item.value.type,
            node: Object.entries(item.value.nodes)
              .map(([address, weight]) => `${address}:${weight}`)
              .join(", "),
          };
        });
        setUpstreamIds(ids);
        setUpstreamRows(upstreamList);
        if (isRefresh) {
          setDialogTitle("Success");
          setDialogMsg("Upstreams fetched successfully.");
          setDialogOpen(true);
        }
      } else {
        setDialogTitle("401 Unauthorized");
        setDialogMsg("Failed to fetch datas. Please check your API key.");
        setDialogOpen(true);
        localStorage.removeItem("apikey");
      }
    }
    ).catch((error) => {
      console.error("Failed to fetch:", error);
      setDialogTitle("Error");
      setDialogMsg("Failed to fetch. Please check your API key.");
      setDialogOpen(true);
      localStorage.removeItem("apikey");
    });
  }

  function fetchRoutes(apikey, isRefresh = false) {
    BackgroundService.callApi({
      url: '/routes',
      method: 'GET',
      isUseBody: false,
      isBackend: false,
      isXApi: true,
      xApiKey: apikey,
    }).then((res) => {
      if (res.status === 200) {
        localStorage.setItem("apikey", apikey);
        setShowForm(false);
        const routeList = res.data.list || [];
        setRouteRows(
          routeList.map((item) => ({
            id: item.value.id,
            upstreamId: item.value.upstream_id,
            methods: item.value.methods,
            uri: item.value.uri,
            useKey: item.value.plugins?.['key-auth'] ? "Yes" : "No",
          }))
        )
        if (isRefresh) {
          setDialogTitle("Success");
          setDialogMsg("Routes fetched successfully.");
          setDialogOpen(true);
        }
      } else {
        setDialogTitle("401 Unauthorized");
        setDialogMsg("Failed to fetch datas. Please check your API key.");
        setDialogOpen(true);
        localStorage.removeItem("apikey");
      }
    }
    ).catch((error) => {
      console.error("Failed to fetch:", error);
      setDialogTitle("Error");
      setDialogMsg("Failed to fetch. Please check your API key.");
      setDialogOpen(true);
      localStorage.removeItem("apikey");
    });
  }


  function handleConfirm() {
    console.log("upstreamSelectedRow:", upstreamSelectedRow.id);
    console.log("routeSelectedRow:", routeSelectedRow);
    let URL = deleteUrl + '/';
    if (deleteUrl === '/upstreams') {
      URL += upstreamSelectedRow.id;
    }
    else if (deleteUrl === '/routes') {
      URL += routeSelectedRow.id;
    }
    BackgroundService.callApi({
      url: URL,
      method: 'DELETE',
      isUseBody: false,
      isBackend: false,
      isXApi: true,
      xApiKey: localStorage.getItem("apikey"),
    }).then((res) => {
      if (res.status === 200) {
        setDialogTitle("Success");
        setDialogMsg("Delete successfully.");
        setDialogOpen(true);
        fetchUpstreams(localStorage.getItem("apikey"));
        fetchRoutes(localStorage.getItem("apikey"));
      } else {
        setDialogTitle("Error");
        setDialogMsg("Failed to delete. Please try again.");
        setDialogOpen(true);
      }
    }
    ).catch((error) => {
      console.error("Failed to delete:", error);
      setDialogTitle("Error");
      setDialogMsg("Failed to delete. Please try again.");
      setDialogOpen(true);
    });
  }

  function validateOneRowSelected(selectedRow) {
    if (!selectedRow) {
      setDialogTitle("Warning!");
      setDialogMsg("Please select one row.");
      setDialogOpen(true);
      return false;
    }
    return true;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100vw",
        height: "100%",
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
      }}
    >
      <Typography variant="h3" align="center" fontWeight="bold" mt={4} mb={3} color="black">Dashboard</Typography>
      <Container>
        {showForm ? (
          <Box display="flex" justifyContent="center" alignItems="stretch">
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: 500 }}>
              <TextField
                label="API Key"
                type="password"
                fullWidth
                {...register("apikey")}
                error={!!errors.apikey}
                helperText={errors.apikey?.message}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{ height: '56px' }}>
                Submit
              </Button>
            </form>
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" sx={{ flexDirection: 'column', gap: '16px' }}>
            <Button variant="contained" color="warning"
              onClick={() => {
                localStorage.removeItem("apikey"); setShowForm(true)
              }}>
              Change API Key
            </Button>
            {/* Upsteams */}
            <Typography variant="h6" align="center" fontWeight="bold" color="black">List All Upstreams</Typography>
            <Box display="flex" justifyContent="flex-start" alignItems="center" sx={{ width: '100%' }}>
              <Button variant="contained" color="primary" sx={{ textTransform: "none", mr: 2 }}
                onClick={() => {
                  fetchUpstreams(localStorage.getItem("apikey"), true);
                }}>
                Refresh
              </Button>
              <Button variant="contained" color="secondary" sx={{ textTransform: "none", mr: 2 }}
                onClick={() => {
                  navigate(upstreamPath.new)
                }}>
                Add
              </Button>
              <Button variant="contained" color="secondary" sx={{ textTransform: "none", mr: 2 }}
                onClick={() => {
                  if (upstreamSelectedRow) { navigate(upstreamPath.view, { state: { dto: upstreamSelectedRow } }) }
                  else { validateOneRowSelected(upstreamSelectedRow) }
                }}>
                View
              </Button>
              <Button variant="contained" color="secondary" sx={{ textTransform: "none", mr: 2 }}
                onClick={() => {
                  if (upstreamSelectedRow) { navigate(upstreamPath.edit, { state: { dto: upstreamSelectedRow } }) }
                  else { validateOneRowSelected(upstreamSelectedRow) }
                }}>
                Edit
              </Button>
              <Button variant="contained" color="error" sx={{ textTransform: "none" }}
                onClick={() => {
                  if (upstreamSelectedRow) {
                    setDeleteUrl('/upstreams');
                    setConfirmMsg(`Are you sure you want to delete upstream with ID:\n${upstreamSelectedRow.id}?`);
                    setConfirmOpen(true);
                  } else { validateOneRowSelected(upstreamSelectedRow) }

                }}>
                Delete
              </Button>
            </Box>
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={upstreamRows}
                columns={upstreamColumns}
                pageSizeOptions={[10]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
                onRowClick={(params) => {
                  if (upstreamSelectedRow && upstreamSelectedRow.id === params.row.id) {
                    setUpstreamSelectedRow(null);
                  } else {
                    setUpstreamSelectedRow(params.row);
                  }
                }}
              />
            </Box>
            {/* Routes */}
            <Typography variant="h6" align="center" fontWeight="bold" color="black" sx={{ mt: 5 }}>List All Routes</Typography>
            <Box display="flex" justifyContent="flex-start" alignItems="center" sx={{ width: '100%' }}>
              <Button variant="contained" color="primary" sx={{ textTransform: "none", mr: 2 }}
                onClick={() => {
                  fetchRoutes(localStorage.getItem("apikey"), true);
                }}>
                Refresh
              </Button>
              <Button variant="contained" color="secondary" sx={{ textTransform: "none", mr: 2 }}
                onClick={() => {
                  navigate(routePath.new, { state: { ids: upstreamIds } })
                }}>
                Add
              </Button>
              <Button variant="contained" color="secondary" sx={{ textTransform: "none", mr: 2 }}
                onClick={() => {
                  if (routeSelectedRow) { navigate(routePath.view, { state: { dto: routeSelectedRow, ids: upstreamIds } }) }
                  else { validateOneRowSelected(upstreamSelectedRow) }
                }}>
                View
              </Button>
              <Button variant="contained" color="secondary" sx={{ textTransform: "none", mr: 2 }}
                onClick={() => {
                  if (routeSelectedRow) { navigate(routePath.edit, { state: { dto: routeSelectedRow, ids: upstreamIds } }) }
                  else { validateOneRowSelected(upstreamSelectedRow) }
                }}>
                Edit
              </Button>
              <Button variant="contained" color="error" sx={{ textTransform: "none" }}
                onClick={() => {
                  if (routeSelectedRow) {
                    setDeleteUrl('/routes');
                    setConfirmMsg(`Are you sure you want to delete upstream with ID:\n${routeSelectedRow.id}?`);
                    setConfirmOpen(true);
                  } else { validateOneRowSelected(upstreamSelectedRow) }
                }}>
                Delete
              </Button>
            </Box>
            <Box sx={{ height: 600, width: '100%', mb: 5 }}>
              <DataGrid
                rows={routeRows}
                columns={routeColumns}
                pageSizeOptions={[10]}
                initialState={{
                  pagination: {
                    paginationModel: { pageSize: 10, page: 0 },
                  },
                }}
                onRowClick={(params) => {
                  if (routeSelectedRow && routeSelectedRow.id === params.row.id) {
                    setRouteSelectedRow(null);
                  } else {
                    setRouteSelectedRow(params.row);
                  }
                }}
              />
            </Box>
          </Box>
        )}
      </Container>
      <MyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={dialogTitle}
        message={dialogMsg}
      />
      <ConfirmDialog
        open={confirmOpen}
        message={confirmMsg}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          handleConfirm();
        }}
      />
    </Box>
  );
}

