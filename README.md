# ⚙️ DeFi Autopilot Engine | Framework de Simulación Cuantitativa

**DeFi Autopilot Engine** constituye un **Framework de Simulación Algorítmica de Trading (AAT)** diseñado específicamente para emular el comportamiento de un **Agente Autónomo de Inversión (Bot de IA)** dentro del ecosistema de las Finanzas Descentralizadas (DeFi). Este entorno *proof-of-concept* aprovecha la **API de Gemini** para la **generación de *market forecasting* y la síntesis de estrategias heurísticas**, complementado con tecnología **Text-to-Speech (TTS)** para la notificación dinámica de *runtime events*.

## 🛠️ Stack Tecnológico

El proyecto está orquestado sobre una arquitectura *frontend* robusta e integrada, utilizando las siguientes herramientas:

  * **React (Library):** Empleado para la construcción de una **Interfaz de Usuario (UI) declarativa y basada en componentes**.
  * **Tailwind CSS (Framework):** **Framework CSS utilitario *on-demand*** para la implementación de un sistema de diseño altamente configurable y la aceleración del desarrollo UI/UX.
  * **Parcel (Web Bundler):** **Empaquetador de módulos (*bundler*) de configuración cero**, optimizando el proceso de *build* y el *Hot Module Replacement (HMR)* para la eficiencia del desarrollo.
  * **API de Gemini (Intelligence Layer):** Integrada como **motor de procesamiento de lenguaje natural (LLM)** para el análisis predictivo del mercado y la articulación de la lógica de *trading*.
  * **API de TTS (Output Layer):** Utilizada para la **síntesis de voz** en la entrega de notificaciones críticas del estado del *runtime* del bot.

## ✨ Capacidades Modulares y Funcionalidad Central

La plataforma expone un conjunto de funcionalidades diseñadas para la simulación completa de un ciclo de *trading* algorítmico:

| Módulo | Descripción Técnica |
| :--- | :--- |
| **Simulación de *Trading* en *Runtime*** | Ejecución de un **bucle de simulación discreta** que genera eventos de *buy/sell* pseudo-aleatorios, modelando la actividad transaccional del bot. |
| **Generación de *Forecasts*** | Invocación asíncrona a la **API de Gemini** para obtener análisis predictivos del mercado, sirviendo como *input* para las decisiones de la simulación. |
| **Heurísticas de Estrategia** | Capacidad programática para solicitar a la IA **sugerencias de estrategia** (*strategy recommendations*) basadas en el rendimiento histórico simulado del portafolio. |
| ***Trade Ledger*** **Histórico** | Mantenimiento de un **registro inmutable (log)** de todas las operaciones simuladas, permitiendo la trazabilidad y el *backtesting* manual. |
| **Explicación de Lógica (Justificación Algorítmica)** | Función que permite al usuario consultar a la IA para obtener una **explicación narrativa** (*rationale*) detallada detrás de una operación específica. |
| **Notificaciones Vocales de *Runtime*** | Utilización de la API de TTS para la **entrega auditiva de alertas críticas** y *status updates*, optimizando la monitorización en segundo plano. |
| **Adaptabilidad UI (*Responsive Design*)** | Implementación de una UI adaptable que asegura la **integridad de la presentación** en todos los *viewports* (móvil, tablet, *desktop*). |
| **Integración Web3 Simulada** | Simulación de la **conexión a un *wallet* Web3** (*placeholder* funcional) para inicializar el módulo de *trading* del bot. |

## 🚀 Procedimiento de Despliegue Local

Siga el protocolo estándar de Git y npm para la inicialización del entorno de desarrollo:

1.  **Clonar el Repositorio de Código Fuente:**
    ```bash
    git clone https://www.youtube.com/watch?v=3fn7ApOWE1k # Nota: La URL es un placeholder, se recomienda usar una URL de repositorio válida.
    ```
2.  **Acceder al Directorio Raíz del Proyecto:**
    ```bash
    cd defi-autopilot-engine
    ```
3.  **Instalar las Dependencias Definidas en `package.json`:**
    ```bash
    npm install
    ```
4.  **Iniciar el Servidor de Desarrollo:**
    ```bash
    npm start
    ```
    La aplicación se cargará en el navegador en la URL especificada por Parcel (típicamente `http://localhost:1234`).

## 📂 Arquitectura del Repositorio

| Directorio/Archivo | Función |
| :--- | :--- |
| `defi-autopilot-engine/` | Raíz del proyecto. |
| `├── index.html` | **Punto de Entrada DOM.** Define el *markup* base para el *script* de React. |
| `├── package.json` | **Manifiesto del Proyecto.** Gestiona dependencias, versiones y *scripts* de *runtime*. |
| `├── src/` | **Contenedor del Código Fuente.** |
| `│ ├── App.js` | **Componente Raíz de React.** Define la estructura y el *state* global de la aplicación. |
| `│ └── index.js` | **Bootstrap de Aplicación.** Monta el componente `App.js` en el DOM. |
| `└── README.md` | Documentación de alto nivel del proyecto. |

-----

## 🤝 Protocolo de Contribución

Se valoran las contribuciones al código base. Se solicita a los desarrolladores adherirse al flujo de trabajo de **Issues y Pull Requests (PR)**.

## 📜 Licenciamiento

El proyecto opera bajo los términos de la **Licencia MIT**, garantizando la máxima apertura y reutilización del código.
