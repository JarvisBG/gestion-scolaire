// src/pages/Login.tsx
export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-zinc-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Gestion Scolaire</h1>
          <p className="text-sm text-zinc-500 mt-2">Connectez-vous à votre espace</p>
        </div>
        
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Email</label>
            <input 
              type="email" 
              className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" 
              placeholder="admin@ecole.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Mot de passe</label>
            <input 
              type="password" 
              className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors" 
              placeholder="••••••••"
            />
          </div>
          <button 
            type="button" 
            className="w-full bg-zinc-900 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-zinc-800 transition-colors mt-2"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  )
}