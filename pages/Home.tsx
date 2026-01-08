import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import GroupCompanies from '../components/GroupCompanies';
import Values from '../components/Values';
import Contact from '../components/Contact';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <GroupCompanies />
      <Values />
      <About />
      <Contact />
    </>
  );
};

export default Home;