import { useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';

import { PlayerContext, usePlayer } from '../../contexts/PlayerContext';

import 'rc-slider/assets/index.css';
import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/converter';

export default function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const { 
    episodes, 
    currentEpisodeIndex, 
    isPlaying,
    isLooping,
    isShuffling,
    hasNext,
    hasPrevious,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    playNext,
    playPrevious,
    clearPlayerState,
  } = usePlayer();

  const episode = episodes[currentEpisodeIndex];

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);


  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current.currentTime));
    })
  }

  function onChangeProgress(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext()
    } else {
      clearPlayerState();
    }
  }

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora"/>
        <strong>Tocando agora</strong>
      </header>

      { episode ? (
        <div className={styles.currentEpisode}>
          <Image 
            width={592} 
            height={592} 
            src={episode?.thumbnail}
            objectFit="cover"
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.emptyFooter : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            { episode ? (
              <Slider 
                max={episode.duration}
                value={progress}
                onChange={onChangeProgress}
                trackStyle={{ backgroundColor: '#04d361'}}
                railStyle={{ backgroundColor: '#9f75ff'}}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4}}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.duration || 0)}</span>
        </div>

        { episode && (
          <audio 
            src={episode.url} 
            ref={audioRef}
            autoPlay 
            onEnded={handleEpisodeEnded}
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            loop={isLooping}
            onLoadedMetadata={() => setupProgressListener()}
          />
        )}
        
        <div className={styles.controls}>
          <button 
            type="button" 
            disabled={!episode || episodes.length === 1}
            onClick={() => toggleShuffle()}
            className={isShuffling ? styles.isActive : ''}
          >
            <img src="/shuffle.svg" alt="Shuffle" />
          </button>
          <button 
            type="button" 
            disabled={!episode || !hasPrevious}
            onClick={() => playPrevious()}
          >
            <img src="/play-previous.svg" alt="Previous" />
          </button>
          <button 
            type="button" 
            className={styles.playControl} 
            disabled={!episode}
            onClick={() => togglePlay()}
          >
            { isPlaying ? (
              <img src="/pause.svg" alt="Player" />
            ) : (
              <img src="/play.svg" alt="Player" />
            )}
          </button>
          <button 
            type="button" 
            disabled={!episode || !hasNext}
            onClick={playNext}
          >
            <img src="/play-next.svg" alt="Next" />
          </button>
          <button 
            type="button" 
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ''}
          >
            <img src="/repeat.svg" alt="Repeat" />
          </button>
        </div>
      </footer>
    </div>
  );
}