import express from "express";

import { loggerMiddleware } from "./middlewares/logger.middleware";
import { corsMiddlewareRouter } from "./middlewares/cors.middleware";
import { API_V1 } from "../config/global";
// Router
import { users_router } from "../routes/users.router";
import { lottery_router } from "../routes/lottery.router";
import { chips_router } from "../routes/chips.router";
import { betting_router } from "../routes/betting.router";
import { lottery_type_router } from "../routes/lottery-type.router";
import { accountstatement_router } from "../routes/accountstatement.router";
import { profitandloss_router } from "../routes/profitandloss.router";
import { thirdparty_profitandloss_router } from "../routes/thirdparty_profitandloss.router";
import { thirdparty_accountstatement_router } from "../routes/thirdparty_accountstatement.router";
import { chart_router } from "../routes/chart.router";
import { casino_router } from "../routes/casino.router";
// End

const app = express();
  app.use(loggerMiddleware);
  app.use(corsMiddlewareRouter);
  
app.use(API_V1, casino_router);
app.use(API_V1, users_router);
app.use(API_V1, lottery_router);
app.use(API_V1, lottery_type_router);
app.use(API_V1, chips_router);
app.use(API_V1, betting_router);
app.use(API_V1, accountstatement_router);
app.use(API_V1, thirdparty_accountstatement_router);
app.use(API_V1, profitandloss_router);
app.use(API_V1, thirdparty_profitandloss_router);
app.use(API_V1, chart_router);


app.get('/hello', (request, response) => {
  response.send({
    hostname: request.hostname,
    path: request.path,
    method: request.method,
  });
});

// export app
export { app };