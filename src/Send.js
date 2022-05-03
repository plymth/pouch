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
    </div>
  );
};

export default Send;
