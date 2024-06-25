const axios = require('axios');

const instance = axios.create({
  httpAgent: new (require('http')).Agent({ keepAlive: true }),
  httpsAgent: new (require('https')).Agent({ keepAlive: true }),
});

exports.handler = async (event) => {
  const BASE_URL = 'https://api.nhtsa.gov/';
  const PROXY = {
    recalls: 'recalls/recallsByVehicle',
    complaints: 'complaints/complaintsByVehicle',
  };

  console.log('Event:', JSON.stringify(event, null, 2));

  if (!event.pathParameters || !event.pathParameters.proxy) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Missing required path parameter: proxy' }),
    };
  }

  const path = event.pathParameters.proxy;
  const endpoint = PROXY[path];

  if (!endpoint) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: 'Invalid proxy path' }),
    };
  }

  const params = event.queryStringParameters || {};

  try {
    const response = await instance.get(`${BASE_URL}${endpoint}`, {
      params: { make: 'kia', model: 'telluride', modelYear: 2022, ...params },
    });

    console.log('Response:', JSON.stringify(response.data, null, 2));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    console.error('Error fetching data from NHTSA API:', error.message);
    console.error('Error stack trace:', error.stack);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
