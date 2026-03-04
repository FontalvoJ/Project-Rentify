export class AuthResponseDTO {
  constructor({ token, role, name }) {
    this.token = token;
    this.role = role;
    this.name = name;
  }
}
