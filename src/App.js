import { useEffect, useState } from 'react';
import { DefaultApi, ManifestBuilder } from 'pte-sdk';
import { getAccountAddress, signTransaction } from 'pte-browser-extension-sdk';
import Identicon from 'react-identicons';
import './App.css';

export const App = () => {
  const [accountAddress, setAccountAddress] = useState();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoading(true);
      (async () => {
        const api = new DefaultApi();
        const accountAddress = await getAccountAddress();

        setAccountAddress(
          `${accountAddress.slice(0, 5)}...${accountAddress.slice(-4)}`
        );

        const component = await api.getComponent({ address: accountAddress });
        setResources(component.ownedResources);
        setLoading(false);
      })();
    }, 100);
  }, []);

  return (
    <div className="App">
      {!loading && (
        <div className="App__wallet-address">
          <div>
            <Identicon
              string={accountAddress}
              size={30}
              className="App__wallet-identicon"
            />
          </div>
          <div>{accountAddress ?? accountAddress}</div>
        </div>
      )}

      <div className="App__header">pouch.</div>
      {loading && <div className="App__loader">Loading assets...</div>}

      <div className="App__asset-wrapper">
        {resources.map((resource) => (
          <div className="App__asset">
            <Identicon
              string={resource.resourceAddress}
              size={30}
              className="App__asset-identicon"
            />
            <div className="App__asset-symbol">{resource.symbol}</div>
            <div className="App__asset-address">{resource.resourceAddress}</div>
            <div className="App__asset-amount">{resource.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
