
import Typewriter from 'typewriter-effect';

const phrases = [
  'the ultimate insider platform for event lovers',
  'connect with like-minded people',
  'event sold out? here\'s your second chance',
  'can\'t make it anymore? sell your ticket quick',
  'exclusive insights to top events'
];

export const TypewriterAnimation = () => {
  return (
    <div className="text-xl md:text-2xl text-gray-300 h-20 mt-4 font-satoshi">
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
