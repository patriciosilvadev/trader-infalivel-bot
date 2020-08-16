import { BaseScene, Extra, Markup } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { confirmado, negado, validate } from '../services/validate';

const emailScene = new BaseScene('email');

emailScene.command('reiniciar', ctx => {
    CacheService.clearAllUserData()
    return ctx.scene.enter('welcome')
})

emailScene.enter(async (ctx) => {
    if (!CacheService.get<string>('email')) {
        return await askForEmail(ctx);
    }
    await askForEmailAgain(ctx);
});

const askForEmail = async (ctx) => {
    await ctx.reply('Ok!');
    await ctx.reply('Qual é o seu email?');
}

const askForEmailAgain = async (ctx) => {
    await ctx.reply('Por favor, digite seu email novamente:')
}

emailScene.use(async (ctx) => {
    await confirmEmail(ctx);
    await saveEmail(ctx.message.text);
});

const confirmEmail = async (ctx) => {
    const confirmacao = Markup.inlineKeyboard([Markup.callbackButton('👍 Sim', 'sim'), Markup.callbackButton('👎 Não', 'nao')])
    await ctx.reply(`Confirmando... seu email é ${ctx.message.text}?`, Extra.inReplyTo(ctx.update.message.message_id).markup(confirmacao));
    return ctx.scene.enter('confirm_email');
}

const saveEmail = async (email) => {
    CacheService.saveUserData('email', email);
    log(`Email definido ${email}`);
}

const confirmEmailScene = new BaseScene('confirm_email');

confirmEmailScene.action('sim', async (ctx) => {
    const email = CacheService.get<string>('email');
    const validation = validate('email', email);
    if (validation.temErro) {
        await ctx.reply(validation.mensagemDeErro);
        return ctx.scene.enter('email');
    }
    await ctx.reply(`Beleza!`);
    return ctx.scene.enter('analysis');
});

confirmEmailScene.action('nao', async (ctx) => {
    await ctx.reply('Por favor, digite seu telefone novamente:')
    return ctx.scene.enter('email');
});

confirmEmailScene.use(async (ctx) => {
    if (confirmado(ctx)) {
        const email = CacheService.get<string>('email');
        const validation = validate('email', email);
        if (validation.temErro) {
            await ctx.reply(validation.mensagemDeErro);
            return ctx.scene.enter('email');
        }
        await ctx.reply(`Beleza!`);
        return ctx.scene.enter('analysis');
    }
    if (negado(ctx)) {
        return ctx.scene.enter('email');
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

export { emailScene, confirmEmailScene };
