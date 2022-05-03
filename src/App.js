import { useEffect, useState } from 'react';
import { DefaultApi, ManifestBuilder } from 'pte-sdk';
import { getAccountAddress, signTransaction } from 'pte-browser-extension-sdk';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Identicon from 'react-identicons';
import Noty from 'noty';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import Assets from './Assets';
import Send from './Send';
import Mint from './Mint';
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

  const clearForm = () => {
    setComponentAddress('');
    setResourceAddress('');
    setAmount('');
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

    clearForm();
    fetchData();
  };

  const fetchData = async () => {
    const api = new DefaultApi();
    const accountAddress = await getAccountAddress();

    setAccountAddress(accountAddress);

    const component = await api.getComponent({ address: accountAddress });
    setResources(component.ownedResources);
    setLoading(false);
  };

  const notify = (message) => {
    new Noty({
      theme: 'nest',
      type: 'success',
      progressBar: true,
      timeout: 1000,
      text: message,
    }).show();
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(true);
      fetchData();
    }, 100);
  }, []);

  return (
    <div className="App">
      {!loading && accountAddress && (
        <div className="App__wallet-address">
          <div className="App__menu">
            <div className="App__menu-item">
              <Link to="/">Assets</Link>
            </div>
            <div className="App__menu-item">
              <Link to="/send">Send</Link>
            </div>
            <div className="App__menu-item">
              <Link to="/mint">Mint</Link>
            </div>
          </div>

          <CopyToClipboard
            text={accountAddress}
            onCopy={() => notify('Copied account address!')}
          >
            <div className="App__wallet-address-wrapper">
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
        </div>
      )}

      <div className="App__header">
        <Link to="/">pouch.</Link>
      </div>
      {loading && <div className="App__loader">Loading assets...</div>}
      <Routes>
        <Route
          path="/"
          element={
            <Assets
              resources={resources}
              loading={loading}
              notify={notify}
              setResourceAddress={setResourceAddress}
              formatResourceAddress={formatResourceAddress}
            />
          }
        />
        <Route path="/mint" element={<Mint />} />
        <Route
          path="/send"
          element={
            <Send
              componentAddress={componentAddress}
              resourceAddress={resourceAddress}
              amount={amount}
              handleResourceAddressChange={handleResourceAddressChange}
              handleComponentAddressChange={handleComponentAddressChange}
              handleAmountChange={handleAmountChange}
              loading={loading}
              send={send}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
