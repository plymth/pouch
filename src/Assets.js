import { CopyToClipboard } from 'react-copy-to-clipboard';
import Identicon from 'react-identicons';
import './App.css';

export const Assets = ({
  resources,
  setResourceAddress,
  formatResourceAddress,
  notify,
  loading,
}) => {
  return (
    <div className="App__asset-wrapper">
      {!loading &&
        resources.map((resource) => (
          <div
            className="App__asset"
            onClick={() => setResourceAddress(resource.resource_address)}
            key={resource.resource_address}
          >
            <Identicon
              string={resource.resource_address}
              size={30}
              className="App__asset-identicon"
            />
            <div className="App__asset-symbol">{resource.symbol}</div>

            <div className="App__asset-address">
                {resource.name}
              </div>

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

export default Assets;
