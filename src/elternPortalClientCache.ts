import  Cache from "timed-cache";
import * as dotevnv from "dotenv";
import { Schulaufgabe } from "./types/schulaufgabe";
import { Elternbrief } from "./types/elternbrief"
import { ElternPortalApiClient } from "./elternPortalClient";

export default class ElternPortalClientCache {

    private static _instance:ElternPortalClientCache = new ElternPortalClientCache();
    private cache : Cache<object>;
    private _client : ElternPortalApiClient;

    constructor() {
        if(ElternPortalClientCache._instance){
            throw new Error("Error: Instantiation failed: Use ElternPortalApiClient.getInstance() instead of new.");
        }
        dotevnv.config();
        this.cache = new Cache({ defaultTtl: Number(process.env.CACHETIME) * 1000 });
        this._client = new ElternPortalApiClient({
            short: process.env.SCHOOL as string,
            username: process.env.LOGIN as string,
            password: process.env.PASSWORD as string,
            kidId: 0, // Optional
        });
        ElternPortalClientCache._instance = this;
    }

    public static getInstance():ElternPortalClientCache
    {
        return ElternPortalClientCache._instance;
    }

    public async getSchulaufgaben():Promise<Schulaufgabe>{
        if(!this.cache.get("Schulaufgaben")){
            await this.checkClient();
            const schulaufgaben = await this._client.getSchulaufgabenplan();
            const filtered_schulaufgaben = schulaufgaben.filter(sa => sa.date >= new Date());
            const filtered_schulaufgaben_custom = filtered_schulaufgaben.map((sa) => {
                return {
                    ...sa,
                    daysLeft: Math.ceil((new Date(sa.date).getTime() - new Date().getTime())/ (1000 * 3600 * 24))
                }
            });
            this.cache.put("Schulaufgaben",filtered_schulaufgaben_custom);
        }
        return this.cache.get("Schulaufgaben") as Schulaufgabe;
    }

    public async getElternbriefe():Promise<Elternbrief>{
        if(!this.cache.get("Elternbriefe")){
            await this.checkClient();
            const elternbriefe = await this._client.getElternbriefe();
            this.cache.put("Elternbriefe",elternbriefe);
        }
        return this.cache.get("Elternbriefe") as Elternbrief;
    }

    public async getVertretungsplan():Promise<string>{
        await this.checkClient();
        const vertretungsplan = await this._client.getVertretungsplan();
        return vertretungsplan;
    }    

    private async checkClient():Promise<void>
    {   
        // Check if still logged in
        if((await this._client.getKids()).length == 0){
            console.log("Initializing client")
            await this._client.init();
        }
    }

}