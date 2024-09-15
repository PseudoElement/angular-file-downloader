import { ENVIRONMENT } from 'src/environments/environment';

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
    FLAPPY_BIRD: 'flappy-bird'
} as const;

export type GameId = (typeof GAMES_IDS)[keyof typeof GAMES_IDS];

export const GAMES: GameUiInfo[] = [
    {
        img: `${basePath}/knight-platformer.jpg`,
        description: `Basic template of platformer.`,
        id: GAMES_IDS.KNIGTH_PLATFORMER,
        link: `${ENVIRONMENT.apiBaseUrl}/games/${GAMES_IDS.KNIGTH_PLATFORMER}`,
        title: "Knight's platformer",
        isDownloader: true
    },
    {
        img: `${basePath}/space-shooter.jpg`,
        description: `Classic space shooter.`,
        id: GAMES_IDS.SPACE_SHOOTER,
        link: `${ENVIRONMENT.apiBaseUrl}/games/${GAMES_IDS.SPACE_SHOOTER}`,
        title: 'Space shooter',
        isDownloader: true
    },
    {
        img: `${basePath}/asteroids.jpg`,
        description: `This is a clone of the cult game "Asteroids" from Atari. 
The main idea is to score as many points as possible, as in all games created for slot machines.`,
        id: GAMES_IDS.ASTEROIDS,
        link: `${ENVIRONMENT.apiBaseUrl}/games/${GAMES_IDS.ASTEROIDS}`,
        title: 'Asteroids',
        isDownloader: true
    },
    {
        img: `${basePath}/flappy-bird.jpg`,
        description: `Legendary "Flappy Bird" game.`,
        id: GAMES_IDS.FLAPPY_BIRD,
        link: `${ENVIRONMENT.apiBaseUrl}/games/${GAMES_IDS.FLAPPY_BIRD}`,
        title: 'Flappy Bird',
        isDownloader: true
    },
    {
        img: `${basePath}/space-marine-2.jpg`,
        description: `Embody the superhuman skill and brutality of a Space Marine.
Unleash deadly abilities and devastating weaponry to obliterate the relentless Tyranid swarms.
Defend the Imperium in spectacular third-person action in solo or multiplayer modes.`,
        id: GAMES_IDS.SPACE_MARINE_2,
        link: 'https://store.steampowered.com/app/2183900/Warhammer_40000_Space_Marine_2',
        title: 'Warhammer 40000 Space Marine 2',
        isDownloader: false
    },
    {
        img: `${basePath}/cs2.jpg`,
        description: `For over two decades, Counter-Strike has offered an elite competitive experience,
one shaped by millions of players from across the globe. And now the next chapter in the CS story is about to begin. This is Counter-Strike 2.`,
        id: GAMES_IDS.CS_2,
        link: 'https://store.steampowered.com/app/730/CounterStrike_2',
        title: 'CS 2.0',
        isDownloader: false
    },
    {
        img: `${basePath}/rust.webp`,
        description: `Survival game. The only aim in Rust is to survive.
Everything wants you to die - the island’s wildlife and other inhabitants, the environment, other survivors. Do whatever it takes to last another night.`,
        id: GAMES_IDS.RUST,
        link: 'https://store.steampowered.com/app/252490/Rust',
        title: 'Rust',
        isDownloader: false
    }
] as const;
