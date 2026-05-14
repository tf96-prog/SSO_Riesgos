import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { Usuario } from "../data/usuarios";
import { apiPost } from "../services/api";

const USUARIO_ACTUAL_KEY = "USUARIO_ACTUAL";

export async function iniciarSesion(
  correo: string,
  password: string,
): Promise<Usuario | null> {
  try {
    const usuario = await apiPost<Usuario>("/auth/login", { correo, password });

    if (usuario) {
      await AsyncStorage.setItem(USUARIO_ACTUAL_KEY, JSON.stringify(usuario));
      return usuario;
    }
    return null;
  } catch (error) {
    console.error("Error de login:", error);
    return null;
  }
}

export async function obtenerUsuarioActual(): Promise<Usuario | null> {
  try {
    if (Platform.OS === "web") {
      const data = localStorage.getItem(USUARIO_ACTUAL_KEY);
      return data ? JSON.parse(data) : null;
    }

    const data = await AsyncStorage.getItem(USUARIO_ACTUAL_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.log("Error al obtener usuario actual:", error);
    return null;
  }
}

export async function cerrarSesion() {
  try {
    if (Platform.OS === "web") {
      localStorage.removeItem(USUARIO_ACTUAL_KEY);
      return;
    }

    await AsyncStorage.removeItem(USUARIO_ACTUAL_KEY);
  } catch (error) {
    console.log("Error al cerrar sesión:", error);
  }
}
