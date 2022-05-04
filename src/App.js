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
import About from './About';
import Nfts from './Nfts';
import './App.css';

export const App = () => {
  const [accountAddress, setAccountAddress] = useState();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const [resourceAddress, setResourceAddress] = useState('');
  const [componentAddress, setComponentAddress] = useState('');
  const [amount, setAmount] = useState('');

  const POUCH_COMPONENT_ADDRESS =
    '02f397bfa77a1b7319c2071535579cfa7ecfcb51b3cc1b32212090';

  const fixedToken = {
    name: '',
    description: '',
    symbol: '',
    initial_supply: '',
  };

  const [token, setToken] = useState(fixedToken);

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

  const handleTokenChange = (event) => {
    setToken({ ...token, [event.target.name]: event.target.value });
  };

  const clearSendForm = () => {
    setComponentAddress('');
    setResourceAddress('');
    setAmount('');
  };

  const clearMintForm = () => {
    setToken(fixedToken);
  };

  const send = async () => {
    if (!resourceAddress || !componentAddress || !amount) {
      return notify('Please complete all fields.', 'error');
    }

    const manifest = new ManifestBuilder()
      .withdrawFromAccountByAmount(accountAddress, amount, resourceAddress)
      .callMethodWithAllResources(componentAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);
    console.log(receipt.transactionHash);

    clearSendForm();
    fetchData();

    notify('Payment successfully sent!', 'success');
  };

  const mint = async () => {
    if (
      !token.name ||
      !token.description ||
      !token.symbol ||
      !token.total_supply <= 0
    ) {
      return notify('Please complete all mandatory fields.', 'error');
    }

    const manifest = new ManifestBuilder()
      .callMethod(POUCH_COMPONENT_ADDRESS, 'mint', [
        `"${token.name}" "${token.symbol}" "${token.description}" Decimal("${token.initial_supply}")`,
      ])
      .callMethodWithAllResources(accountAddress, 'deposit_batch')
      .build()
      .toString();

    const receipt = await signTransaction(manifest);
    console.log(receipt.transactionHash);

    clearMintForm();
    fetchData();

    notify('Token successfully minted!', 'success');
  };

  const fetchData = async () => {
    const api = new DefaultApi();
    const accountAddress = await getAccountAddress();

    setAccountAddress(accountAddress);

    const component = await api.getComponent({ address: accountAddress });
    setResources(component.ownedResources);
    setLoading(false);
  };

  const notify = (message, type) => {
    new Noty({
      theme: 'nest',
      type: type,
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
      <div className="App__header">
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
          <div className="App__menu-item">
            <Link to="/nfts">NFTs</Link>
          </div>
          <div className="App__menu-item">
            <Link to="/about">About</Link>
          </div>
        </div>
        {!loading && accountAddress && (
          <div className="App__wallet-address">
            <div className="App__network">pte01.radixdlt.com</div>
            <CopyToClipboard
              text={accountAddress}
              onCopy={() => notify('Copied account address!', 'success')}
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
      </div>

      <div className="App__title">
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
        <Route
          path="/mint"
          element={
            <Mint
              token={token}
              loading={loading}
              handleTokenChange={handleTokenChange}
              mint={mint}
            />
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/nfts" element={<Nfts />} />
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
