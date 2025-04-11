import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-neutral-800 text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {currentYear} Voice Recorder App. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
