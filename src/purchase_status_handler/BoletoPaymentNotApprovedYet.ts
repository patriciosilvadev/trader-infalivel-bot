import AbstractPurchaseStatusHandler from "./AbstractPurchaseStatusHandler"
import { MonetizzePurchaseStatus } from "../model/MonetizzePurchaseStatus";
import { log } from '../logger';
import CacheService from '../services/cache';

const endConversation = async (ctx) => {
    log(`Conversa com ${ctx.chat.id} finalizada`)
    CacheService.clearAllUserData();
    return ctx.scene.leave();
}

export default class BoletoPaymentNotApprovedYetHandler extends AbstractPurchaseStatusHandler {

    async handle(purchaseStatus: MonetizzePurchaseStatus) {
        if (purchaseStatus === MonetizzePurchaseStatus.BOLETO_PAYMENT_NOT_APPROVED_YET) {
            log(`Pagamento de ${this._ctx.chat.id} foi em boleto e está aguardando pagamento`)
            await this._ctx.reply('Sua compra foi iniciada, porém o seu boleto ainda não foi pago/compensado. Você pode ver o status do seu boleto acessando monetizze.com.br . Quando estiver compensado volte e inicie uma conversa comigo novamente!')
            return await endConversation(this._ctx);
        } else {
            super.handle(purchaseStatus)
        }
    }
}