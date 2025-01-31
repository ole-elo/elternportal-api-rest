import { Bot, MediaUpload } from "gramio";
import * as dotevnv from "dotenv";

export default class TelegramBot {

private bot : Bot;

constructor(token : string) {
    this.bot = new Bot(token)
        .command("start", (context) => context.send("Hi!"))
        .onStart(console.log);

    this.bot.start();
}

public async sendMessage(message:string){
    const result = await this.bot.api.sendMessage({
        suppress: true,
        chat_id: process.env.TELEGRAM_CHAT_ID as string,
        text: message,
    });
}


public async sendFileFromBuffer(buffer: Buffer, filename: string){
    const result = await this.bot.api.sendDocument({
        suppress: true,
        chat_id: process.env.TELEGRAM_CHAT_ID as string,
        document: MediaUpload.buffer(buffer, filename),
    })
}

public async getOwnLastMessages(){
    const result = await this.bot.api.getChat({
        chat_id: process.env.TELEGRAM_CHAT_ID as string,
    });
}

}