import { GetStaticProps } from 'next'
import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/converter';

import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';
import EpisodeItem from '../components/EpisodeItem'
import CardItem from '../components/CardItem'

type Episodes = {
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

type HomeProps = {
  latestEpisodes: Episodes[];
  allEpisodes: Episodes[];
}

export default function Home({
  latestEpisodes,
  allEpisodes,
}: HomeProps) {
  const { playList } = usePlayer();
  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homePage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>
      <section>
        <h2>Ultimos lançamentos</h2>

        <EpisodeItem 
          episodes={latestEpisodes}
          episodeList={episodeList}
          playList={(episodeList, index) => playList(episodeList, index)}
        />
      </section>
      
      <section>
        <h2>Mais ouvidos</h2>
        <ul className={styles.horizontalList}>
          {
            allEpisodes.map(episode => {
              return (
                <CardItem 
                  episode={episode}
                  key={episode.id}
                />
              );
            })
          }
        </ul>
        
      </section>

      <section className={styles.allEpisodes}>
          <h2>Todos os espisódios</h2>

          <table cellSpacing={0}>
            <thead>
              <tr>
                <th></th>
                <th>Podcast</th>
                <th>Integrantes</th>
                <th>Data</th>
                <th>Duração</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              { allEpisodes.map((episode, index) => {
                return (
                  <tr key={episode.id}>
                    <td style={{ width: 72 }}>
                      <Image
                        width={120}
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />
                    </td>
                    <td>
                      <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                      </Link>
                    </td>
                    <td>{episode.members}</td>
                    <td style={{ width: 100 }}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button 
                        type="button" 
                        onClick={
                          () => playList(episodeList, index + latestEpisodes.length)
                        }
                      >
                        <img src="/play-green.svg" alt="Tocar" />
                      </button>
                    </td>
                  </tr>
                );
              }) }
            </tbody>
          </table>
      </section>
    </div>
  )
}

// SSR - Server side rendering
// export async function getServerSideProps() {
//   const response = await fetch('http://localhost:3333/episodes')
//   const data = await response.json()

//   return {
//     props: {
//       episodes: data,
//     }
//   };
// }

// SSG - Static Site generator
export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('/episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc',
    }
  })

  // Formatação dos dados dos episódios
  const episodes: Episodes[] = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      members: episode.members,
      thumbnail: episode.thumbnail,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {
        locale: ptBR,
      }),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      duration: Number(episode.file.duration),
      description: episode.description,
      url: episode.file.url,
    }
  })

  const latestEpisodes: Episodes[] = episodes.slice(0, 2)
  const allEpisodes: Episodes[] = episodes.slice(2, episodes.length)

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 * 8, // 8 horas
  };
}
