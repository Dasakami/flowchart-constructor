import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface AuthScreenProps {
  onLogin: (token: string, user: User) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await api.login(username, password);
      } else {
        response = await api.register(email, username, password);
      }

      api.setToken(response.access_token);
      const user = await api.getMe();
      onLogin(response.access_token, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-200 via-pink-100 to-yellow-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full relative">
        {/* Логотип и заголовок */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl mb-4 shadow-lg transform rotate-6">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2 tracking-wide">
            FlowMaker
          </h1>
          <p className="text-gray-700 text-sm font-medium">
            Создавай блок-схемы легко и красиво
          </p>
        </div>

        {/* Форма */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-t-8 border-purple-500">
          {/* Переключатель */}
          <div className="flex mb-6 rounded-xl overflow-hidden shadow-inner">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 font-semibold transition-all ${
                isLogin
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 font-semibold transition-all ${
                !isLogin
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition shadow-sm text-gray-700"
                />
              </div>
            )}

            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Имя пользователя"
                required
                className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none transition shadow-sm text-gray-700"
              />
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                required
                className="w-full px-5 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 outline-none transition shadow-sm text-gray-700"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm shadow-inner">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-lg hover:scale-105 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Загрузка...' : isLogin ? <><LogIn className="w-5 h-5" /> Войти</> : <><UserPlus className="w-5 h-5" /> Зарегистрироваться</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
