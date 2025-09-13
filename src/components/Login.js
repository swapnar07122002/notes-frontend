import { useState } from 'react'
import "./Login.css"
import { api_uri } from '../config';
import { useNavigate } from 'react-router-dom';

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${api_uri}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      navigate("/notes") 
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className='login-container'>
      <div className='login-box'>
        <h2>Multi-Tenant SaaS Notes Application</h2>

        <form onSubmit={handleLogin} className="login-form">
          <label htmlFor="email" className='form-label'>Enter Email</label>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password" className='form-label'>Enter Password</label>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button type="submit">Login</button>
        </form>
      </div>
      
    </div>
  )
}

export default Login