import { useState, useEffect } from 'react';

// Función auxiliar para convertir Base64 a ArrayBuffer
const base64ToArrayBuffer = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
};

// Función auxiliar para convertir PCM a formato WAV
const pcmToWav = (pcmData, sampleRate) => {
    const numChannels = 1;
    const pcm16 = new Int16Array(pcmData);
    const wavBuffer = new ArrayBuffer(44 + pcm16.length * 2);
    const view = new DataView(wavBuffer);
    
    // Encabezado RIFF
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcm16.length * 2, true);
    writeString(view, 8, 'WAVE');

    // Formato de encabezado (subchunk1)
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);

    // Datos (subchunk2)
    writeString(view, 36, 'data');
    view.setUint32(40, pcm16.length * 2, true);
    
    // Escribir datos PCM
    let offset = 44;
    for (let i = 0; i < pcm16.length; i++, offset += 2) {
        view.setInt16(offset, pcm16[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
};

// Función auxiliar para escribir cadenas en el DataView
const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
};

// ===========================================================================
//  Componente principal de la aplicación
// ===========================================================================
const App = () => {
    // Estado global de la aplicación
    const [page, setPage] = useState('home'); // 'home' o 'portfolio'
    const [isTrading, setIsTrading] = useState(false);
    const [portfolio, setPortfolio] = useState({
        balance: 1000,
        initialBalance: 1000,
        profit: 0
    });
    const [tradeLog, setTradeLog] = useState([]);
    const [statusMessage, setStatusMessage] = useState('Haz clic en "Conectar Billetera" para empezar.');
    const [geminiPrediction, setGeminiPrediction] = useState('');
    const [walletAddress, setWalletAddress] = useState(null);
    const [strategySuggestion, setStrategySuggestion] = useState('');
    const [isLoadingStrategy, setIsLoadingStrategy] = useState(false);
    const [isReadingStatus, setIsReadingStatus] = useState(false);
    const [readingTradeId, setReadingTradeId] = useState(null);

    // Este hook useEffect simula la actividad de trading del bot
    useEffect(() => {
        let tradingInterval;

        if (isTrading) {
            setStatusMessage('El bot de IA está analizando el mercado...');
            callGeminiAPI(); 
            
            tradingInterval = setInterval(() => {
                performTrade();
            }, 3000);
        } else {
            clearInterval(tradingInterval);
            setStatusMessage('El bot de IA está detenido.');
        }

        return () => clearInterval(tradingInterval);
    }, [isTrading]);

    // Función para llamar a la API de Gemini para un pronóstico de trading
    const callGeminiAPI = async () => {
        const prompt = 'Genera un breve pronóstico de mercado (máximo 2 oraciones) para una IA de trading en DeFi. Proporciona una idea general sobre si el mercado está al alza o a la baja.';
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = ""
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setGeminiPrediction(text);
            } else {
                console.error("Gemini API returned an unexpected response structure.");
                setGeminiPrediction('El bot de IA está analizando el mercado...');
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            setGeminiPrediction('El bot de IA ha encontrado un error. Operando en modo predeterminado.');
        }
    };

    // Función para explicar una operación usando Gemini
    const explainTrade = async (tradeId, amount) => {
        const tradeIndex = tradeLog.findIndex(trade => trade.id === tradeId);
        const tradeToUpdate = tradeLog[tradeIndex];
        if (tradeToUpdate.explanation) {
            const newTradeLog = [...tradeLog];
            newTradeLog[tradeIndex].showExplanation = !newTradeLog[tradeIndex].showExplanation;
            setTradeLog(newTradeLog);
            return;
        }

        const newTradeLog = [...tradeLog];
        newTradeLog[tradeIndex].isLoadingExplanation = true;
        setTradeLog(newTradeLog);

        const prompt = `Explica en 1 o 2 oraciones por qué un bot de trading de IA en DeFi podría haber realizado una operación con un resultado de ${amount.toFixed(2)}. El pronóstico del mercado es: "${geminiPrediction}".`;
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = ""
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            const newLog = [...tradeLog];
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                newLog[tradeIndex].explanation = text;
            } else {
                newLog[tradeIndex].explanation = 'No se pudo generar una explicación. Inténtalo de nuevo.';
            }
            newLog[tradeIndex].isLoadingExplanation = false;
            newLog[tradeIndex].showExplanation = true;
            setTradeLog(newLog);
        } catch (error) {
            console.error('Error calling Gemini API for explanation:', error);
            const newLog = [...tradeLog];
            newLog[tradeIndex].explanation = 'Error al conectar con la IA. Por favor, inténtalo de nuevo.';
            newLog[tradeIndex].isLoadingExplanation = false;
            newLog[tradeIndex].showExplanation = true;
            setTradeLog(newLog);
        }
    };

    // Función para sugerir una estrategia usando Gemini
    const suggestStrategy = async () => {
        setIsLoadingStrategy(true);
        setStrategySuggestion('');
        
        const prompt = `Basado en un saldo de $${portfolio.balance.toFixed(2)} y una ganancia de $${portfolio.profit.toFixed(2)}, sugiere una estrategia de trading general de alto nivel (máximo 3 oraciones) que un usuario novato podría considerar en el mundo DeFi.`;
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };
        const apiKey = ""
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                setStrategySuggestion(text);
            } else {
                setStrategySuggestion('No se pudo generar una sugerencia de estrategia. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error calling Gemini API for strategy suggestion:', error);
            setStrategySuggestion('Error al conectar con la IA. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoadingStrategy(false);
        }
    };
    
    // Nueva función para leer el estado del bot usando TTS
    const readStatus = async () => {
        setIsReadingStatus(true);
        const textToRead = `${statusMessage} El pronóstico del mercado es: ${geminiPrediction}.`;
        const payload = {
            contents: [{
                parts: [{ text: textToRead }]
            }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Puck" }
                    }
                }
            },
            model: "gemini-2.5-flash-preview-tts"
        };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            const part = result?.candidates?.[0]?.content?.parts?.[0];
            const audioData = part?.inlineData?.data;
            const mimeType = part?.inlineData?.mimeType;

            if (audioData && mimeType && mimeType.startsWith("audio/")) {
                const match = mimeType.match(/rate=(\d+)/);
                const sampleRate = match ? parseInt(match[1], 10) : 16000;
                const pcmData = base64ToArrayBuffer(audioData);
                const wavBlob = pcmToWav(pcmData, sampleRate);
                const audioUrl = URL.createObjectURL(wavBlob);
                const audio = new Audio(audioUrl);
                audio.play();
            } else {
                console.error("Respuesta de audio no válida de la API de Gemini.");
            }
        } catch (error) {
            console.error('Error llamando a la API de TTS:', error);
        } finally {
            setIsReadingStatus(false);
        }
    };

    // Nueva función para leer la explicación de una operación
    const readTradeExplanation = async (tradeId) => {
        const trade = tradeLog.find(t => t.id === tradeId);
        if (!trade || !trade.explanation) return;

        setReadingTradeId(tradeId);
        const textToRead = `Explicación para la operación: ${trade.explanation}`;
        const payload = {
            contents: [{
                parts: [{ text: textToRead }]
            }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: "Puck" }
                    }
                }
            },
            model: "gemini-2.5-flash-preview-tts"
        };
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            const part = result?.candidates?.[0]?.content?.parts?.[0];
            const audioData = part?.inlineData?.data;
            const mimeType = part?.inlineData?.mimeType;
            if (audioData && mimeType && mimeType.startsWith("audio/")) {
                const match = mimeType.match(/rate=(\d+)/);
                const sampleRate = match ? parseInt(match[1], 10) : 16000;
                const pcmData = base64ToArrayBuffer(audioData);
                const wavBlob = pcmToWav(pcmData, sampleRate);
                const audioUrl = URL.createObjectURL(wavBlob);
                const audio = new Audio(audioUrl);
                audio.play();
            } else {
                console.error("Respuesta de audio no válida de la API de Gemini.");
            }
        } catch (error) {
            console.error('Error llamando a la API de TTS:', error);
        } finally {
            setReadingTradeId(null);
        }
    };

    // Esta función simula una sola operación
    const performTrade = () => {
        const now = new Date();
        const profitLoss = (Math.random() * 15 - 5);
        const newBalance = portfolio.balance + profitLoss;
        const newProfit = newBalance - portfolio.initialBalance;

        setPortfolio(prevPortfolio => ({
            ...prevPortfolio,
            balance: newBalance,
            profit: newProfit
        }));

        const newTrade = {
            id: Date.now(),
            timestamp: now.toLocaleTimeString(),
            amount: profitLoss,
            balance: newBalance,
            explanation: '',
            showExplanation: false,
            isLoadingExplanation: false,
        };
        setTradeLog(prevLog => [newTrade, ...prevLog].slice(0, 10)); 
        setStatusMessage('Realizando una operación de trading...');
    };

    // Manejador para iniciar el bot de trading
    const handleStartTrading = () => {
        if (!isTrading && walletAddress) {
            setIsTrading(true);
            setTradeLog([]);
            setGeminiPrediction('');
            setStrategySuggestion('');
        }
    };

    // Manejador para detener el bot de trading
    const handleStopTrading = () => {
        setIsTrading(false);
    };

    // Función para manejar la conexión de la billetera
    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setWalletAddress(accounts[0]);
                setStatusMessage('Billetera conectada. Ahora puedes iniciar el bot de trading.');
            } catch (error) {
                console.error("User denied account access or another error occurred.");
                setStatusMessage('No se pudo conectar la billetera.');
            }
        } else {
            setStatusMessage('No se detectó una billetera Web3 (como MetaMask).');
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
            modal.innerHTML = `
                <div class="bg-white dark:bg-blue-900 p-8 rounded-lg shadow-xl text-center max-w-sm">
                    <h3 class="text-xl font-bold mb-4">¡MetaMask no detectado!</h3>
                    <p class="mb-6">Por favor, instala MetaMask o una extensión de billetera similar para usar esta aplicación.</p>
                    <button class="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">Aceptar</button>
                </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector('button').addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        }
    };

    // Función para acortar la dirección de la billetera para la visualización
    const shortenAddress = (address) => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    };

    // Renderiza la vista correcta según el estado de la página
    const renderPage = () => {
        switch (page) {
            case 'home':
                return (
                    <HomeView
                        isTrading={isTrading}
                        handleStartTrading={handleStartTrading}
                        handleStopTrading={handleStopTrading}
                        statusMessage={statusMessage}
                        geminiPrediction={geminiPrediction}
                        suggestStrategy={suggestStrategy}
                        isLoadingStrategy={isLoadingStrategy}
                        strategySuggestion={strategySuggestion}
                        setPage={setPage}
                        readStatus={readStatus}
                        isReadingStatus={isReadingStatus}
                    />
                );
            case 'portfolio':
                return (
                    <PortfolioView
                        portfolio={portfolio}
                        tradeLog={tradeLog}
                        explainTrade={explainTrade}
                        setPage={setPage}
                        readTradeExplanation={readTradeExplanation}
                        readingTradeId={readingTradeId}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <>
            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #e5e7eb;
                    border-radius: 10px;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-track {
                    background: #1e3a8a; /* Azul profundo */
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #9ca3af;
                    border-radius: 10px;
                    border: 2px solid #e5e7eb;
                }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #60a5fa; /* Azul más claro */
                    border: 2px solid #1e3a8a; /* Azul profundo */
                }
                `}
            </style>
            <div className="min-h-screen bg-gray-100 dark:bg-blue-950 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4 transition-colors duration-300">
                <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl bg-white dark:bg-blue-900 rounded-xl shadow-2xl p-4 md:p-8 space-y-4 md:space-y-8">
                    <header className="flex justify-between items-center mb-4 md:mb-6">
                        <div className="flex-grow flex items-center justify-center space-x-2 text-center">
                            {/* Espacio para el logo */}
                            <img src="https://placehold.co/40x40/1f2937/d1d5db?text=Logo" alt="Logo de la Empresa" className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
                            <h1 className="text-2xl md:text-3xl font-extrabold text-green-600 dark:text-purple-500">Motor de Trading</h1>
                        </div>
                        <div className="flex-shrink-0 ml-2 md:ml-4">
                            {!walletAddress ? (
                                <button
                                    onClick={connectWallet}
                                    className="py-1 px-3 md:py-2 md:px-4 rounded-full text-xs md:text-sm text-white font-bold transition-transform transform hover:scale-105 duration-300 bg-blue-500 hover:bg-blue-600"
                                >
                                    Conectar Billetera
                                </button>
                            ) : (
                                <div className="p-1 md:p-2 bg-gray-100 dark:bg-blue-800 rounded-full shadow-inner">
                                    <p className="text-xs md:text-sm font-bold text-gray-700 dark:text-blue-100">{shortenAddress(walletAddress)}</p>
                                </div>
                            )}
                        </div>
                    </header>
                    {renderPage()}
                </div>
            </div>
        </>
    );
};

// ===========================================================================
//  Componente de la vista principal (Home)
// ===========================================================================
const HomeView = ({
    isTrading,
    handleStartTrading,
    handleStopTrading,
    statusMessage,
    geminiPrediction,
    suggestStrategy,
    isLoadingStrategy,
    strategySuggestion,
    setPage,
    readStatus,
    isReadingStatus
}) => {
    return (
        <section className="flex flex-col gap-4 md:gap-8">
            <div className="p-4 md:p-6 bg-gray-50 dark:bg-blue-800 rounded-xl shadow-md space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2 md:mb-4">Estado del Bot</h2>
                <div className="text-center space-y-4">
                    <button
                        onClick={isTrading ? handleStopTrading : handleStartTrading}
                        className={`w-full py-2 px-4 md:py-3 md:px-6 rounded-lg text-white font-bold transition-transform transform hover:scale-105 duration-300 ${
                            isTrading ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        } disabled:bg-gray-400 disabled:hover:scale-100 disabled:cursor-not-allowed`}
                    >
                        {isTrading ? 'Detener Bot' : 'Iniciar Bot'}
                    </button>
                    <button
                        onClick={suggestStrategy}
                        disabled={isTrading || isLoadingStrategy}
                        className="w-full py-2 px-4 md:py-3 md:px-6 rounded-lg text-white font-bold transition-transform transform hover:scale-105 duration-300 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                        Sugerir Estrategia ✨
                    </button>
                    <button
                        onClick={readStatus}
                        disabled={isReadingStatus || !statusMessage}
                        className="w-full py-2 px-4 md:py-3 md:px-6 rounded-lg text-white font-bold transition-transform transform hover:scale-105 duration-300 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    >
                        {isReadingStatus ? 'Leyendo...' : 'Leer estado del bot ✨'}
                    </button>
                    <button
                        onClick={() => setPage('portfolio')}
                        className="w-full py-2 px-4 md:py-3 md:px-6 rounded-lg text-white font-bold transition-transform transform hover:scale-105 duration-300 bg-gray-500 hover:bg-gray-600"
                    >
                        Ver Portafolio 📈
                    </button>
                </div>
                <div className={`p-3 md:p-4 rounded-lg text-center font-semibold ${
                    isTrading ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                }`}>
                    Estado: {isTrading ? 'Operando' : 'Detenido'}
                </div>
                <p className="text-gray-700 dark:text-blue-200 text-center text-sm md:text-base">{statusMessage}</p>
                {geminiPrediction && (
                    <div className="p-3 md:p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-lg shadow-inner">
                        <p className="font-bold">Análisis de IA:</p>
                        <p className="text-xs md:text-sm">{geminiPrediction}</p>
                    </div>
                )}
                {isLoadingStrategy && (
                    <div className="p-3 md:p-4 text-center text-gray-500 dark:text-blue-300 italic text-sm md:text-base">Cargando sugerencia de estrategia...</div>
                )}
                {strategySuggestion && (
                    <div className="p-3 md:p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg shadow-inner">
                        <p className="font-bold">Sugerencia de Estrategia de la IA:</p>
                        <p className="text-xs md:text-sm">{strategySuggestion}</p>
                    </div>
                )}
            </div>
        </section>
    );
};

// ===========================================================================
//  Componente de la vista del Portafolio
// ===========================================================================
const PortfolioView = ({ portfolio, tradeLog, explainTrade, setPage, readTradeExplanation, readingTradeId }) => {
    const getProfitPercentage = () => {
        if (portfolio.initialBalance === 0) return '0.00%';
        const percentage = ((portfolio.balance - portfolio.initialBalance) / portfolio.initialBalance) * 100;
        return `${percentage.toFixed(2)}%`;
    };

    return (
        <section className="flex flex-col gap-4 md:gap-8">
            <div className="p-4 md:p-6 bg-gray-50 dark:bg-blue-800 rounded-xl shadow-md">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-2 md:mb-4">Tu Portafolio</h2>
                    <button
                        onClick={() => setPage('home')}
                        className="py-2 px-4 rounded-lg text-white font-bold transition-transform transform hover:scale-105 duration-300 bg-gray-500 hover:bg-gray-600"
                    >
                        Volver al Control 🤖
                    </button>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm md:text-lg font-semibold text-gray-600 dark:text-blue-200">Saldo Actual:</span>
                    <span className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                        ${portfolio.balance.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm md:text-lg font-semibold text-gray-600 dark:text-blue-200">Ganancias/Pérdidas:</span>
                    <span className={`text-xl md:text-2xl font-bold ${portfolio.profit >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                        ${portfolio.profit.toFixed(2)} ({getProfitPercentage()})
                    </span>
                </div>
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-100 dark:bg-blue-950 rounded-lg shadow-inner">
                    <h3 className="text-lg md:text-xl font-bold mb-2">Registro de Operaciones</h3>
                    <div className="h-48 overflow-y-auto custom-scrollbar">
                        {tradeLog.length > 0 ? (
                            tradeLog.map(trade => (
                                <div key={trade.id} className="text-xs md:text-sm py-2 border-b border-gray-200 dark:border-blue-700 last:border-b-0">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 dark:text-blue-300">{trade.timestamp}</span>
                                        <span className={`font-semibold ${trade.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {trade.amount >= 0 ? 'Compra +' : 'Venta -'} ${Math.abs(trade.amount).toFixed(2)}
                                        </span>
                                        <div className="space-x-1 md:space-x-2">
                                            <button
                                                onClick={() => explainTrade(trade.id, trade.amount)}
                                                className="px-2 py-1 text-xs text-white bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                                                disabled={trade.isLoadingExplanation}
                                            >
                                                {trade.isLoadingExplanation ? 'Cargando...' : 'Explicar ✨'}
                                            </button>
                                            <button
                                                onClick={() => readTradeExplanation(trade.id)}
                                                className="px-2 py-1 text-xs text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                                                disabled={readingTradeId === trade.id || !trade.explanation}
                                            >
                                                {readingTradeId === trade.id ? 'Leyendo...' : 'Leer ✨'}
                                            </button>
                                        </div>
                                    </div>
                                    {trade.showExplanation && (
                                        <div className="mt-2 p-2 bg-gray-200 dark:bg-blue-700 rounded-md">
                                            <p className="text-xs text-gray-800 dark:text-white italic">
                                                {trade.explanation}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 dark:text-blue-300 italic mt-8 text-sm md:text-base">El registro de operaciones está vacío.</p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default App;
