'use client';
import { signIn } from 'next-auth/react';
import { Suspense } from 'react';

function LoginContent() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      gap: '20px',
      fontFamily: 'sans-serif'
    }}>
      <h1>Acceso Gato-Can</h1>
      <p>Pulsa el botón para identificarte con Google:</p>
      <button 
        onClick={() => signIn('google', { callbackUrl: '/' })}
        style={{ 
          padding: '15px 30px', 
          backgroundColor: '#4285F4', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        Entrar con Google
      </button>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando sistema de acceso...</div>}>
      <LoginContent />
    </Suspense>
  );
}
