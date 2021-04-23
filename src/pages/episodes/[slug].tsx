import Image from 'next/image'
import Link from 'next/link'
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/converter';

import styles from './episode.module.scss'

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
  episode: Episode
};

export default function Episode({ episode }: EpisodeProps) {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.episode}>
        <div className={styles.thumbnailContainer}>
          <Link href="/">
            <button type="button">
              <img src="/arrow-left.svg" alt="Voltar" />
            </button>
          </Link>

          <Image 
            width={700}
            height={360}
            src={episode.thumbnail}
            objectFit="cover"
          />

          <button type="button">
            <img src="/play.svg" alt="Tocar podcast"/>
          </button>
        </div>

        <header>
          <h1>{episode.title}</h1>
          <span>{episode.members}</span>
          <span>{episode.publishedAt}</span>
          <span>{episode.durationAsString}</span>
        </header>

        <div 
          className={styles.description} 
          dangerouslySetInnerHTML={{ __html: episode.description }} 
        />
      </div>
    </div>
  );
}

// Dinamic SSG - Static Site Generation
export const getStaticPaths: GetStaticPaths = async () => {
  /**
   * quais páginas deverão ser geradas de forma estática:
   * 1) Nenhuma página deve ser gerada estática no momento da build
   *  paths: []
   *  fallback: 'blocking'
   * 
   * 2) Se deseja gerar somente de uma página:
   *  paths: [
   *     { 
   *        params: {
   *          slug: '<slug da página>'
   *        }   
   *      }
   *  ]
   * 
   * 3) Se os paths estão vazios, o next não gerará nenhuma página estática,
   *  no entanto, se o fallback alterar o comportamento muda;
   * 
   *  3.1) fallback = false => Se a página for acessada pelo usuário e 
   *      esta não está nos paths, o next retorna error 404
   *  
   *  3.2) fallback = true => Se a página for acessada e esta não está no paths,
   *      o next fará uma requisição http do lado do client para buscar pela página
   * 
   *  3.3) fallback = blocking => roda a requisiçao do next e não do client.
   *      É o melhor a ser usado 
   */

  const { data } = await api.get('episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id
      }
    }
  })
  return {
    paths,
    fallback: 'blocking',
  };
}

// SSG - Static Site Generation
export const getStaticProps: GetStaticProps = async (ctx) => {
  const { slug } = ctx.params;
  const { data } = await api.get(`/episodes/${slug}`);

  const episode: Episode = {
    id: data.id,
    title: data.title,
    members: data.members,
    thumbnail: data.thumbnail,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', {
      locale: ptBR,
    }),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    duration: Number(data.file.duration),
    description: data.description,
    url: data.file.url,
  }

  return {
    props: {
      episode,
    },
    revalidate: 60 * 60 * 24, // 24 hours
  }
}