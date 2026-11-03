 import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Hospitality API',
    version: '1.0.0',
    description: 'Nevotek Hotel Hospitality API',
  },
  servers: [
    {
      url: '/',
      description: 'Current API host',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/**/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
