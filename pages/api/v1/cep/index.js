import { createRouter } from "next-connect";
import database from "infra/database.js";
import controller from "infra/controller.js";
import { NotFoundError } from "infra/errors.js";

const router = createRouter();

router.post(postHanbler);

export default router.handler(controller.errorHandlers);

async function postHanbler(request, response) {
  const cepInputValue = await request.body.cep;

  const cepInputConsult = await database.query({
    text: "SELECT * FROM streets_where_we_deliver WHERE cep = $1 LIMIT 1;",
    values: [cepInputValue],
  });
  const results = await cepInputConsult.rows[0];

  if (!results) {
    throw new NotFoundError({
      name: "NotFoundError",
      message:
        "O Cep informado ainda não contemplado com nosso serviço de entrega.",
      action: "Obrigado pela atenção!",
      status_code: 404,
    });
  }
  return response.status(200).json(results);
}
