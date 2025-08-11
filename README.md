DeFi Autopilot Engine
Simulador de un bot de trading de IA para el ecosistema DeFi. Esta aplicación de demostración utiliza la API de Gemini para generar análisis de mercado y sugerencias de estrategia, junto con la tecnología TTS para notificaciones de voz.

Nota: Puedes reemplazar el placeholder de arriba con una captura de pantalla de tu aplicación.

🛠️ Tecnologías
Este proyecto está construido con las siguientes tecnologías:

React: Biblioteca de JavaScript para la construcción de interfaces de usuario.

Tailwind CSS: Un framework de CSS de bajo nivel para un diseño rápido y flexible.

Parcel: Empaquetador web de cero configuración para proyectos de React.

API de Gemini: Utilizada para generar pronósticos y explicaciones de trading con IA.

API de TTS (Text-to-Speech): Utilizada para proporcionar notificaciones de voz del bot.

✨ Características Principales
Simulación de trading en tiempo real: Simula operaciones de compra/venta de manera aleatoria para mostrar el comportamiento de un bot.

Análisis de mercado con IA: El bot utiliza la API de Gemini para generar pronósticos de mercado de forma periódica.

Sugerencias de estrategia: Pide a la IA que sugiera estrategias de trading basadas en el rendimiento del portafolio.

Registro de operaciones: Muestra un historial detallado de las últimas operaciones realizadas por el bot.

Explicación de operaciones: Permite al usuario pedir una explicación a la IA sobre la lógica detrás de una operación específica.

Notificaciones por voz: Utiliza la API de TTS de Gemini para leer el estado del bot o las explicaciones de las operaciones.

Diseño responsivo: La interfaz se adapta automáticamente a diferentes tamaños de pantalla, desde móviles hasta escritorios.

Integración con billetera (simulada): Simula la conexión a una billetera Web3 para iniciar la funcionalidad del bot.

🚀 Instalación y Uso
Sigue estos pasos para poner a funcionar el proyecto en tu máquina local:

Clona este repositorio:

git clone https://www.youtube.com/watch?v=3fn7ApOWE1k

Navega a la carpeta del proyecto:

cd defi-autopilot-engine

Instala las dependencias necesarias:

npm install

Inicia el servidor de desarrollo:

npm start

Abre tu navegador y visita la URL que te proporciona la terminal (normalmente http://localhost:1234).

📂 Estructura del proyecto
El proyecto está organizado en la siguiente estructura de carpetas y archivos:

defi-autopilot-engine/
├── index.html              # Punto de entrada de la aplicación
├── package.json            # Gestiona dependencias y scripts del proyecto
├── src/
│   ├── App.js              # El componente principal de React
│   └── index.js            # Inicia la aplicación y la renderiza en el DOM
└── README.md

🤝 Contribuciones
Las contribuciones son bienvenidas. Siéntete libre de abrir un issue o enviar un pull request.

📜 Licencia
Este proyecto está bajo la Licencia MIT.
