// Contrat OpenAPI de l'API, servi tel quel sur GET /api/openapi.json.
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Token Scanner API",
    version: "1.0.0",
    description:
      "Scanner defensif de tokens Solana - detection de signaux de rug pull/honeypot via mint/freeze authority, concentration des holders, mutabilite des metadata, verrouillage de la liquidite et extensions Token-2022 a risque.",
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "Requis uniquement si la variable d'environnement API_KEYS est definie cote serveur.",
      },
    },
    schemas: {
      CheckResult: {
        type: "object",
        properties: {
          passed: { type: "boolean" },
          score: { type: "number" },
          maxScore: { type: "number" },
          details: { type: "string" },
          raw: { type: "object", additionalProperties: true },
        },
        required: ["passed", "score", "maxScore", "details"],
      },
      ScanReport: {
        type: "object",
        properties: {
          mint: { type: "string" },
          timestamp: { type: "string", format: "date-time" },
          totalScore: { type: "number" },
          maxScore: { type: "number" },
          riskLevel: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
          checks: {
            type: "object",
            additionalProperties: { $ref: "#/components/schemas/CheckResult" },
          },
          errors: { type: "array", items: { type: "string" } },
        },
        required: ["mint", "timestamp", "totalScore", "maxScore", "riskLevel", "checks", "errors"],
      },
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
        required: ["error"],
      },
    },
  },
  security: [{ ApiKeyAuth: [] }],
  paths: {
    "/scan/{mint}": {
      get: {
        summary: "Scanne un mint Solana et retourne un score de risque",
        parameters: [
          {
            name: "mint",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Adresse du mint SPL Token (base58)",
          },
        ],
        responses: {
          "200": {
            description: "Rapport de scan",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ScanReport" } } },
          },
          "400": {
            description: "Adresse mint invalide",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "401": {
            description: "Cle API manquante ou invalide (si API_KEYS est configure)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "429": {
            description: "Trop de requetes",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
          "500": {
            description: "Erreur serveur",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
    "/history/{mint}": {
      get: {
        summary: "Historique des scans precedents pour un mint",
        parameters: [
          {
            name: "mint",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Historique",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    mint: { type: "string" },
                    count: { type: "number" },
                    history: { type: "array", items: { $ref: "#/components/schemas/ScanReport" } },
                  },
                },
              },
            },
          },
          "400": {
            description: "Adresse mint invalide",
            content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
          },
        },
      },
    },
  },
};
