import React from 'react';

const About = () => {
  return (
    <div className="App__page">
      <p>
        Pouch is a simple wallet, which allows users to view, send and receive
        digital assets on the PTE API Service.
      </p>
      <p>
        In order to use Pouch you will need to download the{' '}
        <a
          href="https://docs.radixdlt.com/main/scrypto/public-test-environment/pte-getting-started.html"
          target="_blank"
        >
          PTE Browser Extension
        </a>
        .
      </p>
    </div>
  );
};

export default About;
