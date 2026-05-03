import cron from "node-cron";

export const startReservationJobs = (reservationService) => {
  // Ejecutar cada minuto
  cron.schedule("* * * * *", async () => {
    console.log("⏰ Verificando reservas vencidas...");

    try {
      await reservationService.completeExpiredReservations();
    } catch (error) {
      console.error("Error en cron de reservas:", error);
    }
  });
};
