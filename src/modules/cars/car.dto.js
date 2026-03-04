export class CreateCarDto {
  constructor({
    brand,
    model,
    year,
    color,
    pricePerDay,
    location,
    imageUrl,
    power,
    systemId,
    companionTypeId,
  }) {
    this.brand = brand;
    this.model = model;
    this.year = year;
    this.color = color;
    this.pricePerDay = pricePerDay;
    this.location = location;
    this.imageUrl = imageUrl;
    this.power = power;
    this.systemId = systemId;
    this.companionTypeId = companionTypeId;
  }

  static validate(dto) {
    if (
      !dto.brand ||
      !dto.model ||
      dto.year === undefined ||
      !dto.color ||
      dto.pricePerDay === undefined ||
      !dto.location ||
      !dto.imageUrl ||
      dto.power === undefined ||
      !dto.systemId ||
      !dto.companionTypeId
    ) {
      throw new Error("Faltan campos obligatorios para crear el automóvil");
    }

    if (typeof dto.year !== "number") {
      throw new Error("El año debe ser un número");
    }

    if (typeof dto.pricePerDay !== "number") {
      throw new Error("El precio por día debe ser un número");
    }

    if (typeof dto.power !== "number") {
      throw new Error("La potencia debe ser un número");
    }
  }
}

export class UpdateCarDto {
  constructor(data) {
    this.brand = data.brand;
    this.model = data.model;
    this.year = data.year;
    this.color = data.color;
    this.pricePerDay = data.pricePerDay;
    this.location = data.location;
    this.imageUrl = data.imageUrl;
    this.isAvailable = data.isAvailable;
    this.power = data.power;
    this.systemId = data.systemId;
    this.companionTypeId = data.companionTypeId;
  }

  static validate(dto) {
    const hasAtLeastOneField = Object.values(dto).some(
      (value) => value !== undefined,
    );

    if (!hasAtLeastOneField) {
      throw new Error("Se requiere al menos un campo para actualizar");
    }

    if (dto.year !== undefined && typeof dto.year !== "number") {
      throw new Error("El año debe ser un número");
    }

    if (dto.pricePerDay !== undefined && typeof dto.pricePerDay !== "number") {
      throw new Error("El precio por día debe ser un número");
    }

    if (dto.isAvailable !== undefined && typeof dto.isAvailable !== "boolean") {
      throw new Error("La disponibilidad debe ser un valor booleano");
    }

    if (dto.power !== undefined && typeof dto.power !== "number") {
      throw new Error("La potencia debe ser un número");
    }
  }
}
