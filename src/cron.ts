import cron from "node-cron";
import { cleanupExpiredAccountsService } from "./modules/user/user.service";

export const initCronJobs = () => {
    // Se ejecuta todos los días a la medianoche "0 0 * * *"
    // Para pruebas puedes usar "* * * * *" (cada minuto)
    cron.schedule("0 0 * * *", async () => {
        try {
            await cleanupExpiredAccountsService();
        } catch (error) {
            console.error("[Cron] Error ejecutando tarea de eliminación de cuentas:", error);
        }
    });
    
    console.log("[Cron] Tareas programadas iniciadas correctamente.");
};
