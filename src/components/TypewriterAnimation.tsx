
import Typewriter from 'typewriter-effect';

const phrases = [
  'exclusive insights to top events',
  'event sold out? here\'s your second chance',
  'can\'t make it anymore? sell your ticket quick',
  'connect with like-minded people',
  'innercircle: the home for event lovers'
];

export const TypewriterAnimation = () => {
  return (
    <div className="text-xl md:text-2xl text-gray-300 h-20 mt-4">
      <Typewriter
        options={{
          strings: phrases,
          autoStart: true,
          loop: true,
          delay: 50,
          deleteSpeed: 30,
        }}
      />
    </div>
  );
};
