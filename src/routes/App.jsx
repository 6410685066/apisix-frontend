import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import UpstreamCrud from "../pages/Dashboard/UpstreamCrud";
import RouteCrud from "../pages/Dashboard/RouteCrud";
import Home from "../pages/Home";
import { PrivateRoute, PublicRoute, DashboardRoute } from "./Routes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Login />} />
        </Route>
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
        </Route>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route element={<DashboardRoute />}>
          <Route path="/upstreams/new" element={<UpstreamCrud mode="new" />} />
          <Route path="/upstreams/view" element={<UpstreamCrud mode="view" />} />
          <Route path="/upstreams/edit" element={<UpstreamCrud mode="edit" />} />

          <Route path="/routes/new" element={<RouteCrud mode="new" />} />
          <Route path="/routes/view" element={<RouteCrud mode="view" />} />
          <Route path="/routes/edit" element={<RouteCrud mode="edit" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
