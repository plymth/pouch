import { useEffect, useState } from 'react';
import { DefaultApi, ManifestBuilder } from 'pte-sdk';
import { getAccountAddress, signTransaction } from 'pte-browser-extension-sdk';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Identicon from 'react-identicons';
import Noty from 'noty';
import { Routes, Route, Link, Navigate, useParams } from 'react-router-dom';
import sha256 from 'crypto-js/sha256';
import Assets from './Assets';
import Send from './Send';
import Mint from './Mint';
import About from './About';
import Nfts from './Nfts';
import Rns from './Rns';
import User from './User';
import './App.css';
import {
  API_URL,
  RNS_RESOURCE_ADDRESS,
  RNS_COMPONENT_ADDRESS,
  POUCH_COMPONENT_ADDRESS,
  XRD_RESOURCE_ADDRESS,
  DEPOSIT_PER_YEAR,
  FEE_ADDRESS_UPDATE,
  FEE_RENEWAL_PER_YEAR
} from './constants';

export const App = () => {
  const fixedToken = {
    name: '',
    description: '',
    symbol: '',
    initial_supply: '',
  };

  const rns = {
    name: '',
    reserve_years: '',
  };

  const [accountAddress, setAccountAddress] = useState();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resourceAddress, setResourceAddress] = useState('');
  const [componentAddress, setComponentAddress] = useState('');
  const [token, setToken] = useState(fixedToken);
  const [amount, setAmount] = useState('');
  const [rnsParams, setRnsParams] = useState(rns);
  const [rnsName, setRnsName] = useState('');

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

  const handleRnsParamsChange = (event) => {
    setRnsParams({ ...rnsParams, [event.target.name]: event.target.value });
  };

  const clearSendForm = () => {
    setComponentAddress('');
    setResourceAddress('');
    setAmount('');
  };

  const clearMintForm = () => {
    setToken(fixedToken);
  };

  const clearRnsForm = () => {
    setRnsParams(rns);
  };

  const hashRns = (rns) => {
    const hashedName = sha256(rns).toString();
    const truncatedHash = hashedName.slice(0, 32);

    return truncatedHash.match(/.{2}/g).reverse().join('');
  };

  const send = async () => {
    if (!resourceAddress || !componentAddress || !amount) {
      return notify('Please complete all fields.', 'error');
    }

    if (isRns(componentAddress)) {
      const nonFungibleId = hashRns(componentAddress);

      try {
        const response = await fetch(
          `${API_URL}non-fungible/${RNS_RESOURCE_ADDRESS}${nonFungibleId}`
        );

        const nonFungibleData = await response.json();
        const struct = JSON.parse(nonFungibleData.mutable_data);
        const componentAddressField = struct.fields[0];
        const regex = /ComponentAddress\(\"(\w+)\"\)/g;
        const targetComponentAddress = [...componentAddressField.value.matchAll(regex)][0][1];

        const manifest = new ManifestBuilder()
          .withdrawFromAccountByAmount(accountAddress, amount, resourceAddress)
          .callMethodWithAllResources(targetComponentAddress, 'deposit_batch')
          .build()
          .toString();

        const receipt = await signTransaction(manifest);
        console.log(receipt.transactionHash);

        clearSendForm();
        fetchData();

        notify('Payment successfully sent!', 'success');

        return;
      } catch {
        return notify('Invalid RNS.', 'error');
      }
    }

    try {
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
    } catch {
      return notify('Transaction failed.', 'error');
    }
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

    try {
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
    } catch {
      return notify('Failed minting token', 'error');
    }
  };

  const registerRns = async () => {
    if (!rnsParams.name || rnsParams.reserve_years <= 0) {
      return notify('Please complete all mandatory fields.', 'error');
    }
    if (!validateRns(rnsParams.name)) {
      return notify(
        'RNS name must be in the following format e.g. satoshi.xrd',
        'error'
      );
    }

    try {
      const amount = DEPOSIT_PER_YEAR * rnsParams.reserve_years;

      const manifest = new ManifestBuilder()
        .withdrawFromAccountByAmount(
          accountAddress,
          amount,
          XRD_RESOURCE_ADDRESS
        )
        .takeFromWorktop(XRD_RESOURCE_ADDRESS, 'xrd')
        .callMethod(RNS_COMPONENT_ADDRESS, 'register_name', [
          `"${rnsParams.name}" ComponentAddress("${accountAddress}") ${rnsParams.reserve_years}u8 Bucket("xrd")`,
        ])
        .callMethodWithAllResources(accountAddress, 'deposit_batch')
        .build()
        .toString();

      console.log(manifest);

      const receipt = await signTransaction(manifest);
      console.log(receipt.transactionHash);

      clearRnsForm();
      fetchData();

      notify('RNS registration successful', 'success');
    } catch {
      return notify('Failed to register RNS', 'error');
    }
  };

  const fetchData = async () => {
    try {
      const accountAddress = await getAccountAddress();

      setAccountAddress(accountAddress);

      const response = await fetch(`${API_URL}component/${accountAddress}`);
      const component = await response.json();

      setResources(component.owned_resources);

      const rnsResource = component.owned_resources.find(
        (resource) => resource.resource_address === RNS_RESOURCE_ADDRESS
      );

      if (rnsResource) {
        const nonFungibleId = rnsResource.non_fungible_ids[0];
        const response = await fetch(
          `${API_URL}non-fungible/${RNS_RESOURCE_ADDRESS}${nonFungibleId}`
        );
        const nonFungibleData = await response.json();
        const struct = JSON.parse(nonFungibleData.mutable_data);
        const fields = struct.fields;
        const rns = fields.find((f) => f.type == 'String').value;
        setRnsName(rns);
      }
    } catch {
      notify('Something went wrong', 'error');
    }

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

  const isRns = (str) => {
    return str.includes('.xrd');
  };

  const validateRns = (str) => {
    return /^[\w]+.xrd$/.test(str);
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
            <Link to="/rns">RNS</Link>
          </div>
          <div className="App__menu-item">
            <Link to="/about">About</Link>
          </div>
        </div>
        {!loading && accountAddress && (
          <div className="App__wallet-address">
            <div className="App__network">pte01.radixdlt.com</div>
            <CopyToClipboard
              text={rnsName ? rnsName : accountAddress}
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
                {rnsName && <div>{rnsName}</div>}
                {!rnsName && <div>{formatResourceAddress(accountAddress)}</div>}
              </div>
            </CopyToClipboard>
          </div>
        )}
      </div>

      <div className="App__title">
        <Link to="/">pouch</Link>
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
          path="/rns"
          element={
            <Rns
              rnsParams={rnsParams}
              registerRns={registerRns}
              handleRnsParamsChange={handleRnsParamsChange}
            />
          }
        />
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
        <Route
          path="/users/:userRns"
          element={
            <User
              loading={loading}
              notify={notify}
              setResourceAddress={setResourceAddress}
              formatResourceAddress={formatResourceAddress}
              hashRns={hashRns}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
