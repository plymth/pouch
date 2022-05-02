import { useEffect, useState } from 'react';
import { DefaultApi, ManifestBuilder } from 'pte-sdk';
import { getAccountAddress, signTransaction } from 'pte-browser-extension-sdk';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Identicon from 'react-identicons';
import './App.css';

export const App = () => {
  const [accountAddress, setAccountAddress] = useState();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const [resourceAddress, setResourceAddress] = useState('');
  const [componentAddress, setComponentAddress] = useState('');
  const [amount, setAmount] = useState('');

  const formatResourceAddress = (resourceAddress) => {
    return `${resourceAddress.slice(0, 5)}...${resourceAddress.slice(-4)}`;
  };

  const handleResourceAddressChange = (event) => {
    setResourceAddress(event.target.value);
  };

  const handleComponentAddressChange = (event) => {
    setComponentAddress(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const send = async () => {
    if (!resourceAddress || !componentAddress || !amount) {
      return;
    }

    const manifest = new ManifestBuilder()
      .withdrawFromAccountByAmount(accountAddress, amount, resourceAddress)
      .callMethodWithAllResources(componentAddress, 'deposit_batch')
      .build()
      .toString();
    const receipt = await signTransaction(manifest);
    console.log(receipt.transactionHash);
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(true);
      (async () => {
        const api = new DefaultApi();
        const accountAddress = await getAccountAddress();

        setAccountAddress(accountAddress);

        const component = await api.getComponent({ address: accountAddress });
        setResources(component.ownedResources);
        setLoading(false);
      })();
    }, 100);
  }, []);

  return (
    <div className="App">
      {!loading && accountAddress && (
        <CopyToClipboard text={accountAddress}>
          <div className="App__wallet-address">
            <div>
              <Identicon
                string={accountAddress}
                size={30}
                className="App__wallet-identicon"
              />
            </div>

            <div>{formatResourceAddress(accountAddress)}</div>
          </div>
        </CopyToClipboard>
      )}

      <div className="App__header">pouch.</div>
      {loading && <div className="App__loader">Loading assets...</div>}

      {!loading && (
        <div className="App__payment">
          <div className="App__amount-input">
            <input
              type="text"
              placeholder="Component Address"
              value={componentAddress}
              onChange={handleComponentAddressChange}
            />
          </div>
          <div className="App__amount-input">
            <input
              type="text"
              placeholder="Resource Address"
              value={resourceAddress}
              onChange={handleResourceAddressChange}
            />
          </div>
          <div className="App__amount-input">
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={handleAmountChange}
            />
          </div>
          <button className="App__send-btn" onClick={() => send()}>
            Send
          </button>
        </div>
      )}

      <div className="App__asset-wrapper">
        {!loading && <div className="App__label">Assets</div>}
        {resources.map((resource) => (
          <div
            className="App__asset"
            onClick={() => setResourceAddress(resource.resourceAddress)}
            key={resource.resourceAddress}
          >
            <Identicon
              string={resource.resourceAddress}
              size={30}
              className="App__asset-identicon"
            />
            <div className="App__asset-symbol">{resource.symbol}</div>
            <div className="App__asset-address">
              {formatResourceAddress(resource.resourceAddress)}
            </div>
            <div className="App__asset-amount">{resource.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
