import { TelegramBotUiInfo } from '../models/tg-bot';

const basePath = 'assets/telegram-bots';

export const TG_BOTS: TelegramBotUiInfo[] = [
    {
        link: 'https://t.me/go_tg_musician_bot',
        description: 'This bot can find either similar songs by search query or find song by key words using Shazam and YouTube apis.',
        title: 'Musician Bot',
        img: `${basePath}/music-bot.jpg`
    }
] as const;
