import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import Seo from "../components/ui/Seo";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { data } = await client.post(`/auth/reset-password/${token}`, { password });
    setMessage(data.message);
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="container-shell py-16">
      <Seo title="Reset Password" description="Choose a new password for your account." />
      <div className="mx-auto max-w-md surface p-8">
        <h1 className="text-3xl font-semibold">Reset password</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="input" type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn-primary w-full">
            Update password
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-stone-500">{message}</p>}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
