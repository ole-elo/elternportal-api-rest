import PortalClient from "./elternPortalClientCache";
import TelegramBot from "./telegramBot";
import * as fs from 'fs';
import * as path from 'path';


export default class ElternbriefSender {

  private lastSentElternbriefId: number;
  private intervalId: NodeJS.Timeout | null = null;
  private tBot: TelegramBot;
  private configFilePath = path.join(__dirname, 'conf');
  private configFile = path.resolve(this.configFilePath, 'config.json');

  constructor(bot: TelegramBot) {
    this.tBot = bot;
    this.lastSentElternbriefId = -1;
  }

  public startUpdate(interval: number) {
    this.intervalId = setInterval(() => {
      this.checkForNewElternbrief();
    }, interval);
  }

  private async checkForNewElternbrief() {
    let elternbriefe = await PortalClient.getInstance().getElternbriefe();
    const currentLastId = await this.getLastSentElternbriefId();
    console.log("New Elternbriefe will be checked. Last sent Elternbrief ID "+currentLastId);
    let newLastId = currentLastId;
    for (let i = 0; i < elternbriefe.length; i++) {
      if (elternbriefe[i].id && elternbriefe[i].id > currentLastId) {
        this.tBot.sendMessage("Neuer Elternbrief \"" + elternbriefe[i].title + "\" vom " + elternbriefe[i].date + " Id: " + elternbriefe[i].id + "\n" + elternbriefe[i].messageText);
        if(elternbriefe[i].link){
          this.tBot.sendFileFromBuffer((await PortalClient.getInstance().getElternbriefFile(elternbriefe[i])).buffer, elternbriefe[i].title + ".pdf");
        }
        console.log("Elternbrief "+elternbriefe[i].id +" has been sent.")
        if (elternbriefe[i].id > newLastId){
          newLastId = elternbriefe[i].id;
        }
      }else if(elternbriefe[i].id && elternbriefe[i].id <= currentLastId) {
        break;
      }
    }
    if (currentLastId != newLastId){
      this.setLastSentElternbriefId(newLastId);
    }
  }

  private async getLastSentElternbriefId(): Promise<number> {
    if (this.lastSentElternbriefId == -1) {
      try {
        const defaultConfig = {
          lastSentElternbriefId: this.lastSentElternbriefId
        };      
        if (!fs.existsSync(this.configFile)) {
          await this.initDefaultConfig();
        } else {
          const existingConfig = JSON.parse(await fs.promises.readFile(this.configFile, 'utf-8'));
          this.lastSentElternbriefId = existingConfig.lastSentElternbriefId;
        }
      } catch (error) {
        console.error('Error during reading config file :', error);
      }
    }
    return this.lastSentElternbriefId;
  }

  private async setLastSentElternbriefId(id: number){
    if (!fs.existsSync(this.configFile)) {
      await this.initDefaultConfig();
    } else {
      const existingConfig = JSON.parse(await fs.promises.readFile(this.configFile, 'utf-8'));
      const newConfig = {
        lastSentElternbriefId: id
      };    
      const updatedConfig = { ...existingConfig, ...newConfig };
      await fs.promises.writeFile(this.configFile, JSON.stringify(updatedConfig, null, 2), 'utf-8');
      this.lastSentElternbriefId = id;
      console.log('config.json updated with new lastElternbriefId '+id);
    }
  }

  private async initDefaultConfig(){
    const defaultConfig = {
      lastSentElternbriefId: this.lastSentElternbriefId
    };        
    console.log('Could not find '+this.configFile);
    await fs.promises.mkdir(this.configFilePath);
    await fs.promises.writeFile(this.configFile, JSON.stringify(defaultConfig, null, 2), 'utf-8');
    console.log('New file has been created!');
  }

}