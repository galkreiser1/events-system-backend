const API_KEY = process.env.API_KEY || "12a01f33-0081-4be6-a525-89eddfa87416";

export const config = {
  AMQPUSER: "eayfadwk",
  AMQPPASS: "dQJ0QpNDB2ihFMPsiPkfEMYba5TL2Oya",
  DBUSER: "galkreiser",
  DBPASS: "bADRRlIAm7ke6K5N",
  API_KEY_HEADER: {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  },
};
