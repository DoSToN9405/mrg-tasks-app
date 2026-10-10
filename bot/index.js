import { Bot, InlineKeyboard } from 'grammy';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:5173';

if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
  console.log(`
=============================================================
🤖 MRG MINER TELEGRAM BOT
=============================================================
⚠️  Токен бота не найден в переменных окружения!

Как запустить бота:
1. Откройте @BotFather в Telegram (https://t.me/BotFather)
2. Отправьте команду /newbot и следуйте инструкциям
3. Скопируйте полученный HTTP API Token
4. Создайте файл .env на основе .env.example:
   BOT_TOKEN=ваш_токен_от_BotFather
   WEBAPP_URL=https://ваш-домен-или-ngrok-url.ngrok-free.app
5. Запустите: npm run bot
=============================================================
  `);
  process.exit(1);
}

const bot = new Bot(BOT_TOKEN);

// /start command
bot.command('start', async (ctx) => {
  const userName = ctx.from?.first_name || 'друг';

  // Set persistent bottom Menu Button next to the keyboard
  try {
    await ctx.setChatMenuButton({
      type: 'web_app',
      text: '⚡ MRG Miner',
      web_app: { url: WEBAPP_URL },
    });
  } catch (e) {
    console.warn('Не удалось обновить menu_button:', e.message);
  }

  const keyboard = new InlineKeyboard()
    .webApp('⛏️ Запустить MRG Miner', WEBAPP_URL)
    .row()
    .url('📢 Официальный канал', 'https://t.me/mrgminer')
    .url('💬 Чат сообщества', 'https://t.me/MRGFun');

  await ctx.reply(
    `👋 *Привет, ${userName}!*\n\n` +
    `Добро пожаловать в *MRG Tasks* — официальное Telegram MiniApp для облачного майнинга токенов MRG на блокчейне GRAM / TON!\n\n` +
    `⚡ *Ваш майнер готов к запуску:*\n` +
    `• *Облачный майнинг 24/7* — получайте награды каждый час\n` +
    `• *Магазин 1000 уровней* — развивайте хешрейт до 5,000 TH/s\n` +
    `• *Реферальный сквад* — 10% пожизненная комиссия от друзей\n` +
    `• *Ежедневные задания* — 7-дневный стрик наград\n` +
    `• *Non-Custodial вывод* — прямо на ваш кошелек Tonkeeper\n\n` +
    `_Нажмите кнопку ниже, чтобы войти в приложение:_`,
    {
      parse_mode: 'Markdown',
      reply_markup: keyboard,
    }
  );
});

// /help command
bot.command('help', async (ctx) => {
  await ctx.reply(
    `📚 *Справка по MRG Tasks & Mining:*\n\n` +
    `• Для входа в приложение нажмите кнопку *«⚡ MRG Miner»* внизу слева.\n` +
    `• Контракт MRG Jetton: \`EQDj-zlSvj4Au154XjsU7ATzt13p8JjYEs0weVv1rVbCJSn0\`\n` +
    `• Купить на DEX: DeDust.io или SGRAM.fi\n` +
    `• Верификация аккаунта: @MRG_Verification_bot`,
    { parse_mode: 'Markdown' }
  );
});

// Start bot polling
bot.start({
  onStart: (botInfo) => {
    console.log(`🚀 Бот @${botInfo.username} запущен и слушает события!`);
    console.log(`🔗 WebApp URL настроен на: ${WEBAPP_URL}`);
  },
});
