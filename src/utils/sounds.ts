import useSound from 'use-sound';

// Sound effect hook configurations
export const useSoundEffects = () => {
  const [playCorrect] = useSound('/sounds/correct.mp3');
  const [playWrong] = useSound('/sounds/wrong.mp3');
  const [playClick] = useSound('/sounds/click.mp3');
  const [playSuccess] = useSound('/sounds/success.mp3');
  const [playAchievement] = useSound('/sounds/achievement.mp3');

  return {
    playCorrect,
    playWrong,
    playClick,
    playSuccess,
    playAchievement,
  };
};

// Sound effect management
export const preloadSounds = () => {
  const soundFiles = [
    '/sounds/correct.mp3',
    '/sounds/wrong.mp3',
    '/sounds/click.mp3',
    '/sounds/success.mp3',
    '/sounds/achievement.mp3',
  ];

  soundFiles.forEach(url => {
    const audio = new Audio();
    audio.src = url;
  });
};
