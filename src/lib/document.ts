/**
 * Utilitários de documento (CPF/CNPJ) e sanitização numérica.
 *
 * NOTA: Existe uma cópia paralela dessa lógica na edge function
 * `supabase/functions/sigilopay-create-pix/index.ts`. Ela roda em Deno
 * e não consegue importar deste bundle, portanto precisa ser mantida
 * em sincronia manualmente quando as regras mudarem.
 */

/** Remove qualquer caractere que não seja dígito. */
export const onlyDigits = (value = ""): string => value.replace(/\D/g, "");

/** True se a string é composta por um único dígito repetido (ex: "11111111111"). */
const isSameDigitSequence = (value: string): boolean => /^(\d)\1+$/.test(value);

/** Valida CPF pelos dois dígitos verificadores. Espera apenas dígitos (11 chars). */
export const isValidCpf = (cpf: string): boolean => {
  if (cpf.length !== 11 || isSameDigitSequence(cpf)) return false;
  const calcDigit = (length: number) => {
    const sum = cpf
      .slice(0, length)
      .split("")
      .reduce((acc, digit, index) => acc + Number(digit) * (length + 1 - index), 0);
    const digit = (sum * 10) % 11;
    return digit === 10 ? 0 : digit;
  };
  return calcDigit(9) === Number(cpf[9]) && calcDigit(10) === Number(cpf[10]);
};

/** Valida CNPJ pelos dois dígitos verificadores. Espera apenas dígitos (14 chars). */
export const isValidCnpj = (cnpj: string): boolean => {
  if (cnpj.length !== 14 || isSameDigitSequence(cnpj)) return false;
  const calcDigit = (base: string, weights: number[]) => {
    const sum = base
      .split("")
      .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const firstDigit = calcDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calcDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
};

/** Aceita CPF (11) ou CNPJ (14) já sanitizados. */
export const isValidDocument = (document: string): boolean =>
  document.length === 11
    ? isValidCpf(document)
    : document.length === 14
      ? isValidCnpj(document)
      : false;
