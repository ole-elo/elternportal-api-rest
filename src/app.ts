import express from "express";
import * as dotevnv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import portalRoutes from "./portal.routes";
import TelegramBot from "./telegramBot";
import ElternbriefSender from "./elternbiefSender";

dotevnv.config()

if (!process.env.PORT) {
    console.log(`No port value specified...`)
}

const PORT = parseInt(process.env.PORT as string, 10)
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(cors())
app.use(helmet())
if(process.env.CSR_EXCLUDE){
  const cspOptions = {
      directives: {
        frameAncestors: ["'self'", process.env.CSR_EXCLUDE],
      },
    };
    app.use(helmet.contentSecurityPolicy(cspOptions));
}

app.use('/', portalRoutes)

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})

const tBot = new TelegramBot(process.env.BOT_TOKEN as string);
const elternbriefSender = new ElternbriefSender(tBot);
elternbriefSender.startUpdate(Number(process.env.ELTERNBRIEF_CHECK_INTERVAL));


//tBot.sendMessage();
//tBot.sendLocalFile();
