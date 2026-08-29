import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import cep from "models/cep.js";

const router = createRouter();

router.post(postHanbler);

export default router.handler(controller.errorHandlers);

async function postHanbler(request, response) {
  const cepInputValue = await request.body.cep;

  const cepFound = await cep.findOneByCep(cepInputValue);

  return response.status(200).json(cepFound);
}
