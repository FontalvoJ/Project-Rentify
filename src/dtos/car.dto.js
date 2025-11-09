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
    if (!dto.brand || !dto.model || !dto.year) {
      throw new Error("Faltan campos de automóvil obligatorios");
    }
  }
}
