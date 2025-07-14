import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import './Login.css';
import logo from './assets/wilson logo.png'; // Caminho para sua logo

function Login({ onLoginSuccess }) {
  const handleLogin = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    const email = decoded.email;

    if (email.endsWith('@wilsonsons.com.br')) {
      localStorage.setItem('usuario', JSON.stringify(decoded));
      onLoginSuccess();
    } else {
      alert('Acesso permitido apenas com e-mail corporativo @wilsonsons.com.br');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="Wilson Sons" className="logo" />
        <h2>Bem-vindo à WIA</h2>
        <p>Seu assistente inteligente da Wilson Sons</p>
        <GoogleLogin
          onSuccess={handleLogin}
          onError={() => alert('Erro ao fazer login com Google')}
        />
      </div>
    </div>
  );
}

export default Login;
