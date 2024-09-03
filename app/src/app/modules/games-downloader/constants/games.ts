interface Game {
    absPath: string;
    description: string;
    name: string;
    link: string;
    id: GameId;
}

const basePath = 'assets/icons';

export const GAMES_IDS = {
    VAMPIRE_SURVIVORS: 'vampire-sruvivors',
    RUST: 'rust',
    CS_2: 'cs2'
} as const;

type GameId = (typeof GAMES_IDS)[keyof typeof GAMES_IDS];

export const GAMES: Game[] = [
    {
        absPath: `${basePath}/linkedin.svg`,
        description: 'RTS GAME number 1',
        id: GAMES_IDS.VAMPIRE_SURVIVORS,
        link: '/404',
        name: 'Vampire Survivor'
    },
    {
        absPath: `${basePath}/linkedin.svg`,
        description: 'Shooter',
        id: GAMES_IDS.CS_2,
        link: '/404',
        name: 'CS 2.0'
    },
    {
        absPath: `${basePath}/linkedin.svg`,
        description: 'Survival game',
        id: GAMES_IDS.RUST,
        link: '/404',
        name: 'Rust'
    }
] as const;
