# 📦 Store de la Aplicación (`src/store/index.ts`)

Este archivo gestiona el **estado global** de la aplicación utilizando la librería **Zustand**. Es el "cerebro" que controla la lógica del partido, el puntaje, el historial y las estadísticas.

## 🛠️ ¿Qué hace este archivo?

Define y exporta un **hook** llamado `useStore`. Este hook permite a cualquier componente de tu aplicación acceder a los datos del partido y ejecutar acciones (como sumar puntos o deshacer jugadas).

### 🔑 Conceptos Clave

*   **`StoreState`**: Es la interfaz que define qué datos y funciones están disponibles en el store.
*   **`currentMatch`**: Guarda toda la información del partido que se está jugando actualmente (puntaje, jugadores, configuración, etc.).
*   **`actionHistory`**: Es una pila (stack) que guarda copias del estado del partido cada vez que se hace un cambio. Esto es lo que permite la funcionalidad de "Deshacer" (Undo).

---

## ⚡ Funciones Principales (Actions)

Aquí te explico detalladamente qué hace cada función que puedes usar desde el `useStore`:

### 1. `startMatch(config)`
*   **Propósito**: Inicia un nuevo partido.
*   **Qué hace**:
    *   Recibe la configuración del partido (`MatchConfig`) como quién saca primero, modo de puntuación, etc.
    *   Crea un objeto `newMatch` con el estado inicial: puntaje en 0-0, sets vacíos y estadísticas en cero.
    *   Limpia el historial de deshacer (`actionHistory`).
    *   Actualiza el estado `currentMatch` con este nuevo partido.

### 2. `addPoint(team)`
*   **Propósito**: Suma un punto a un equipo ('team1' o 'team2') y maneja toda la lógica del tenis/pádel.
*   **Qué hace**:
    1.  **Guarda el estado actual**: Antes de cambiar nada, hace una copia del partido actual y la guarda en `actionHistory` (para poder deshacer después).
    2.  **Calcula el siguiente punto**: Usa la función auxiliar `calculateNextPoint` para determinar el nuevo puntaje (ej. de 15 a 30, o ventaja).
    3.  **Actualiza Estadísticas**: Incrementa contadores como *break points*, *golden points* y juegos de servicio ganados/perdidos.
    4.  **Verifica Ganadores**:
        *   **Juego**: Si alguien gana el juego, actualiza el marcador del set.
        *   **Set**: Si alguien gana el set (usando `checkSetWon`), actualiza el contador de sets.
        *   **Partido**: Si alguien gana el partido (usando `checkMatchWon`), marca el partido como `completed`, lo guarda en el historial persistente y define al ganador.
    5.  **Cambio de Saque**: Gestiona automáticamente a quién le toca sacar (`getNextServer`).

### 3. `undoPoint()`
*   **Propósito**: Deshace el último punto o acción realizada.
*   **Qué hace**:
    *   Verifica si hay acciones en `actionHistory`.
    *   Toma el último estado guardado (`previousState`).
    *   Reemplaza el `currentMatch` actual con ese estado anterior.
    *   Elimina esa entrada del historial.
    *   *Efecto*: El marcador y las estadísticas vuelven exactamente a como estaban antes del último punto.

### 4. `endMatch()`
*   **Propósito**: Finaliza el partido manualmente antes de que termine por puntos (ej. por retiro).
*   **Qué hace**:
    *   Marca el estado del partido como `completed`.
    *   Guarda el partido en el almacenamiento persistente (`addMatchToStorage`).
    *   Actualiza el historial global de partidos.

### 5. `resetMatch()`
*   **Propósito**: Limpia el partido actual.
*   **Qué hace**: Pone `currentMatch` en `null`, dejando la aplicación lista para configurar un nuevo juego.

### 6. `loadHistory()` y `clearHistory()`
*   **Propósito**: Gestionar el historial de partidos pasados.
*   **Qué hace**: `loadHistory` carga los partidos guardados desde el almacenamiento del dispositivo. `clearHistory` borra ese historial.

---

## 🚀 Cómo usar el hook `useStore`

Puedes usar este hook en cualquier componente de React (`.tsx`). Zustan te permite seleccionar solo lo que necesitas para mejorar el rendimiento.

### Ejemplo Básico: Leer el puntaje
```tsx
import { useStore } from '../store';

const ScoreDisplay = () => {
  // Seleccionamos solo el partido actual
  const currentMatch = useStore((state) => state.currentMatch);

  if (!currentMatch) return <Text>No hay partido activo</Text>;

  const { score } = currentMatch;
  return (
    <View>
      <Text>Juegos: {score.currentSet.team1Games} - {score.currentSet.team2Games}</Text>
      <Text>Puntos: {score.currentGame.team1Points} - {score.currentGame.team2Points}</Text>
    </View>
  );
};
```

### Ejemplo Intermedio: Sumar puntos y Deshacer
```tsx
import { useStore } from '../store';
import { Button } from 'react-native';

const Controls = () => {
  // Obtenemos las funciones (acciones)
  const addPoint = useStore((state) => state.addPoint);
  const undoPoint = useStore((state) => state.undoPoint);

  return (
    <View>
      <Button title="Punto Equipo 1" onPress={() => addPoint('team1')} />
      <Button title="Punto Equipo 2" onPress={() => addPoint('team2')} />
      
      <Button title="Deshacer" onPress={undoPoint} color="red" />
    </View>
  );
};
```

### Ejemplo Avanzado: Acceder a estadísticas
```tsx
const Stats = () => {
  // Puedes hacer destructuring directo si prefieres
  const { currentMatch } = useStore(); 

  if (!currentMatch) return null;

  const stats = currentMatch.statistics;
  
  return (
    <Text>Errores no forzados Team 1: {stats.team1.unforcedErrors}</Text>
  );
};
```
