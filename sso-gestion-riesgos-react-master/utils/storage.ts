import { apiGet, apiPost } from "../services/api";
import { Riesgo } from "../types/riesgo";

const RIESGOS_KEY = "RIESGOS_APP";

export async function obtenerRiesgos(): Promise<Riesgo[]> {
  try {
    const incidentes = await apiGet<Riesgo[]>("/incidentes");
    return incidentes || [];
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

export async function guardarRiesgos(riesgos: Riesgo[]) {
  try {
    for (const riesgo of riesgos) {
      await apiPost("/incidentes", {
        titulo: riesgo.titulo,
        descripcion: riesgo.descripcion,
        nivel: riesgo.nivel,
        id_usuario: 1,
        id_faena: 1,
      });
    }

    console.log("Riesgos guardados exitosamente en PostgreSQL");
  } catch (error) {
    console.error("Error al guardar riesgos en la BD:", error);
    throw error;
  }
}

export async function agregarRiesgo(riesgo: Riesgo) {
  const actuales = await obtenerRiesgos();
  const nuevos = [riesgo, ...actuales];

  await guardarRiesgos(nuevos);
}

export async function actualizarEstadoRiesgo(
  id: string,
  nuevoEstado: "Pendiente" | "En revisión" | "Cerrado",
) {
  const riesgos = await obtenerRiesgos();

  const actualizados = riesgos.map((riesgo) =>
    riesgo.id === id
      ? {
          ...riesgo,
          estado: nuevoEstado,
        }
      : riesgo,
  );

  await guardarRiesgos(actualizados);
}

export async function obtenerRiesgoPorId(id: string): Promise<Riesgo | null> {
  const riesgos = await obtenerRiesgos();
  return riesgos.find((riesgo) => riesgo.id === id) ?? null;
}
