export interface GameUiInfo {
    img: string;
    description: string;
    title: string;
    link: string;
    id: GameId;
    isDownloader: boolean;
}

const basePath = 'assets/games';

export const GAMES_IDS = {
    SPACE_MARINE_2: 'wh40k-space-marine-2',
    RUST: 'rust',
    CS_2: 'cs2',
    SPACE_SHOOTER: 'space-shooter',
    KNIGTH_PLATFORMER: 'knight-platformer',
    ASTEROIDS: 'asteroids',
    FLAPPY_BIRD: 'flappy-bird',
    SNAKE_MAC: 'snake-macos',
    SNAKE_WINDOWS: 'snake-windows',
    SNAKE_LINUX: 'snake-linux'
} as const;

export type GameId = (typeof GAMES_IDS)[keyof typeof GAMES_IDS];

export const GAMES: GameUiInfo[] = [
    {
        img: `${basePath}/terminal-snake.png`,
        description: `Classic snake game. You need to earn points eatting red squares of food.`,
        id: GAMES_IDS.SNAKE_MAC,
        link: `games/${GAMES_IDS.SNAKE_MAC}`,
        title: 'Snake game(MacOS)',
        isDownloader: true
    },
    {
        img: `${basePath}/terminal-snake.png`,
        description: `Classic snake game. You need to earn points eatting red squares of food.`,
        id: GAMES_IDS.SNAKE_WINDOWS,
        link: `games/${GAMES_IDS.SNAKE_WINDOWS}`,
        title: 'Snake game(Windows)',
        isDownloader: true
    },
    {
        img: `${basePath}/terminal-snake.png`,
        description: `Classic snake game. You need to earn points eatting red squares of food.`,
        id: GAMES_IDS.SNAKE_LINUX,
        link: `games/${GAMES_IDS.SNAKE_LINUX}`,
        title: 'Snake game(Linux)',
        isDownloader: true
    },
    {
        img: `${basePath}/knight-platformer.jpg`,
        description: `Basic template of platformer.`,
        id: GAMES_IDS.KNIGTH_PLATFORMER,
        link: `games/${GAMES_IDS.KNIGTH_PLATFORMER}`,
        title: "Knight's platformer",
        isDownloader: true
    },
    {
        img: `${basePath}/space-shooter.jpg`,
        description: `Classic space shooter.`,
        id: GAMES_IDS.SPACE_SHOOTER,
        link: `games/${GAMES_IDS.SPACE_SHOOTER}`,
        title: 'Space shooter',
        isDownloader: true
    },
    {
        img: `${basePath}/asteroids.jpg`,
        description: `This is a clone of the cult game "Asteroids" from Atari. 
The main idea is to score as many points as possible, as in all games created for slot machines.`,
        id: GAMES_IDS.ASTEROIDS,
        link: `games/${GAMES_IDS.ASTEROIDS}`,
        title: 'Asteroids',
        isDownloader: true
    }
] as const;
