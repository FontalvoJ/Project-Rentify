import Role from "../models/Role";
import Companions from "../models/Companions";
import AutoAvail from "../models/AutoAvail";
import Systems from "../models/Systems";
import ResState from "../models/ResState";

export const initializeDefaults = async () => {
  try {
    const rolesCount = await Role.estimatedDocumentCount();
    if (rolesCount === 0) {
      await Promise.all([
        new Role({ name: "admin" }).save(),
        new Role({ name: "client" }).save(),
      ]);
      console.log("Roles creados");
    }

    const companionsCount = await Companions.estimatedDocumentCount();
    if (companionsCount === 0) {
      await Promise.all(
        [2, 4, 5, 7].map((num) => new Companions({ amount: num }).save())
      );
      console.log("Acompañantes creados");
    }

    const autoAvailCount = await AutoAvail.estimatedDocumentCount();
    if (autoAvailCount === 0) {
      await Promise.all([
        new AutoAvail({ status: "Disponible" }).save(),
        new AutoAvail({ status: "No Disponible" }).save(),
      ]);
      console.log("Disponibilidad de autos creada");
    }

    const systemsCount = await Systems.estimatedDocumentCount();
    if (systemsCount === 0) {
      await Promise.all([
        new Systems({ type: "Gasolina" }).save(),
        new Systems({ type: "Híbrido" }).save(),
        new Systems({ type: "Electrónico" }).save(),
        new Systems({ type: "Diesel" }).save(),
      ]);
      console.log("Sistemas de vehículos creados");
    }

    const resStateCount = await ResState.estimatedDocumentCount();
    if (resStateCount === 0) {
      await Promise.all([
        new ResState({ status: "Pendiente" }).save(),
        new ResState({ status: "Activa" }).save(),
        new ResState({ status: "Completada" }).save(),
        new ResState({ status: "Cancelada" }).save(),
      ]);
      console.log("Estados de reservación creados");
    }
  } catch (error) {
    console.error("Error al inicializar valores por defecto:", error.message);
  }
};
