export class SignUpDTO {
  constructor({ email, password, name }) {
    if (!email || !password) {
      throw new Error("Email y password son obligatorios");
    }
    this.email = email;
    this.password = password;
    this.name = name || "";
  }
}

export class ClientSignUpDTO extends SignUpDTO {
  constructor({ email, password, name, identification, address, contact }) {
    super({ email, password, name });

    if (!identification || !address || !contact) {
      throw new Error(
        "Los campos identification, address y contact son obligatorios para clientes"
      );
    }

    this.identification = identification;
    this.address = address;
    this.contact = contact;
  }
}

export class SignInDTO {
  constructor({ email, password }) {
    if (!email || !password) {
      throw new Error("Email y password son obligatorios");
    }
    this.email = email;
    this.password = password;
  }
}
