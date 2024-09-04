export interface Game {
    img: string;
    description: string;
    title: string;
    link: string;
    id: GameId;
}

const basePath = 'assets/icons';

export const GAMES_IDS = {
    VAMPIRE_SURVIVORS: 'vampire-sruvivors',
    RUST: 'rust',
    CS_2: 'cs2',
    FLAPPY_BIRD: 'FLAPPY_BIRD'
} as const;

export type GameId = (typeof GAMES_IDS)[keyof typeof GAMES_IDS];

export const GAMES: Game[] = [
    {
        img: `${basePath}/linkedin.svg`,
        description: 'RTS GAME',
        id: GAMES_IDS.VAMPIRE_SURVIVORS,
        link: '/404',
        title: 'Vampire Survivor'
    },
    {
        img: `${basePath}/linkedin.svg`,
        description: 'Shooter',
        id: GAMES_IDS.CS_2,
        link: '/404',
        title: 'CS 2.0'
    },
    {
        img: `${basePath}/linkedin.svg`,
        description: 'Survival game',
        id: GAMES_IDS.RUST,
        link: '/404',
        title: 'Rust'
    },
    {
        img: `${basePath}/linkedin.svg`,
        description: 'Platformer',
        id: GAMES_IDS.FLAPPY_BIRD,
        link: '/404',
        title: 'Flappy bird'
    }
] as const;
