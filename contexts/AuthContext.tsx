import { createContext, ReactNode, useState } from "react";
import { setCookie } from "nookies";
import Router from "next/router";
import { api } from "../services/api";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  user: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      //pode utilizar: sessionStorage => não fica disponivel em outras sessoes, fecha navegador já era.
      //pode utilizar: localStorage => dura, fica disponivel. pode fechar app, sair do navegador e reiniciar o computador que ele mantém. Como está com Next, no lado do servidor não tem acesso ao localStorage (só existe no browser).
      //pode utilizar: cookies => estrutura de armazenamento mais antiga do browser. pode ser acessado tanto pelo lado do browser como pelo lado do servidor (será utilizada essa alternativa nesse projeto.)

      //API propria do browser para salvar os dados em cookies (não é tão amigável)

      setCookie(undefined, "nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/"
      })
      setCookie(undefined, "nextauth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/"
      })

      setUser({
        email,
        permissions,
        roles,
      });

      Router.push("/dashboard");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
