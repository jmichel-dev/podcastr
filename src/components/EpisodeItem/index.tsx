import Image from 'next/image';
import Link from 'next/link';

import styles from './episode.module.scss';

type Episode = {
  id: string;
  title: string;
  members: string;
  description: string;
  thumbnail: string;
  duration: number;
  publishedAt: string;
  url: string;
  durationAsString: string;
}

type EpisodeProps = {
  episodes: Episode[];
  episodeList: Episode[];
  playList: (episodeList: Episode[], index: number) => void;
}

export default function EpisodeItem(
  { 
    episodes, 
    episodeList, 
    playList 
  }: EpisodeProps) {
  return (
    <ul className={styles.episodesList}>
      { episodes.map((episode, index) => {
        return (
          <li key={episode.id}>
            <Image 
              width={192} 
              height={192} 
              src={episode.thumbnail} 
              alt={episode.title} 
              objectFit="cover"
            />

            <div className={styles.details}>
              <Link href={`/episodes/${episode.id}`}>
                <a>{episode.title}</a>
              </Link>
              <p>{episode.members}</p>
              <span>{episode.publishedAt}</span>
              <span>{episode.durationAsString}</span>
            </div>

            <button 
              type="button" 
              onClick={() => playList(episodeList, index)}
            >
              <img src="/play-green.svg" alt="Tocar episódio"/>
            </button>
          </li>
        );
      })}
    </ul>
  );
}