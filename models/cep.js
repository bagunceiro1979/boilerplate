import database from "infra/database.js";
import { NotFoundError } from "infra/errors.js";

async function findOneByCep(cep) {
  const cepFound = await runSelectCep(cep);

  return cepFound;

  async function runSelectCep(cep) {
    const results = await database.query({
      text: `
      SELECT 
       * 
      FROM 
       streets_where_we_deliver 
      WHERE 
       cep = $1 
      LIMIT 1
      ;`,
      values: [cep],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        name: "NotFoundError",
        message: "Não realizamos entregas no CEP informado.",
        action:
          "No momento realizamos apenas em alguns bairros do município de Brumadinho em MG.",
        status_code: 404,
      });
    }
    if (results.rows[0].contemplated === false) {
      throw new NotFoundError({
        name: "NotFoundError",
        message: "Ainda não realizamos entregas no CEP informado.",
        action: `O CEP: ${results.rows[0].cep} está em analise pelo equipe de Logística.`,
        status_code: 404,
      });
    }
    return results.rows[0];
  }
}

const cep = {
  findOneByCep,
};

export default cep;
