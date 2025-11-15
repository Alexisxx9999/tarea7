import { suma, resta } from "./index.js";

describe("Operaciones matemáticas", () => {
  test("suma de 1 + 2 debe ser 3", () => {
    expect(suma(1, 2)).toBe(3);
  });

  test("resta de 5 - 3 debe ser 2", () => {
    expect(resta(5, 3)).toBe(2);
  });

  test("suma con números negativos", () => {
    expect(suma(-1, -2)).toBe(-3);
  });

  test("resta resultando en negativo", () => {
    expect(resta(2, 5)).toBe(-3);
  });
});
