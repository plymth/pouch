import { useEffect, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Identicon from 'react-identicons';
import { useParams, Navigate } from 'react-router-dom';
import './App.css';
import { API_URL, RNS_RESOURCE_ADDRESS } from './constants';

export const User = ({ formatResourceAddress, notify, hashRns }) => {
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [userResources, setUserResources] = useState([]);

  const fetchData = async () => {
    try {
      const nonFungibleId = hashRns(params.userRns);
      const response = await fetch(
        `${API_URL}non-fungible/${RNS_RESOURCE_ADDRESS}${nonFungibleId}`
      );
      const nonFungibleData = await response.json();
      const struct = JSON.parse(nonFungibleData.mutable_data);
      const componentAddressField = struct.fields[0];
      const regex = /ComponentAddress\(\"(\w+)\"\)/g;
      const targetComponentAddress = [
        ...componentAddressField.value.matchAll(regex),
      ][0][1];

      const res = await fetch(`${API_URL}component/${targetComponentAddress}`);
      const component = await res.json();

      setUserResources(component.owned_resources);
    } catch {
      return <Navigate to="https://google.com" />;
    }

    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(true);
      fetchData();
    }, 100);
  }, [params.userRns]);

  return (
    <div className="App__asset-wrapper">
      {!loading && <div className="App__rns">{params.userRns}</div>}
      {!loading &&
        userResources.map((resource) => (
          <div className="App__asset" key={resource.resource_address}>
            <Identicon
              string={resource.resource_address}
              size={30}
              className="App__asset-identicon"
            />
            <div className="App__asset-symbol">{resource.symbol}</div>

            <div className="App__asset-address">{resource.name}</div>

            <CopyToClipboard
              text={resource.resource_address}
              onCopy={() => notify('Copied resource address!', 'success')}
            >
              <div className="App__asset-address">
                {formatResourceAddress(resource.resource_address)}
              </div>
            </CopyToClipboard>
            <div className="App__asset-amount">{resource.amount}</div>
          </div>
        ))}
    </div>
  );
};

export default User;
