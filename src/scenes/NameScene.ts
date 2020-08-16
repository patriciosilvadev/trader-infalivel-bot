import { BaseScene, Extra, Markup } from 'telegraf';
import CacheService from '../services/cache';
import { log } from '../logger';
import { confirmado, negado } from '../services/validate';

const nameScene = new BaseScene('name');

nameScene.command('reiniciar', ctx => {
    CacheService.clearAllUserData()
    return ctx.scene.enter('welcome')
})

nameScene.enter(async (ctx) => {
    if (!CacheService.get<string>('nome_completo')) {
        return await askForFullName(ctx);
    }
    await askForFullNameAgain(ctx);
})

nameScene.use(async (ctx) => {
    await confirmFullName(ctx);
    await saveFullName(ctx.message.text);
});

const askForFullName = async (ctx) => {
    await ctx.reply('Ok!');
    await ctx.reply('Qual é o seu nome completo?');
}

const askForFullNameAgain = async (ctx) => {
    await ctx.reply('Por favor, digite seu nome completo novamente:')
}

const confirmFullName = async (ctx) => {
    const confirmacao = Markup.inlineKeyboard([Markup.callbackButton('👍 Sim', 'sim'), Markup.callbackButton('👎 Não', 'nao')])
    await ctx.reply(`Confirmando... seu nome completo é ${ctx.message.text}?`, Extra.inReplyTo(ctx.update.message.message_id).markup(confirmacao));
    return ctx.scene.enter('confirm_name');
}

const saveFullName = async (fullname) => {
    log('salvou o nome')
    CacheService.saveUserData('nome_completo', fullname);
    log(`Nome completo definido ${fullname}`);
}

const confirmNameScene = new BaseScene('confirm_name');

confirmNameScene.action('sim', async (ctx) => {
    const nome = CacheService.get<string>('nome_completo');
    await ctx.reply(`Beleza, ${nome.includes(' ') ? nome.substring(0, nome.indexOf(' ')) : nome}!`);
    return ctx.scene.enter('phone');
});

confirmNameScene.action('nao', async (ctx) => {
    return ctx.scene.enter('name');
});

confirmNameScene.use(async (ctx) => {
    if (confirmado(ctx)) {
        const nome = CacheService.get<string>('nome_completo');
        await ctx.reply(`Beleza, ${nome.includes(' ') ? nome.substring(0, nome.indexOf(' ')) : nome}!`);
        return ctx.scene.enter('phone');
    }
    if (negado(ctx)) {
        return ctx.scene.enter('name');
    }
    await ctx.reply('Por favor, escolha uma das opções acima');
});

export { nameScene, confirmNameScene };
