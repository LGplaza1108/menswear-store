import { useState } from "react";
import client from "../api/client";
import Seo from "../components/ui/Seo";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { data } = await client.post("/auth/forgot-password", { email });
    setMessage(data.message);
  };

  return (
    <div className="container-shell py-16">
      <Seo title="Forgot Password" description="Request a password reset email." />
      <div className="mx-auto max-w-md surface p-8">
        <h1 className="text-3xl font-semibold">Forgot password</h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="btn-primary w-full">
            Send reset link
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-stone-500">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
