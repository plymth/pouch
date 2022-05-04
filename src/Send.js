import Input from './Input';
import Button from './Button';

export const Send = ({
  componentAddress,
  resourceAddress,
  amount,
  handleResourceAddressChange,
  handleComponentAddressChange,
  handleAmountChange,
  loading,
  send,
}) => {
  return (
    <div>
      {!loading && (
        <div className="App__send">
          <Input
            type="text"
            placeholder="Component Address"
            value={componentAddress}
            onChange={handleComponentAddressChange}
          />
          <Input
            type="text"
            placeholder="Resource Address"
            value={resourceAddress}
            onChange={handleResourceAddressChange}
          />
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={handleAmountChange}
          />
          <Button handleOnClick={send} title="Send" />
        </div>
      )}
    </div>
  );
};

export default Send;
