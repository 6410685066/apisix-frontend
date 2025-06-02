import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";

export function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <Button
      variant="contained"
      color="error"
      onClick={handleLogout}
      sx={{ mt: 2 }}
    >
      Logout
    </Button>
  );
}