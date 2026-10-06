const mineflayer = require('mineflayer');

function createBot() {
    const bot = mineflayer.createBot({
        host: 'logcraft.mcsh.io', // IP de tu servidor LogCraft
        port: 25565,               // Si usas un puerto diferente en tu hosting, cámbialo aquí
        username: 'BotLog',     // Nombre del bot
        version: false              // Autodetecta la versión (1.8 a 1.21+)
    });

    // Iniciar sesión automáticamente apenas entra al mundo
    bot.on('spawn', () => {
        console.log('[NPC] El bot ha aparecido correctamente en LogCraft.');
        
        setTimeout(() => {
            // Intenta iniciar sesión con la contraseña 'cubo16'
            bot.chat('/login cubo16');

            // Si es la primera vez que el bot entra al servidor y necesita registrarse,
            // descomenta la línea de abajo y comenta la de arriba:
            // bot.chat('/register cubo16 cubo16');
        }, 2000);
    });

    bot.on('login', () => {
        console.log('[NPC] Conexión establecida con LogCraft.');
    });

    bot.on('kicked', (reason) => {
        console.log(`[NPC] El servidor expulsó al bot por: ${reason}`);
    });

    // Rutina anti-AFK (interactuar con cofre cercano y saltar)
    setInterval(async () => {
        if (!bot || !bot.entity) return;

        try {
            const chestBlock = bot.findBlock({
                matching: bot.registry.blocksByName.chest ? bot.registry.blocksByName.chest.id : 54,
                maxDistance: 5
            });

            if (chestBlock) {
                console.log('[NPC] Interactuando con el contenedor...');
                const chest = await bot.openChest(chestBlock);
                await new Promise(resolve => setTimeout(resolve, 2000));
                chest.close();
                console.log('[NPC] Contenedor cerrado.');
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
            console.log('[NPC] Acción anti-inactividad ejecutada.');

        } catch (err) {
            console.log(`[NPC] Aviso en rutina anti-AFK: ${err.message}`);
        }
    }, 45000);

    // Auto-reconexión tras caídas
    bot.on('end', (reason) => {
        console.log(`[NPC] Conexión finalizada (${reason}). Reintentando en 15 segundos...`);
        setTimeout(createBot, 15000);
    });

    bot.on('error', (err) => console.log(`[NPC] Error de red: ${err.message}`));
}

createBot();
