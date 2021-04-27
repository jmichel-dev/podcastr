import Image from 'next/image';

import styles from './card.module.scss';

interface Episode {
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

interface CardProp {
  episode: Episode;
  key: string;
}

export default function CardItem({ episode, key }: CardProp) {
  return (
    <li key={key} className={styles.cardContainer}>
      <Image 
        width={360}
        height={200}
        src={episode.thumbnail}
        alt={episode.title}
        objectFit="cover"
      />

      <div className={styles.details}>
        <span>{episode.publishedAt}</span>
        <a href="">{episode.title}</a>
        <p>{episode.members}</p>
      </div>

      <div className={styles.actions}>
        <button type="button">  
          <img src="/play-green.svg" alt="Tocar episódio"/>
          <span>{episode.durationAsString}</span>
        </button>
      </div>
      
    </li>
  );
}