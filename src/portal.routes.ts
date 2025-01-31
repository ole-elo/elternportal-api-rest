import express, {Request, Response} from "express"
//import { Kid } from "./kids.interface.ts"
import {StatusCodes} from "http-status-codes"
import PortalClient from "./elternPortalClientCache"
import { Schulaufgabe } from "./types/schulaufgabe";
//import { Elternbrief } from "./types/elternbrief";

const portalRoutes = express.Router();

/*
  portalRoutes.get('/stundenplan', async (req: Request, res: Response) => {
    console.log("stundenplan");
    const client = await PortalClient.getInstance().getElternPortalApiClient();
    const stundenplan = await client.getStundenplan();  
    res.json({ stundenplan });

  });
*/
  portalRoutes.get('/schulaufgaben', async (req: Request, res: Response) => {
    console.log("Schulaufgaben requested");
    const schulaufgaben = await PortalClient.getInstance().getSchulaufgaben();
    res.json({ schulaufgaben });
  });

  portalRoutes.get('/elternbriefe', async (req: Request, res: Response) => {
    console.log("Elternbriefe requested");
    const elternbriefe = await PortalClient.getInstance().getElternbriefe();
    res.json({ elternbriefe });
  });

  portalRoutes.get('/vertretungsplan', async (req: Request, res: Response) => {
    console.log("Vertretungsplan requested");
    if (req.query.html){
      const vertretungsplan = await PortalClient.getInstance().getVertretungsplanHTML();
      res.type('html');
      res.send(vertretungsplan);
      
  }else{
      const vertretungsplan = await PortalClient.getInstance().getVertretungsplan();
      res.json(Object.fromEntries(vertretungsplan));
    }
  });

  
export default portalRoutes;