import { BaseScene, Extra, Markup } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { confirmado, negado, validate } from '../services/validate';

const phoneScene = new BaseScene('phone');

log(`Entrando em cena de TELEFONE`)

phoneScene.command('reiniciar', ctx => {
    log(`Reiniciando bot por ${ctx.chat.id}`)
    CacheService.clearAllUserData()
    return ctx.scene.enter('welcome')
})

phoneScene.command('parar', async ctx => {
    log(`Parando bot por ${ctx.chat.id}`)
    CacheService.clearAllUserData()
    return await ctx.scene.leave()
})


phoneScene.enter(async (ctx) => {
    if (!CacheService.getPhone()) {
        return await askForPhone(ctx);
    }
    await askForPhoneAgain(ctx);
});

const askForPhone = async (ctx) => {
    await ctx.reply('Ok!');
    await ctx.reply('Qual é o seu telefone com DDD?');
}

const askForPhoneAgain = async (ctx) => {
    await ctx.reply('Por favor, digite seu telefone novamente:')
}

phoneScene.use(async (ctx) => {
    await confirmPhone(ctx);
    await savePhoneNumber(ctx.message.text);
});

const confirmPhone = async (ctx) => {
    const confirmacao = Markup.inlineKeyboard([Markup.callbackButton('👍 Sim', 'sim'), Markup.callbackButton('👎 Não', 'nao')])
    await ctx.reply(`Confirmando... seu telefone é ${ctx.message.text}?`, Extra.inReplyTo(ctx.update.message.message_id).markup(confirmacao));
    return ctx.scene.enter('confirm_phone');
}

const savePhoneNumber = async (phone) => {
    CacheService.savePhone(phone);
    log(`Número de telefone definido ${phone}`);
}

const confirmPhoneScene = new BaseScene('confirm_phone');

confirmPhoneScene.action('sim', async (ctx) => {
    const telefone = CacheService.getPhone();
    const validation = validate('telefone', telefone);
    if (validation.temErro) {
        await ctx.reply(validation.mensagemDeErro);
        return ctx.scene.enter('phone');
    }
    await ctx.reply(`Beleza!`);
    return ctx.scene.enter('email');
});

confirmPhoneScene.action('nao', async (ctx) => {
    await ctx.reply('Por favor, digite seu telefone novamente:')
    return ctx.scene.enter('phone');
});

confirmPhoneScene.use(async (ctx) => {
    if (confirmado(ctx)) {
        const telefone = CacheService.getPhone();
        const validation = validate('telefone', telefone);
        if (validation.temErro) {
            await ctx.reply(validation.mensagemDeErro);
            return ctx.scene.enter('phone');
        }
        await ctx.reply(`Beleza!`);
        return ctx.scene.enter('email');
    }
    if (negado(ctx)) {
        return ctx.scene.enter('phone');
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

export { phoneScene, confirmPhoneScene };
