const apiLogger = (req, res, next) => {
  const startTime = Date.now();
  const { method, originalUrl, body, query } = req;

  // Capture response
  const originalSend = res.json;
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const logData = {
      method,
      endpoint: originalUrl,
      payload: { body, query },
      response: data,
      duration: `${duration}ms`,
    };
    console.log('API Call:', JSON.stringify(logData, null, 2));
    originalSend.call(this, data);
  };

  next();
};

module.exports = apiLogger;

