import { CopyToClipboard } from 'react-copy-to-clipboard';
import Identicon from 'react-identicons';
import './App.css';

export const Assets = ({
  resources,
  setResourceAddress,
  formatResourceAddress,
  notify,
}) => {
  return (
    <div className="App__asset-wrapper">
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

          <CopyToClipboard
            text={resource.resourceAddress}
            onCopy={() => notify('Copied resource address!')}
          >
            <div className="App__asset-address">
              {formatResourceAddress(resource.resourceAddress)}
            </div>
          </CopyToClipboard>
          <div className="App__asset-amount">{resource.amount}</div>
        </div>
      ))}
    </div>
  );
};

export default Assets;
